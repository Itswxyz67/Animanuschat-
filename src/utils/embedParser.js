// Utility to parse URLs and determine if they should be embedded

// Extract YouTube video ID from various URL formats
export const getYouTubeVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Extract Twitter/X tweet ID
export const getTwitterTweetId = (url) => {
  const pattern = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/;
  const match = url.match(pattern);
  return match ? match[1] : null;
};

// Detect if URL contains embeddable content
export const detectEmbedType = (text) => {
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlPattern);
  
  if (!urls || urls.length === 0) return null;
  
  const url = urls[0]; // Use first URL found
  
  // YouTube
  const youtubeId = getYouTubeVideoId(url);
  if (youtubeId) {
    return { type: 'youtube', id: youtubeId, url };
  }
  
  // Twitter/X
  const tweetId = getTwitterTweetId(url);
  if (tweetId) {
    return { type: 'twitter', id: tweetId, url };
  }
  
  // Check for direct image URLs
  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
    return { type: 'image', url };
  }
  
  return null;
};
