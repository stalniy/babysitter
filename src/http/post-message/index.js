const arc = require('@architect/functions')
const data = require('@begin/data')
const TelegramBot = require('node-telegram-bot-api');

console.log('create bot: ', process.env.TL_TOKEN)
const bot = new TelegramBot(process.env.TL_TOKEN, {
  webHook: true
});

bot.setWebHook(`https://rain-nem-staging.begin.app/message`);

bot.on('message', (msg) => {
  console.log('<--------')
  bot.sendMessage(msg.chat.id, 'pong');
})

exports.handler = async function postMessage (req) {
  const body = arc.http.helpers.bodyParser(req);
  console.log('<-- hook is called')
  bot.processUpdate(body);

  return {
    statusCode: 200,
  };
}
