const { mainKeyboard } = require('../actions/keyboard');
const RegimeService = require('../services/regime');

async function exec(ctx) {
  RegimeService.clearCache();
  await ctx.reply('Done', mainKeyboard());
}

module.exports = {
  name: 'cc',
  hidden: true,
  exec,
};
