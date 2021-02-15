const { Scenes, Markup } = require('telegraf');
const deindent = require('deindent');
const babies = require('../services/baby');

module.exports = new Scenes.WizardScene(
  'RegisterBaby',
  async (ctx) => {
    ctx.wizard.state.baby = {
      key: ctx.chat.id,
      name: '',
      birthDate: '',
    };
    await ctx.reply('What is your baby name?', Markup.forceReply());
    return await ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.baby.name = ctx.message.text.trim();

    await ctx.reply(deindent`
      When was she born?
      Please specify date in the next format: Y-M-D (e.g., 2020-01-02)
    `, Markup.forceReply());
    return await ctx.wizard.next();
  },
  async (ctx) => {
    const birthDate = ctx.message.text.trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || !new Date(birthDate).getTime()) {
      await ctx.replyWithMarkdown(deindent`
        I'm so sorry to say that but it looks like birth date you mentioned is not a valid date.
        Could you please try to write it again?

        Just a reminder that it needs to be in the format: **Y-M-D (e.g., 2020-01-02)**
      `);
      return;
    }

    ctx.wizard.state.baby.birthDate = birthDate;
    await babies.create(ctx.wizard.state.baby);
    await ctx.wizard.state.onDone();

    return await ctx.scene.leave();
  },
);
