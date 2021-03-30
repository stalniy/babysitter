const {
  formatTime,
  formatDuration,
  formatDate,
  dateRangeInUserTz,
  shiftDate,
  dateToUTCRange,
} = require('../services/date');
const RegimeService = require('../services/regime');

async function exec(ctx) {
  const cmd = ctx.message.entities[0];
  const rawDate = ctx.message.text.slice(cmd.offset + cmd.length).trim();
  let dateRange = parseDate(rawDate);

  if (rawDate && !dateRange) {
    return ctx.reply('Please specify date in format Y-m-d (e.g., 2020-12-25) or relative amount of days (e.g., -1 day)');
  }

  if (!rawDate && !dateRange) {
    dateRange = dateRangeInUserTz();
  }

  const title = `<b>Events for ${formatDate(dateRange.start)}:</b>`;
  const events = await RegimeService.for(ctx.baby, dateRange).getEventsStats();

  if (!events.length) {
    return ctx.replyWithHTML(`${title}\nNo events yet`);
  }

  const response = events
    .map((event) => `- #${event.type} at ${formatTime(event.at)}`
      + `(duration: ${formatDuration(event.duration)})`)
    .join('\n');

  ctx.replyWithHTML(`${title}\n${response}`);
}

function parseDate(maybeDate) {
  if (!maybeDate) {
    return null;
  }

  return parseRelativeDate(maybeDate) || parseRegularDate(maybeDate);
}

function parseRelativeDate(date) {
  const matches = date.trim().match(/^(-\d+)\s*days?$/);

  if (!matches) {
    return null;
  }

  const today = dateRangeInUserTz();
  const shift = Number(matches[1]);

  return {
    start: shiftDate(today.start, shift),
    end: shiftDate(today.end, shift),
  };
}

function parseRegularDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }

  return dateToUTCRange(date);
}

module.exports = {
  name: 'events',
  description: 'Shows events for the specified day',
  exec,
};
