const { Telegraf, session } = require('telegraf');
const { stage } = require('./flows');
const RegimeService = require('./services/regime');
const { dateRangeInUserTz } = require('./services/date');
const babies = require('./services/baby');

module.exports = function createBot(token, options) {
  const bot = new Telegraf(token);

  bot.use(session());
  bot.use(stage);
  bot.use(async (ctx, next) => {
    ctx.baby = await babies.get(ctx.chat.id);
    const babyName = ctx.baby && ctx.baby.name || 'unknown';

    console.log(`Start (${ctx.update.update_id}) --------------------------------`);
    console.log(`Incoming Message: ${ctx.updateType} for child: ${babyName}`);
    console.log(ctx.message || ctx.callbackQuery);
    console.log(`End (${ctx.update.update_id}) --------------------------------`);

    if (!ctx.baby && ctx.message && ctx.message.text && !ctx.message.text.trim().startsWith('/start')) {
      ctx.reply(
        'This chat has not be associated with any baby.'
        + 'Please use /start command to register a baby.',
      );
      return;
    }

    ctx.regime = RegimeService.for(ctx.baby.id, dateRangeInUserTz());
    await next();
  });
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
    if (action.button) {
      bot.action(action.button.callback_data, action.exec);
    } else {
      bot.hears(action.trigger, action.exec);
    }
  });

  bot.catch((error, ctx) => {
    console.error(error);
    ctx.reply('Error occurred')
  })

  return bot;
};
