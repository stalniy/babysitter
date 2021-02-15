function formatTime(utc) {
  const date = utc instanceof Date ? utc : new Date(utc);
  return date.toLocaleTimeString('uk-UA', {
    timeZone: 'Europe/Kiev',
  });
}

function timeToUTC(baseDate, time) {
  const tzDate = baseDate.toLocaleString('en-US', {
    timeZone: 'Europe/Kiev',
    timeZoneName: 'short',
    hour12: false,
  }).replace(/\d{1,2}:\d{1,2}:\d{1,2}/, normalizeTime(time));

  return new Date(tzDate);
}

function normalizeTime(time) {
  return time.split(':')
    .map((chunk) => chunk.padStart(2, '0'))
    .join(':')
    .padEnd(8, ':00');
}

function isValidTime(time) {
  return /^\d{1,2}:\d{1,2}(?:\d{1,2})?$/.test(time);
}

module.exports = {
  formatTime,
  timeToUTC,
  isValidTime,
};
