const deindent = require('deindent');
const actions = require('../actions');

async function exec(ctx) {
  const name = ctx.from.first_name || ctx.from.username || '';

  if (!ctx.baby) {
    await ctx.reply(deindent`
      Hi ${name},
      I'm a babysitter. I'll help you to control regime of your baby.
      But before we start, I'd like to know a bit more about your baby. Let's start!
    `);
    await ctx.scene.enter('RegisterBaby', {
      async onDone() {
        await ctx.replyWithTmpButtons('Woohooo! We are done.', [
          [
            actions.wakeUp.button,
            actions.sleep.button,
          ],
        ]);
      },
    });
  } else {
    await ctx.reply(deindent`
      Hi ${name},
      I've already know that this chat is for "${ctx.baby.name}".
      If you want to add another baby just create a new chat group and add me there.
    `);
  }
}

module.exports = {
  name: 'start',
  description: 'Register baby',
  exec,
};
