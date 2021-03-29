const { get } = require('node-emoji');
const { buttons, mainKeyboard } = require('./keyboard');
const { formatTime, formatDuration } = require('../services/date');

async function exec(ctx) {
  const status = await ctx.regime.getStatus();

  if (status && status.lastEvent.type === 'fallAsleep') {
    return ctx.reply(`${ctx.baby.name} is sleeping now ${get('man-shrugging')}.`);
  }

  const event = await ctx.regime.createEvent('fallAsleep');
  const prefix = `Fall asleep at <b>${formatTime(event.at)}</b>!`;
  const message = status
    ? `${prefix} Waking time is <b>${formatDuration(status.lastEvent.duration)}</b>`
    : prefix;

  await ctx.replyWithHTML(`${message} #${event.id}`, mainKeyboard({
    nextEventButton: buttons.wakeUp
  }));
}

module.exports = {
  trigger: buttons.sleep.text,
  exec,
};
