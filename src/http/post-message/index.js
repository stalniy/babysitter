const arc = require('@architect/functions');
const assert = require('assert');
const createBot = require('./bot');
const commands = require('./commands');
const actions = require('./actions');

assert.ok(process.env.TL_TOKEN, 'Please set "TL_TOKEN" env var');
const bot = createBot(process.env.TL_TOKEN, {
  commands: Object.values(commands),
  actions: Object.values(actions),
});

if (process.env.NODE_ENV === 'testing') {
  console.log('use polling to receive updates');
  bot.launch();
} else if (process.env.TL_HOOK_URL) {
  bot.telegram.setWebhook(process.env.TL_HOOK_URL);
}

exports.handler = async function postMessage(req) {
  const body = arc.http.helpers.bodyParser(req);

  if (body && body.update_id) {
    await bot.handleUpdate(body);
  } else {
    console.warn('receive incorrect tf update', body);
  }

  return {
    statusCode: 200,
  };
};
