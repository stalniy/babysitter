const buttons = require('./buttons');
const { formatTime, formatDuration } = require('../services/date');

async function exec(ctx) {
  const status = await ctx.regime.getStatus();

  if (status && status.lastEvent.type === 'fallAsleep') {
    return ctx.reply(
      'The last event is also of type #fallAsleep. '
      + 'Let\'s pretend that this never happened.\n\n'
      + 'But if you wanted to change event\'s time, '
      + 'then find the latest and reply to it with the correct time',
    );
  }

  const event = await ctx.regime.createEvent('fallAsleep');
  const prefix = `Fall asleep at <b>${formatTime(event.at)}</b>!`;
  const message = status
    ? `${prefix} Waking time is <b>${formatDuration(status.lastEvent.duration)}</b> #${event.id}`
    : `${prefix} #${event.id}`;

  await ctx.answerCbQuery();
  await ctx.replyWithTmpButtons(message);
}

module.exports = {
  button: buttons.sleep,
  exec,
};
