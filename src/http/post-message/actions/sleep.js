const { Markup } = require('telegraf');
const buttons = require('./buttons');

async function exec(ctx) {
  const event = await ctx.regime.createEvent('fallAsleep');
  const status = await ctx.regime.getStatusAt(event.at);
  const message = status.duration
    ? `*Awaken time*: ${status.duration}`
    : 'Roger that!';

  await ctx.editMessageReplyMarkup(Markup.inlineKeyboard([]));
  await ctx.replyWithMarkdownV2(message, Markup.inlineKeyboard([
    [buttons.wakeUp],
  ]));
}

module.exports = {
  button: buttons.sleep,
  exec,
};
