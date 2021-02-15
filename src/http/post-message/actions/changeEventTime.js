const { emojify } = require('node-emoji');

async function exec(ctx) {
  const reply = ctx.message.reply_to_message;
  const hashIndex = reply ? reply.text.indexOf('#') : -1;

  if (!reply || hashIndex === -1) {
    return ctx.reply('You may change time in reply to event only. Choose message with wanted event and reply to it');
  }

  const newTime = ctx.match[1].trim();

  if (!/^\d{2}:\d{2}(?:\d{2})?$/.test(newTime)) {
    return ctx.replyWithMarkdownV2('The command to change time be of this pattern: *change to hh:dd:ss* (e.g., 11:42 or 11:42:38)');
  }

  const eventId = reply.text.slice(hashIndex + 1);
  try {
    await ctx.regime.setEventTime(eventId, newTime);
    await ctx.reply(emojify(':thumbsup:'));
  } catch (error) {
    await ctx.reply(`Sorry, due to unexpected error I cannot change event time:\n${error.message}`);
    throw error;
  }
}

module.exports = {
  trigger: /^(?:change\s+to )?(.+)/,
  exec,
};
