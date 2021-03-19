const { Context, Markup } = require('telegraf');

const stateForTmpButtons = { message: null, timerId: 0 };
class TLContext extends Context {
  async replyWithTmpButtons(text, buttons) {
    await removeTmpButtons(this);
    const message = await this.replyWithHTML(
      text,
      Markup.inlineKeyboard(buttons || []),
    );

    if (buttons && buttons.length) {
      stateForTmpButtons.message = message;
      await new Promise((resolve) => {
        stateForTmpButtons.resolve = resolve;
        stateForTmpButtons.timerId = setTimeout(() => {
          removeTmpButtons(this)
            .catch(console.error)
            .then(resolve);
        }, 5000);
      });
    }
  }
}

async function removeTmpButtons(ctx) {
  if (stateForTmpButtons.message) {
    clearTimeout(stateForTmpButtons.timerId);
    stateForTmpButtons.resolve();
    await ctx.telegram.editMessageReplyMarkup(
      ctx.chat.id,
      stateForTmpButtons.message.message_id,
      undefined,
      Markup.inlineKeyboard([]),
    );
    stateForTmpButtons.resolve = null;
    stateForTmpButtons.message = null;
    stateForTmpButtons.timerId = 0;
  }
}

module.exports = {
  Context: TLContext,
  removeTmpButtons,
};
