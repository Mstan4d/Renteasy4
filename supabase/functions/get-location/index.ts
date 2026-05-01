// supabase/functions/get-location/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             ''

    if (ip.includes(',')) ip = ip.split(',')[0].trim()
    if (ip === '::1') ip = '127.0.0.1'

    // For localhost testing, use a Lagos IP
    if (ip === '127.0.0.1' || ip === 'localhost') {
      ip = '6.45.207.70' // example IP in Lagos
    }

    const url = `http://ip-api.com/json/${ip}?fields=status,message,country,city,regionName,lat,lon`
    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'success') {
      return new Response(
        JSON.stringify({ error: 'Location detection failed', details: data }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        city: data.city,
        state: data.regionName,
        country: data.country,
        lat: data.lat,
        lng: data.lon,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})