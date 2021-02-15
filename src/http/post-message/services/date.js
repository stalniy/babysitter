function formatTime(utc) {
  return new Date(utc).toLocaleTimeString('uk-UA', {
    timeZone: 'Europe/Kiev',
  });
}

module.exports = {
  formatTime,
};
