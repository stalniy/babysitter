const { Markup } = require('telegraf');
const { buttons } = require('./keyboard');
const { formatTime, formatDuration } = require('../services/date');

const ONE_HOUR = 60 * 60 * 1000;
const INLINE_BUTTONS = Markup.inlineKeyboard([
  buttons.refreshStatus,
]);

async function exec(ctx) {
  const status = await ctx.regime.getStatus();
  let message = '<b>Status:</b>\n';

  if (status) {
    message += renderStatus(ctx.baby, status);
  } else {
    message += 'Cannot provide status because there are no events.';
  }

  if (ctx.updateType === 'callback_query') {
    await ctx.editMessageText(message, {
      parse_mode: 'HTML',
      reply_markup: ctx.callbackQuery.message.reply_markup,
    });
    await ctx.answerCbQuery();
  } else {
    await ctx.replyWithHTML(message, INLINE_BUTTONS);
  }
}

function renderStatus(baby, status) {
  return `${`${baby.name} has been #${status.lastEvent.type} `
    + `for <b>${formatDuration(status.lastEvent.duration)}</b> `
    + `(at ${formatTime(status.lastEvent.at)}).\n`}\n${
    renderSummary(status.summary.fallAsleep, 'Dreams')
  }${renderSummary(status.summary.wakeUp, 'Waking')
  }${renderTotalSummary(status)}`;
}

function renderSummary(summary, title) {
  if (!summary) {
    return '';
  }

  return `<b>${title}:</b>\n`
    + `    amount: ${summary.amount}\n`
    + `    total time: ${formatDuration(summary.duration)}\n`;
}

function renderTotalSummary(status) {
  const { totals } = status.summary;
  let duration = formatDuration(totals.duration);

  if (status.lastEvent.type !== 'fallAsleep') {
    const h12 = 12 * ONE_HOUR;

    if (totals.duration > h12) {
      duration = `${duration} (over: ${formatDuration(totals.duration - h12)})`;
    }

    if (totals.duration > 11 * ONE_HOUR) {
      duration = `<b>${duration}</b>`;
    }
  }

  return '<b>Totals:</b>\n'
    + `    amount: ${totals.amount}\n`
    + `    total time: ${duration}\n`;
}

module.exports = {
  button: buttons.refreshStatus,
  exec,
};
