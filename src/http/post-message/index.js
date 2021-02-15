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

exports.handler = async function postMessage(req) {
  const body = arc.http.helpers.bodyParser(req);
  await bot.handleUpdate(body);

  return {
    statusCode: 200,
  };
};
