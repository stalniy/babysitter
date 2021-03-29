const { get } = require('node-emoji');
const { mainKeyboard, buttons } = require('./keyboard');

async function exec(ctx) {
  const reply = ctx.message.reply_to_message;
  const hashIndex = reply ? reply.text.indexOf('#') : -1;

  if (!reply || hashIndex === -1) {
    return ctx.reply('You may cancel event in reply to event message only.');
  }

  const eventId = reply.text.slice(hashIndex + 1);
  const result = await ctx.regime.cancelEvent(eventId);

  if (result.type === 'error') {
    return ctx.reply(result.message);
  }

  await ctx.reply(`Event has been removed ${get('thumbsup')}`, mainKeyboard({
    nextEventButton: buttons[result.value.type === 'wakeUp' ? 'wakeUp' : 'sleep'],
  }));
}

module.exports = {
  trigger: /^(o+ps|no|please +cancel)$/i,
  exec,
};
