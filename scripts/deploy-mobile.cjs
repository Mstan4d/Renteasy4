// scripts/deploy-mobile.js
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');

// ========== CONFIGURATION ==========
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for inserting
const BUILD_DIR = path.join(__dirname, '../dist'); // adjust if your build output is 'build'
const UPDATE_TYPE = process.env.UPDATE_TYPE || 'live'; // can be 'live' or 'native'
const VERSION_CODE = process.env.VERSION_CODE || new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
const CRITICAL = process.env.UPDATE_CRITICAL === 'true' ? true : false;

// ========== HELPERS ==========
async function zipBuild() {
  const zipPath = path.join(__dirname, `../update-${VERSION_CODE}.zip`);
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', () => resolve(zipPath));
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(BUILD_DIR, false);
    archive.finalize();
  });
}

async function uploadToSupabaseStorage(filePath) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const fileContent = fs.readFileSync(filePath);
  const bucketName = 'app-updates';
  const fileName = `updates/${path.basename(filePath)}`;

  // Ensure bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets.find(b => b.name === bucketName)) {
    await supabase.storage.createBucket(bucketName, { public: true });
  }

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, fileContent, { contentType: 'application/zip', upsert: true });

  if (error) throw error;

  const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);
  return urlData.publicUrl;
}

async function insertUpdateRecord(downloadUrl) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { error } = await supabase
    .from('app_updates')
    .insert({
      update_type: UPDATE_TYPE,
      version_code: VERSION_CODE,
      download_url: downloadUrl,
      critical: CRITICAL,
    });
  if (error) throw error;
  console.log(`✅ Update record inserted: ${UPDATE_TYPE} - ${VERSION_CODE}`);
}

// ========== MAIN ==========
(async () => {
  try {
    console.log('📦 Zipping build folder...');
    const zipFile = await zipBuild();
    console.log(`✅ Zip created: ${zipFile}`);

    console.log('☁️ Uploading to Supabase Storage...');
    const publicUrl = await uploadToSupabaseStorage(zipFile);
    console.log(`✅ Uploaded: ${publicUrl}`);

    console.log('📝 Registering update in Supabase...');
    await insertUpdateRecord(publicUrl);

    // Clean up local zip
    fs.unlinkSync(zipFile);
    console.log('🎉 Mobile update deployment complete!');
  } catch (err) {
    console.error('❌ Deployment failed:', err);
    process.exit(1);
  }
})();