const buttons = require('./buttons');
const { formatTime, formatDuration } = require('../services/date');

async function exec(ctx) {
  const status = await ctx.regime.getStatus();

  if (status && status.lastEvent.type === 'wakeUp') {
    return ctx.reply(
      'The last event is also of type #wakeUp. '
      + 'Let\'s pretend that this never happened.\n\n'
      + 'But if you wanted to change event\'s time, '
      + 'then find the latest and reply to it with the correct time',
    );
  }

  const event = await ctx.regime.createEvent('wakeUp');
  const prefix = `Woke up at <b>${formatTime(event.at)}</b>!`;
  const message = status
    ? `${prefix} Sleep time is <b>${formatDuration(status.lastEvent.duration)}</b> #${event.id}`
    : `${prefix} #${event.id}`;

  await ctx.answerCbQuery();
  await ctx.replyWithTmpButtons(message);
}

module.exports = {
  button: buttons.wakeUp,
  exec,
};
