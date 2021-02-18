const { Markup } = require('telegraf');
const buttons = require('./buttons');
const { formatTime } = require('../services/date');

async function exec(ctx) {
  const now = Date.now();
  const status = await ctx.regime.getStatusAt(now);

  if (status && status.lastEvent.type === 'wakeUp') {
    return ctx.reply(
      'The last event is also of type #wakeUp. '
      + 'Let\'s pretend that this never happened.\n\n'
      + 'But if you wanted to change event\'s time, '
      + 'then find the latest and reply to it with the correct time',
    );
  }

  const event = await ctx.regime.createEvent('wakeUp', { at: now });
  const prefix = `Woke up at *${formatTime(event.at)}*\\!`;
  const message = status
    ? `${prefix} Sleep time is *${status.duration}* \\#${event.id}`
    : `${prefix} \\#${event.id}`;

  await ctx.editMessageReplyMarkup(Markup.inlineKeyboard([]));
  await ctx.replyWithMarkdownV2(message, Markup.inlineKeyboard([
    [buttons.sleep],
  ]));
}

module.exports = {
  button: buttons.wakeUp,
  exec,
};
