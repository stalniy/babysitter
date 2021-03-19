const { Markup } = require('telegraf');
const { get } = require('node-emoji');

module.exports = {
  wakeUp: Markup.button.callback(get('hugging_face'), 'wakeUp'),
  sleep: Markup.button.callback(get('sleeping_accommodation'), 'fallAsleep'),
};
