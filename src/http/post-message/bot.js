const { Telegraf, session } = require('telegraf');
const deindent = require('deindent');
const { stage } = require('./flows');
const RegimeService = require('./services/regime');
const babies = require('./services/baby');

module.exports = function createBot(token, options) {
  const bot = new Telegraf(token, {
    telegram: {
      webhookReply: true,
      webhook: true,
    },
  });

  bot.use(async (ctx, next) => {
    ctx.baby = await babies.get(ctx.chat.id);
    console.log({
      message: ctx.message,
      hasBaby: !!ctx.baby,
    });

    if (!ctx.baby && !ctx.message.trim().startsWith('/start')) {
      ctx.reply(deindent`
        This chat has not be associated with any baby.
        Please use /start command to register a baby.
      `);
      return;
    }

    ctx.regime = new RegimeService(ctx.chat.id);
    await next();
  });
  bot.use(session());
  bot.use(stage);

  const commandsInfo = [];
  options.commands.forEach((command) => {
    bot.command(command.name, command.exec);
    commandsInfo.push({
      command: `/${command.name}`,
      description: command.description,
    });
  });
  bot.telegram.setMyCommands(commandsInfo);

  options.actions.forEach((action) => {
    bot.action(action.button.callback_data, action.exec);
  });

  return bot;
};
