const { Markup } = require('telegraf');
const actions = require('../actions');
const { formatTime } = require('../services/date');

async function exec(ctx) {
  const status = await ctx.regime.getCurrentStatus();
  const reply = { text: '*Status*:\n', keyboard: null };

  if (status) {
    reply.text += renderStatus(ctx.baby, status);
    reply.keyboard = Markup.inlineKeyboard([
      status.lastEvent.type === 'wakeUp' ? actions.sleep.button : actions.wakeUp.button,
    ]);
  } else {
    reply.text += 'Cannot provide status because there are no events\\.';
    reply.keyboard = Markup.inlineKeyboard([
      actions.wakeUp.button,
      actions.sleep.button,
    ]);
  }

  await ctx.replyWithMarkdownV2(reply.text, reply.keyboard);
}

function renderStatus(baby, status) {
  return `${baby.name} has been \\#${status.lastEvent.type} for *${status.duration}*`
    + `\\(at ${formatTime(status.lastEvent.at)}\\)\\.\n`
    + `Amount of dreams: ${status.amountOfDreams}`;
}

module.exports = {
  name: 'status',
  description: 'Shows the current state of regime',
  exec,
};
