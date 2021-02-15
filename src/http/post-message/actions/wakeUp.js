const { Markup } = require('telegraf');
const buttons = require('./buttons');
const { formatTime } = require('../services/date');

async function exec(ctx) {
  const event = await ctx.regime.createEvent('wakeUp');
  const status = await ctx.regime.getStatusAt(event.at);
  const prefix = `Woke up at *${formatTime(event.at)}*\\!`;
  const message = status
    ? `${prefix} Sleep time is *${status.duration}* \\#${event.key}`
    : `${prefix} \\#${event.key}`;

  await ctx.editMessageReplyMarkup(Markup.inlineKeyboard([]));
  await ctx.replyWithMarkdownV2(message, Markup.inlineKeyboard([
    [buttons.sleep],
  ]));
}

module.exports = {
  button: buttons.wakeUp,
  exec,
};
