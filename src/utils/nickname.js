// Generate a random anonymous nickname in format "Ghost#123"
export const generateNickname = () => {
  const randomNum = Math.floor(Math.random() * 1000);
  return `Ghost#${randomNum.toString().padStart(3, '0')}`;
};

// Store nickname in sessionStorage to persist during session
export const getNickname = () => {
  let nickname = sessionStorage.getItem('ghostlink_nickname');
  if (!nickname) {
    nickname = generateNickname();
    sessionStorage.setItem('ghostlink_nickname', nickname);
  }
  return nickname;
};
