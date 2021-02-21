const { formatTime, formatDuration } = require('../services/date');

async function exec(ctx) {
  const events = await ctx.regime.getEventsStats();

  if (!events.length) {
    return ctx.reply('Events for today:\nNo events yet');
  }

  const response = events
    .map((event) => `- #${event.type} at ${formatTime(event.at)}`
      + `(duration: ${formatDuration(event.duration)})`)
    .join('\n');

  ctx.reply(`Events for today:\n${response}`);
}

module.exports = {
  name: 'events',
  description: 'Shows events for the specified day',
  exec,
};
