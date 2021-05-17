const RegimeService = require('../services/regime');

async function exec(ctx) {
  RegimeService.clearCache();
  await ctx.reply('Done');
}

module.exports = {
  name: 'cc',
  hidden: true,
  exec,
};
