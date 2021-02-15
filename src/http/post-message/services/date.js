const zonedTimeToUTC = require('date-fns-tz/zonedTimeToUtc');

function formatTime(utc) {
  const date = utc instanceof Date ? utc : new Date(utc);
  return date.toLocaleTimeString('uk-UA', {
    timeZone: 'Europe/Kiev',
  });
}

function changeDateTime(rawDate, rawTime) {
  const dateTime = new Date(rawDate);
  const tzDate = dateTime.toLocaleDateString('uk-UA', {
    timeZone: 'Europe/Kiev',
  });
  const time = rawTime.indexOf(':', 3) === -1 ? `${rawTime}:00` : rawTime;
  const date = tzDate.split('.').reverse().join('-');
  return zonedTimeToUTC(`${date}T${time}`, 'Europe/Kiev');
}

module.exports = {
  formatTime,
  changeDateTime,
};
