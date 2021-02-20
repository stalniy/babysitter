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
    .map(normalizeTimeChunk)
    .join(':')
    .padEnd(8, ':00');
}

function normalizeTimeChunk(chunk) {
  return chunk.toString().padStart(2, '0');
}

const TIME_CHUNKS_MAX = [23, 59, 59];
function isValidTime(time) {
  const chunks = time.split(':');

  return chunks.length >= 2
    && chunks.every((chunk, index) => Number(chunk) <= TIME_CHUNKS_MAX[index]);
}

function calcDuration(rawDate, anotherRawDate) {
  const end = new Date(rawDate);
  const start = new Date(anotherRawDate);

  if (end.getTime() < start.getTime()) {
    return 'invalid';
  }

  const duration = intervalToDuration(start, end);
  return [duration.hours, duration.minutes, duration.seconds]
    .map(normalizeTimeChunk)
    .join(':');
}

function intervalToDuration(start, end) {
  const diffInSeconds = (end.getTime() - start.getTime()) / 1000;
  const hours = Math.floor(diffInSeconds / 3600);
  const minutes = Math.floor((diffInSeconds % 3600) / 60);
  let seconds = end.getSeconds() - start.getSeconds();

  if (seconds < 0) {
    seconds += 60;
  }

  return {
    hours,
    minutes,
    seconds,
  };
}

function shiftDate(dateTime, shift) {
  const now = new Date(dateTime);
  now.setDate(now.getDate() + shift);
  return now;
}

module.exports = {
  formatTime,
  timeToUTC,
  isValidTime,
  calcDuration,
  shiftDate,
};
