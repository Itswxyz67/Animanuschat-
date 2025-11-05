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
    
    // Create FormData - use proper multipart/form-data format
    const formData = new FormData();
    formData.append('key', FREEIMAGE_API_KEY);
    formData.append('source', base64Data);
    formData.append('format', 'json');
    
    // Upload to FreeImage.host using POST (required for base64)
    const response = await axios.post(UPLOAD_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 second timeout
    });
    
    // Check for successful response
    if (response.data && response.data.status_code === 200 && response.data.image) {
      return {
        success: true,
        url: response.data.image.url || response.data.image.display_url,
        thumb: response.data.image.thumb?.url || response.data.image.url
      };
    } else if (response.data && response.data.error) {
      throw new Error(response.data.error.message || 'Upload failed');
    } else {
      throw new Error('Invalid response from image host');
    }
  } catch (error) {
    console.error('Image upload error:', error);
    let errorMessage = 'Failed to upload image';
    
    if (error.response) {
      // Server responded with error
      errorMessage = error.response.data?.error?.message || 'Server error';
    } else if (error.request) {
      // Network error
      errorMessage = 'Network error. Please check your connection.';
    } else {
      errorMessage = error.message || errorMessage;
    }
    
    return {
      success: false,
      error: errorMessage
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
