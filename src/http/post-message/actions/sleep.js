const { Markup } = require('telegraf');
const buttons = require('./buttons');
const { formatTime } = require('../services/date');

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
  const prefix = `Fall asleep at *${formatTime(event.at)}*\\!`;
  const message = status
    ? `${prefix} Waking time is *${status.duration}* \\#${event.id}`
    : `${prefix} \\#${event.id}`;

  await ctx.editMessageReplyMarkup(Markup.inlineKeyboard([]));
  await ctx.replyWithMarkdownV2(message, Markup.inlineKeyboard([
    [buttons.wakeUp],
  ]));
}

module.exports = {
  button: buttons.sleep,
  exec,
};
