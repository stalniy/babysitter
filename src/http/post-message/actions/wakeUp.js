const { get } = require('node-emoji');
const { buttons, mainKeyboard } = require('./keyboard');
const { formatTime, formatDuration } = require('../services/date');

async function exec(ctx) {
  const status = await ctx.regime.getStatus();

  if (status && status.lastEvent.type === 'wakeUp') {
    return ctx.reply(`${ctx.baby.name} is not sleeping now ${get('man-shrugging')}.`);
  }

  const event = await ctx.regime.createEvent('wakeUp');
  const prefix = `Woke up at <b>${formatTime(event.at)}</b>!`;
  const message = status
    ? `${prefix} Sleep time is <b>${formatDuration(status.lastEvent.duration)}</b>`
    : prefix;

  await ctx.replyWithHTML(`${message} #${event.id}`, mainKeyboard({
    nextEventButton: buttons.sleep
  }));
}

module.exports = {
  trigger: buttons.wakeUp.text,
  exec,
};
