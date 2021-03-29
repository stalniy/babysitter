const deindent = require('deindent');
const { mainKeyboard } = require('../actions/keyboard');

async function exec(ctx) {
  const name = ctx.from.first_name || ctx.from.username || '';

  if (!ctx.baby) {
    await ctx.reply(deindent`
      Hi ${name},
      I'm a babysitter. I'll help you to control regime of your baby.
      But before we start, I'd like to know a bit more about your baby. Let's start!
    `);
    await ctx.scene.enter('RegisterBaby', {
      onDone: () => ctx.reply('Woohooo! We are done.', mainKeyboard()),
    });
  } else {
    await ctx.reply(deindent`
      Hi ${name},
      I've already know that this chat is for "${ctx.baby.name}".
      If you want to add another baby just create a new chat group and add me there.
    `, mainKeyboard());
  }
}

module.exports = {
  name: 'start',
  description: 'Register baby',
  exec,
};
