exports = generateLocation = (lat, long) => {
  return {
    createdAt: new Date().getTime(),
    location: `https://google.com/maps?q=${lat},${long}`
  }
}