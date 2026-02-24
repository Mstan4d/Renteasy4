// Create a new file: src/shared/components/PropertyImage.jsx
import React, { useState } from 'react';

const PropertyImage = ({ 
  src, 
  alt, 
  className = '',
  fallbackSrc = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop'
}) => {
  const [imgSrc, setImgSrc] = useState(() => {
    // Clean the source URL
    if (!src) return fallbackSrc;
    
    // Remove blob URLs
    if (src.startsWith('blob:')) {
      return fallbackSrc;
    }
    
    // Ensure HTTPS for Supabase URLs
    if (src.includes('supabase.co') && !src.startsWith('https://')) {
      return `https://${src}`;
    }
    
    return src;
  });

  const handleError = () => {
    setImgSrc(fallbackSrc);
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
};

export default PropertyImage;