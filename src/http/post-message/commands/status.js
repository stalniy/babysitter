const actions = require('../actions');
const { formatTime, formatDuration } = require('../services/date');

async function exec(ctx) {
  const status = await ctx.regime.getStatus();
  const reply = { text: '<b>Status:</b>\n', keyboard: null };

  if (status) {
    reply.text += renderStatus(ctx.baby, status);
    reply.keyboard = [
      status.lastEvent.type === 'wakeUp' ? actions.sleep.button : actions.wakeUp.button,
    ];
  } else {
    reply.text += 'Cannot provide status because there are no events\\.';
    reply.keyboard = [
      actions.wakeUp.button,
      actions.sleep.button,
    ];
  }

  await ctx.replyWithTmpButtons(reply.text, reply.keyboard);
}

function renderStatus(baby, status) {
  return `${`${baby.name} has been #${status.lastEvent.type} `
    + `for <b>${formatDuration(status.lastEvent.duration)}</b> `
    + `(at ${formatTime(status.lastEvent.at)}).\n`}\n${
    renderSummary(status.summary.fallAsleep, 'Dreams')
  }${renderSummary(status.summary.wakeUp, 'Waking')}`;
}

function renderSummary(summary, title) {
  if (!summary) {
    return '';
  }

  return `<b>${title}:</b>\n`
    + `    amount: ${summary.amount}\n`
    + `    total time: ${formatDuration(summary.duration)}\n`;
}

module.exports = {
  name: 'status',
  description: 'Shows the current state of regime',
  exec,
};
