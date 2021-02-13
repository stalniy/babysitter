const arc = require('@architect/functions')
const data = require('@begin/data')
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TL_TOKEN);

bot.setWebHook(`https://rain-nem-staging.begin.app/message`);

bot.onText(/\/ping/, (msg) => {
  boy.sendMessage(msg.chat.id, 'pong');
})

exports.handler = async function postMessage (req) {
  const body = arc.http.helpers.bodyParser(req);
  bot.processUpdate(body);

  return {
    statusCode: 200,
  };
}
