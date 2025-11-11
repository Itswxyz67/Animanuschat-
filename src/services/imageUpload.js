import axios from 'axios';

// ImgBB API configuration
// Get your own API key from https://api.imgbb.com/
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || 'e2d1336255c3eac8629de4c634e96603';
const UPLOAD_URL = 'https://api.imgbb.com/1/upload';

// Warn if using default API key
if (!import.meta.env.VITE_IMGBB_API_KEY) {
  console.warn('Warning: Using default ImgBB API key. Please set VITE_IMGBB_API_KEY in your .env file for production use.');
}

export const uploadImage = async (file) => {
  try {
    // Convert file to base64
    const base64 = await fileToBase64(file);
    
    // Remove data URL prefix
    const base64Data = base64.split(',')[1];
    
    // Create FormData for ImgBB API
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', base64Data);
    
    // Upload to ImgBB
    const response = await axios.post(UPLOAD_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 second timeout
    });
    
    // Check for successful response from ImgBB
    if (response.data && response.data.success && response.data.data) {
      return {
        success: true,
        url: response.data.data.url,
        thumb: response.data.data.thumb?.url || response.data.data.medium?.url || response.data.data.url
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
