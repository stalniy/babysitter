const { Markup } = require('telegraf');
const buttons = require('./buttons');
const { formatTime } = require('../services/date');

async function exec(ctx) {
  const now = new Date().toISOString();
  const status = await ctx.regime.getStatusAt(now);
  const event = await ctx.regime.createEvent('fallAsleep', { at: now });
  const prefix = `Fall asleep at *${formatTime(event.at)}*\\!`;
  const message = status
    ? `${prefix} Waking time is *${status.duration}* \\#${event.key}`
    : `${prefix} \\#${event.key}`;

  await ctx.editMessageReplyMarkup(Markup.inlineKeyboard([]));
  await ctx.replyWithMarkdownV2(message, Markup.inlineKeyboard([
    [buttons.wakeUp],
  ]));
}

module.exports = {
  button: buttons.sleep,
  exec,
};
