// src/modules/properties/components/steps/ImagesStep.jsx - UPDATED FOR SUPABASE
import React, { useCallback, useState } from 'react';
import { Upload, Camera, Image as ImageIcon, X, Check, Plus } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../../../../shared/lib/supabaseClient';

const ImagesStep = ({ formData, updateFormData }) => {
  const [uploading, setUploading] = useState(false);

// In ImagesStep.jsx, update handleImageUpload function
const handleImageUpload = async (files) => {
  setUploading(true);
  const uploadedImages = [];
  
  for (const file of files) {
    try {
      // Create a temporary object for preview
      const objectUrl = URL.createObjectURL(file);
      
      uploadedImages.push({
        file: file, // Keep the file object for upload
        preview: objectUrl, // Temporary blob URL for preview
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        // Add a flag to indicate it needs to be uploaded
        needsUpload: true
      });
      
    } catch (error) {
      console.error('Error processing image:', error);
      alert(`Failed to process ${file.name}`);
    }
  }
  
  // Update form data
  updateFormData({
    images: [...formData.images, ...uploadedImages]
  });
  
  setUploading(false);
};
  // Remove image
  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    updateFormData({ images: newImages });
  };

  // Drag and drop
  const onDrop = useCallback((acceptedFiles) => {
    handleImageUpload(acceptedFiles);
  }, [formData.images]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true
  });

  return (
    <div className="images-step">
      <div className="step-header">
        <h2>Property Images</h2>
        <p className="step-description">
          Upload clear photos of your property. First image will be the cover photo.
          Recommended: 5-10 images showing all rooms and features.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="upload-zone">
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'active' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload size={48} />
          <h3>Drag & Drop Images Here</h3>
          <p>or click to browse files</p>
          <p className="upload-info">
            Supports JPG, PNG, WebP • Max 5MB per image
          </p>
          <button type="button" className="btn btn-outline">
            Browse Files
          </button>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <p>Uploading images...</p>
        </div>
      )}

      {/* Image Previews */}
      {formData.images.length > 0 && (
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
                    src={image.url} 
                    alt={`Property ${index + 1}`}
                    className="preview-image"
                  />
                  {index === 0 && (
                    <div className="cover-badge">Cover</div>
                  )}
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeImage(index)}
                    title="Remove image"
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
                  <span className="image-size">
                    {image.size ? `${(image.size / 1024 / 1024).toFixed(2)}MB` : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Tips */}
      <div className="image-tips">
        <h4>📸 Image Tips for Better Results:</h4>
        <div className="tips-grid">
          <div className="tip">
            <Check size={16} />
            <span>Use natural daylight</span>
          </div>
          <div className="tip">
            <Check size={16} />
            <span>Show all rooms clearly</span>
          </div>
          <div className="tip">
            <Check size={16} />
            <span>Include property exterior</span>
          </div>
          <div className="tip">
            <Check size={16} />
            <span>Show amenities and features</span>
          </div>
          <div className="tip">
            <Check size={16} />
            <span>Clean and tidy spaces</span>
          </div>
          <div className="tip">
            <Check size={16} />
            <span>Multiple angles of each room</span>
          </div>
        </div>
      </div>

      {/* Test Images Button (for development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="test-images">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              const testImages = [
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
                'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
                'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80',
                'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
                'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&q=80'
              ].map((url, index) => ({
                url,
                name: `Test Image ${index + 1}.jpg`,
                size: 1024 * 1024,
                uploadedAt: new Date().toISOString()
              }));
              
              updateFormData({ images: testImages });
              alert('Test images added!');
            }}
          >
            Add Test Images (Dev Only)
          </button>
        </div>
      )}
    </div>
  );
};

export default ImagesStep;