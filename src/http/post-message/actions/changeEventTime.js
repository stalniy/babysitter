const { emojify } = require('node-emoji');
const { timeToUTC, isValidTime } = require('../services/date');

const EDIT_LIMIT_IN_MS = 24 * 60 * 60 * 1000;

async function exec(ctx) {
  const reply = ctx.message.reply_to_message;
  const hashIndex = reply ? reply.text.indexOf('#') : -1;

  if (!reply || hashIndex === -1) {
    return ctx.reply('You may change time in reply to event only. Choose message with wanted event and reply to it');
  }

  const newTime = ctx.match[1].trim();

  if (!isValidTime(newTime)) {
    return ctx.replyWithMarkdownV2('The command to change time should be of this pattern: *h:d:s* \\(e\\.g\\., 11:42 or 11:42:38\\)');
  }

  const eventId = reply.text.slice(hashIndex + 1);
  const originalMessageDate = new Date(reply.date * 1000);
  const newDate = timeToUTC(originalMessageDate, newTime);

  if (newDate - originalMessageDate > EDIT_LIMIT_IN_MS) {
    return ctx.reply('You cannot change an event after 24 hours from its creation');
  }

  const result = await ctx.regime.setEventTime(eventId, newDate);

  if (result.type === 'error') {
    await ctx.reply(result.message);
  } else {
    await ctx.reply(
      `The time was successfully changed ${emojify(':thumbsup:')}.\n`
      + 'Do you want to check the /status?',
    );
  }
}

module.exports = {
  trigger: /^(?:change\s+to )?(.+)/,
  exec,
};
