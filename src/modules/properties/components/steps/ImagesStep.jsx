// src/modules/properties/components/steps/ImagesStep.jsx
import React, { useCallback } from 'react';
import { Upload, Camera, Image as ImageIcon, X, Check } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import './ImagesStep.css';

const ImagesStep = ({ formData, updateFormData }) => {
  const imageGroups = [
    { 
      key: 'kitchen', 
      label: 'Kitchen', 
      description: 'Kitchen area, appliances, cabinets' 
    },
    { 
      key: 'dining', 
      label: 'Living/Dining Area', 
      description: 'Living room, dining area, furniture' 
    },
    { 
      key: 'outside', 
      label: 'Exterior/Compound', 
      description: 'Building exterior, compound, parking' 
    },
    { 
      key: 'inside', 
      label: 'Bedrooms & Interior', 
      description: 'Bedrooms, bathrooms, interior spaces' 
    },
    { 
      key: 'other', 
      label: 'Other Areas', 
      description: 'Balcony, study, storage, amenities' 
    }
  ];

  // Handle image upload for a specific group
  const handleImageUpload = (groupKey, files) => {
    const newImages = [...formData.images[groupKey]];
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = {
            id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            url: e.target.result,
            file: file,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString()
          };
          
          newImages.push(imageData);
          
          // Update form data
          updateFormData({
            images: {
              ...formData.images,
              [groupKey]: newImages
            }
          });
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Remove an image from a group
  const removeImage = (groupKey, imageId) => {
    const filteredImages = formData.images[groupKey].filter(img => img.id !== imageId);
    updateFormData({
      images: {
        ...formData.images,
        [groupKey]: filteredImages
      }
    });
  };

  // Drag and drop setup
  const onDrop = useCallback((acceptedFiles, groupKey) => {
    handleImageUpload(groupKey, acceptedFiles);
  }, [formData.images]);

  return (
    <div className="images-step">
      <div className="step-header">
        <h2>Property Images</h2>
        <p className="step-description">
          Upload clear, high-quality photos organized by room/area.
          Good images attract more serious tenants.
        </p>
      </div>

      {/* Image Upload Guidelines */}
      <div className="upload-guidelines">
        <div className="guideline-card">
          <Camera size={20} />
          <div>
            <h4>Image Requirements</h4>
            <ul>
              <li>Minimum 5 photos recommended</li>
              <li>Use good lighting and clear angles</li>
              <li>Show all important areas</li>
              <li>Max file size: 5MB per image</li>
              <li>Supported formats: JPG, PNG, WebP</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Image Upload Groups */}
      <div className="image-groups-container">
        {imageGroups.map(group => {
          const { getRootProps, getInputProps, isDragActive } = useDropzone({
            onDrop: (files) => onDrop(files, group.key),
            accept: {
              'image/*': ['.jpeg', '.jpg', '.png', '.webp']
            },
            maxSize: 5 * 1024 * 1024, // 5MB
            multiple: true
          });

          const images = formData.images[group.key];
          
          return (
            <div key={group.key} className="image-group-card">
              <div className="group-header">
                <div className="group-info">
                  <h3>{group.label}</h3>
                  <p className="group-description">{group.description}</p>
                </div>
                <div className="image-count">
                  <Check size={16} />
                  <span>{images.length} image{images.length !== 1 ? 's' : ''} uploaded</span>
                </div>
              </div>

              <div className="upload-area">
                {/* Upload Zone */}
                <div
                  {...getRootProps()}
                  className={`dropzone ${isDragActive ? 'active' : ''} ${images.length > 0 ? 'has-images' : ''}`}
                >
                  <input {...getInputProps()} />
                  
                  {images.length === 0 ? (
                    <div className="upload-placeholder">
                      <Upload size={40} />
                      <p>{isDragActive ? 'Drop images here...' : 'Drag & drop images or click to browse'}</p>
                      <small>Upload {group.label.toLowerCase()} photos</small>
                    </div>
                  ) : (
                    <div className="upload-action">
                      <Upload size={24} />
                      <p>Add more {group.label.toLowerCase()} images</p>
                    </div>
                  )}
                </div>

                {/* Image Previews */}
                {images.length > 0 && (
                  <div className="image-previews">
                    {images.map((image, index) => (
                      <div key={image.id} className="image-preview">
                        <img 
                          src={image.url} 
                          alt={`${group.label} ${index + 1}`}
                          className="preview-image"
                        />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => removeImage(group.key, image.id)}
                          title="Remove image"
                        >
                          <X size={16} />
                        </button>
                        <div className="image-info">
                          <span className="image-name">
                            {image.name.length > 15 ? `${image.name.substring(0, 15)}...` : image.name}
                          </span>
                          <span className="image-size">
                            {(image.size / 1024 / 1024).toFixed(2)}MB
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upload Tips */}
              {images.length === 0 && (
                <div className="upload-tips">
                  <small>
                    <strong>Tip:</strong> Include {group.description.toLowerCase()}.
                    Multiple angles help tenants understand the space better.
                  </small>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Image Summary */}
      <div className="images-summary">
        <div className="summary-card">
          <ImageIcon size={20} />
          <div className="summary-content">
            <h4>Total Images Uploaded</h4>
            <div className="image-stats">
              {imageGroups.map(group => {
                const count = formData.images[group.key].length;
                return (
                  <div key={group.key} className="stat-item">
                    <span className="stat-label">{group.label}:</span>
                    <span className={`stat-count ${count > 0 ? 'has-images' : 'no-images'}`}>
                      {count} {count === 1 ? 'image' : 'images'}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="total-count">
              <strong>Total:</strong> 
              <span className="total-number">
                {Object.values(formData.images).reduce((sum, arr) => sum + arr.length, 0)} images
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Image Quality Check */}
      <div className="quality-check">
        <h4>Image Quality Checklist:</h4>
        <div className="checklist">
          <div className="check-item">
            <Check size={16} />
            <span>All major rooms are covered</span>
          </div>
          <div className="check-item">
            <Check size={16} />
            <span>Images are well-lit and clear</span>
          </div>
          <div className="check-item">
            <Check size={16} />
            <span>No blurry or dark photos</span>
          </div>
          <div className="check-item">
            <Check size={16} />
            <span>Property features are visible</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagesStep;