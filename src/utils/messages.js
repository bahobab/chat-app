const generateMessage = (username, text) => {
  return {
    username,
    text,
    createdAt: new Date().getTime()
  }
};

const generateLocation = (username, lat, long) => {
  return {
    username,
    createdAt: new Date().getTime(),
    url: `https://google.com/maps?q=${lat},${long}`
  }
};

module.exports = {
  generateLocation,
  generateMessage
};