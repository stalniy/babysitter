const arc = require('@architect/functions')
const data = require('@begin/data')
const TelegramBot = require('node-telegram-bot-api');
const assert = require('assert');

assert.ok(process.env.TL_TOKEN, `Please set "TL_TOKEN" env var`);

const bot = new TelegramBot(process.env.TL_TOKEN, {
  webHook: true
});

bot.on('message', (msg) => {
  console.log('<--------')
  bot.sendMessage(msg.chat.id, 'pong')
    .catch(error => console.log(error.response.body));
})

bot.on('webhook_error', (error) => {
  console.log(error.code)
  console.log(error.response);  // => 'EPARSE'
});

exports.handler = async function postMessage (req) {
  const body = arc.http.helpers.bodyParser(req);
  console.log('<-- hook is called')
  bot.processUpdate(body);

  return {
    statusCode: 200,
  };
}
