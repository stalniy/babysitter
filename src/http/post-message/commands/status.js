const deindent = require('deindent');
const { Markup } = require('telegraf');
const actions = require('../actions');

async function exec(ctx) {
  const status = await ctx.regime.getCurrentStatus();

  if (!status.duration) {
    return ctx.replyWithMarkdownV2(deindent`
      *Status*:

      You have never tracked either wake up or sleep\\. So, I have no information
    `, Markup.inlineKeyboard([
      [
        actions.wakeUp.button,
        actions.sleep.button,
      ],
    ]));
  }

  ctx.replyWithMarkdownV2(deindent`
    *Status*:

    ${ctx.baby.name} has been *${status.lastType}* for *${status.duration}*
  `, Markup.inlineKeyboard([
    [status.lastType === 'wakeUp' ? actions.sleep.button : actions.wakeUp.button],
  ]));
}

module.exports = {
  name: 'status',
  description: 'Shows the current state of regime',
  exec,
};
