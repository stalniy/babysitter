const { Markup } = require('telegraf');
const { get } = require('node-emoji');

const iconButton = (icon, text) => Object.defineProperty(
  Markup.button.text(`${icon} ${text}`),
  'trigger',
  { value: new RegExp(`${text}$`) }
);

const buttons = {
  refreshStatus: Markup.button.callback(`${get('hourglass')} Refresh`, 'refreshStatus'),
  status: Markup.button.text("/status"),
  events: Markup.button.text("/events"),
  baby: Markup.button.text("/baby"),
  wakeUp: iconButton(get('hugging_face'), 'Wake Up'),
  sleep: iconButton(get('sleeping'), 'Fall Asleep'),
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
