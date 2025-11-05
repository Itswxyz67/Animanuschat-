import axios from 'axios';

// Note: The API key should always be set in environment variables
// The fallback key is provided for demo purposes only and may be rate-limited
// Get your own free API key from https://freeimage.host/page/api
const FREEIMAGE_API_KEY = import.meta.env.VITE_FREEIMAGE_API_KEY || '6d207e02198a847aa98d0a2a901485a5';
const UPLOAD_URL = 'https://freeimage.host/api/1/upload';

// Warn if using default API key
if (!import.meta.env.VITE_FREEIMAGE_API_KEY) {
  console.warn('Warning: Using default FreeImage API key. Please set VITE_FREEIMAGE_API_KEY in your .env file to avoid rate limiting.');
}

export const uploadImage = async (file) => {
  try {
    // Convert file to base64
    const base64 = await fileToBase64(file);
    
    // Remove data URL prefix
    const base64Data = base64.split(',')[1];
    
    // Create FormData
    const formData = new FormData();
    formData.append('key', FREEIMAGE_API_KEY);
    formData.append('action', 'upload');
    formData.append('source', base64Data);
    formData.append('format', 'json');
    
    // Upload to FreeImage.host
    const response = await axios.post(UPLOAD_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data && response.data.image && response.data.image.display_url) {
      return {
        success: true,
        url: response.data.image.display_url,
        thumb: response.data.image.thumb?.url || response.data.image.display_url
      };
    } else {
      throw new Error('Invalid response from image host');
    }
  } catch (error) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload image'
    };
  }
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
