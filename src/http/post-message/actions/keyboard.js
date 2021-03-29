const { Markup } = require('telegraf');
const { get } = require('node-emoji');

const buttons = {
  refreshStatus: Markup.button.callback(`${get('hourglass')} Refresh`, 'refreshStatus'),
  status: Markup.button.text("/status"),
  events: Markup.button.text("/events"),
  baby: Markup.button.text("/baby"),
  wakeUp: Markup.button.text(`/do ${get('hugging_face')}`),
  sleep: Markup.button.text(`/do ${get('sleeping')}`),
};

function mainKeyboard(options) {
  const keyboard = [
    [buttons.status],
    [buttons.events, buttons.baby],
  ];

  if (options && options.nextEventButton) {
    keyboard[0].push(options.nextEventButton);
  } else {
    keyboard[0].push(buttons.wakeUp, buttons.sleep)
  }

  return Markup.keyboard(keyboard);
}

module.exports = {
  buttons,
  mainKeyboard
};
