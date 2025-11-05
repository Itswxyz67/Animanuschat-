// Basic NSFW word filter - expand based on your needs
// Note: This is a minimal list. For production, consider using a comprehensive 
// profanity filter library or API service like Tisane API or WebPurify
const nsfwWords = [
  'spam', 'scam', 'abuse',
  // Add more inappropriate words here
  // This is intentionally minimal as a placeholder
  // Users should implement their own filtering based on their use case
];

// Check if text contains NSFW content
export const containsNSFW = (text) => {
  const lowerText = text.toLowerCase();
  return nsfwWords.some(word => lowerText.includes(word));
};

// Filter NSFW words from text (replace with asterisks)
export const filterNSFW = (text, enabled = true) => {
  if (!enabled) return text;
  
  let filtered = text;
  nsfwWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  });
  return filtered;
};

// Match users based on preferences
export const canMatch = (user1, user2) => {
  // Check gender preferences
  if (user1.genderPreference && user1.genderPreference !== 'any' && user1.genderPreference !== user2.gender) {
    return false;
  }
  
  if (user2.genderPreference && user2.genderPreference !== 'any' && user2.genderPreference !== user1.gender) {
    return false;
  }
  
  // Check NSFW preferences
  if (user1.nsfwEnabled !== user2.nsfwEnabled) {
    return false;
  }
  
  // Check for shared interest tags (at least one common tag)
  if (user1.tags && user1.tags.length > 0 && user2.tags && user2.tags.length > 0) {
    const hasCommonTag = user1.tags.some(tag => user2.tags.includes(tag));
    if (hasCommonTag) {
      return true; // Prioritize users with common interests
    }
  }
  
  return true; // Can match if no specific requirements conflict
};

// Calculate match score (higher is better)
export const getMatchScore = (user1, user2) => {
  let score = 0;
  
  // Gender preference match
  if (user1.genderPreference === user2.gender || user1.genderPreference === 'any') {
    score += 10;
  }
  
  // Common tags
  if (user1.tags && user2.tags) {
    const commonTags = user1.tags.filter(tag => user2.tags.includes(tag));
    score += commonTags.length * 5;
  }
  
  // NSFW match
  if (user1.nsfwEnabled === user2.nsfwEnabled) {
    score += 5;
  }
  
  return score;
};
