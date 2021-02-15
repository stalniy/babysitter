const { Markup } = require('telegraf');

module.exports = {
  wakeUp: Markup.button.callback('Wake Up', 'wakeUp'),
  sleep: Markup.button.callback('Sleep', 'fallAsleep'),
};
