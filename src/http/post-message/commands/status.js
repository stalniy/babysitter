const deindent = require('deindent');
const { Markup } = require('telegraf');
const actions = require('../actions');
const { formatTime } = require('../services/date');

async function exec(ctx) {
  const status = await ctx.regime.getCurrentStatus();

  if (!status) {
    return ctx.replyWithMarkdownV2(deindent`
      *Status*:
      Cannot provide status because you have never tracked either wake up or sleep\\.
    `, Markup.inlineKeyboard([
      [
        actions.wakeUp.button,
        actions.sleep.button,
      ],
    ]));
  }

  ctx.replyWithMarkdownV2(deindent`
    *Status*:
    ${ctx.baby.name} has been \\#${status.lastEvent.type} for *${status.duration}*\\ \\(at ${formatTime(status.lastEvent.at)}\\)\\.
    Amount of dreams: ${status.amountOfDreams}
  `, Markup.inlineKeyboard([
    [status.lastEvent.type === 'wakeUp' ? actions.sleep.button : actions.wakeUp.button],
  ]));
}

module.exports = {
  name: 'status',
  description: 'Shows the current state of regime',
  exec,
};
