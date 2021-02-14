const { Scenes } = require('telegraf');
const registerBaby = require('./registerBaby');

const scenes = {
  registerBaby,
};

const stage = new Scenes.Stage(Object.values(scenes));

stage.command('cancel', async (ctx) => {
  await ctx.reply('Exit baby registration');
  ctx.scene.leave();
});

module.exports = {
  stage: stage.middleware(),
};
