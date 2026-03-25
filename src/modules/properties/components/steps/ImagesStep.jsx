// src/modules/properties/components/steps/ImagesStep.jsx
import React, { useCallback, useState } from 'react';
import { Upload, Camera, Image as ImageIcon, X, Check, Plus, Video, Play } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import './ImagesStep.css';

const ImagesStep = ({ formData, updateFormData }) => {
  const [uploading, setUploading] = useState(false);
  const [mediaType, setMediaType] = useState('images'); // 'images' or 'videos'

  const handleMediaUpload = async (files, type) => {
    setUploading(true);
    const uploadedMedia = [];
    
    for (const file of files) {
      try {
        // Create a temporary object for preview
        const objectUrl = URL.createObjectURL(file);
        
        uploadedMedia.push({
          file: file,
          preview: objectUrl,
          name: file.name,
          size: file.size,
          type: type, // 'image' or 'video'
          uploadedAt: new Date().toISOString(),
          needsUpload: true
        });
        
      } catch (error) {
        console.error(`Error processing ${type}:`, error);
        alert(`Failed to process ${file.name}`);
      }
    }
    
    if (type === 'images') {
      updateFormData({
        images: [...formData.images, ...uploadedMedia]
      });
    } else {
      updateFormData({
        videos: [...(formData.videos || []), ...uploadedMedia]
      });
    }
    
    setUploading(false);
  };

  const removeMedia = (index, type) => {
    if (type === 'images') {
      const newImages = [...formData.images];
      const removed = newImages.splice(index, 1)[0];
      if (removed.preview && removed.preview.startsWith('blob:')) {
        URL.revokeObjectURL(removed.preview);
      }
      updateFormData({ images: newImages });
    } else {
      const newVideos = [...(formData.videos || [])];
      const removed = newVideos.splice(index, 1)[0];
      if (removed.preview && removed.preview.startsWith('blob:')) {
        URL.revokeObjectURL(removed.preview);
      }
      updateFormData({ videos: newVideos });
    }
  };

  const onDropImages = useCallback((acceptedFiles) => {
    handleMediaUpload(acceptedFiles, 'images');
  }, [formData.images]);

  const onDropVideos = useCallback((acceptedFiles) => {
    handleMediaUpload(acceptedFiles, 'videos');
  }, [formData.videos]);

  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps, isDragActive: isImageDragActive } = useDropzone({
    onDrop: onDropImages,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxSize: 5 * 1024 * 1024,
    multiple: true
  });

  const { getRootProps: getVideoRootProps, getInputProps: getVideoInputProps, isDragActive: isVideoDragActive } = useDropzone({
    onDrop: onDropVideos,
    accept: {
      'video/*': ['.mp4', '.mov', '.webm', '.avi']
    },
    maxSize: 50 * 1024 * 1024, // 50MB for videos
    multiple: true
  });

  const getVideoThumbnail = (videoFile) => {
    // Return a video element or thumbnail
    return <video src={videoFile.preview} className="preview-video" muted />;
  };

  return (
    <div className="images-step">
      <div className="step-header">
        <h2>Property Media</h2>
        <p className="step-description">
          Upload clear photos and videos of your property. First image will be the cover photo.
          Recommended: 5-10 images and 1-2 videos showing all rooms and features.
        </p>
      </div>

      {/* Media Type Tabs */}
      <div className="media-tabs">
        <button
          className={`tab-btn ${mediaType === 'images' ? 'active' : ''}`}
          onClick={() => setMediaType('images')}
        >
          <ImageIcon size={18} /> Images ({formData.images?.length || 0})
        </button>
        <button
          className={`tab-btn ${mediaType === 'videos' ? 'active' : ''}`}
          onClick={() => setMediaType('videos')}
        >
          <Video size={18} /> Videos ({formData.videos?.length || 0})
        </button>
      </div>

      {/* Images Upload Zone */}
      {mediaType === 'images' && (
        <div className="upload-zone">
          <div
            {...getImageRootProps()}
            className={`dropzone ${isImageDragActive ? 'active' : ''}`}
          >
            <input {...getImageInputProps()} />
            <Upload size={48} />
            <h3>Drag & Drop Images Here</h3>
            <p>or click to browse files</p>
            <p className="upload-info">
              Supports JPG, PNG, WebP • Max 5MB per image
            </p>
            <button type="button" className="btn btn-outline">
              Browse Images
            </button>
          </div>
        </div>
      )}

      {/* Videos Upload Zone */}
      {mediaType === 'videos' && (
        <div className="upload-zone">
          <div
            {...getVideoRootProps()}
            className={`dropzone ${isVideoDragActive ? 'active' : ''}`}
          >
            <input {...getVideoInputProps()} />
            <Video size={48} />
            <h3>Drag & Drop Videos Here</h3>
            <p>or click to browse files</p>
            <p className="upload-info">
              Supports MP4, MOV, WebM • Max 50MB per video
            </p>
            <button type="button" className="btn btn-outline">
              Browse Videos
            </button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <p>Uploading media...</p>
        </div>
      )}

      {/* Images Preview */}
      {formData.images?.length > 0 && mediaType === 'images' && (
        <div className="images-preview-section">
          <h3>
            <ImageIcon size={20} />
            Uploaded Images ({formData.images.length})
            <span className="image-note">First image = Cover photo</span>
          </h3>
          
          <div className="images-grid">
            {formData.images.map((image, index) => (
              <div key={index} className="image-preview-card">
                <div className="image-container">
                  <img 
                    src={image.url || image.preview}
                    alt={`Property ${index + 1}`}
                    className="preview-image"
                  />
                  {index === 0 && <div className="cover-badge">Cover</div>}
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeMedia(index, 'images')}
                  >
                    <X size={16} />
                  </button>
                  <div className="image-overlay">
                    <span className="image-number">{index + 1}</span>
                    <button
                      type="button"
                      className="move-btn"
                      onClick={() => {
                        if (index > 0) {
                          const newImages = [...formData.images];
                          [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
                          updateFormData({ images: newImages });
                        }
                      }}
                      disabled={index === 0}
                    >
                      ↑
                    </button>
                  </div>
                </div>
                <div className="image-info">
                  <span className="image-name">
                    {image.name?.substring(0, 20) || `Image ${index + 1}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Videos Preview */}
      {formData.videos?.length > 0 && mediaType === 'videos' && (
        <div className="videos-preview-section">
          <h3>
            <Video size={20} />
            Uploaded Videos ({formData.videos.length})
          </h3>
          
          <div className="videos-grid">
            {formData.videos.map((video, index) => (
              <div key={index} className="video-preview-card">
                <div className="video-container">
                  <video 
                    src={video.url || video.preview}
                    className="preview-video"
                    muted
                  />
                  <div className="play-icon-overlay">
                    <Play size={24} />
                  </div>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeMedia(index, 'videos')}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="video-info">
                  <span className="video-name">
                    {video.name?.substring(0, 20) || `Video ${index + 1}`}
                  </span>
                  <span className="video-size">
                    {video.size ? `${(video.size / 1024 / 1024).toFixed(2)}MB` : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="media-tips">
        <h4>📸 Media Tips for Better Results:</h4>
        <div className="tips-grid">
          <div className="tip"><Check size={16} /><span>Use natural daylight</span></div>
          <div className="tip"><Check size={16} /><span>Show all rooms clearly</span></div>
          <div className="tip"><Check size={16} /><span>Include property exterior</span></div>
          <div className="tip"><Check size={16} /><span>Show amenities and features</span></div>
          <div className="tip"><Check size={16} /><span>Short videos (30-60 sec) walkthroughs</span></div>
          <div className="tip"><Check size={16} /><span>Multiple angles of each room</span></div>
        </div>
      </div>
    </div>
  );
};

export default ImagesStep;