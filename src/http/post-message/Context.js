const { Context, Markup } = require('telegraf');

const stateForTmpButtons = { message: null, timerId: 0 };
class TLContext extends Context {
  async replyWithTmpButtons(text, buttons) {
    await removeTmpButtons(this);
    stateForTmpButtons.message = await this.replyWithHTML(
      text,
      Markup.inlineKeyboard(buttons),
    );
    stateForTmpButtons.timerId = setTimeout(() => {
      removeTmpButtons(this).catch(console.error);
    }, 30000);
  }
}

async function removeTmpButtons(ctx) {
  if (stateForTmpButtons.message) {
    clearTimeout(stateForTmpButtons.timerId);
    await ctx.telegram.editMessageReplyMarkup(
      ctx.chat.id,
      stateForTmpButtons.message.message_id,
      undefined,
      Markup.inlineKeyboard([]),
    );
    stateForTmpButtons.message = null;
    stateForTmpButtons.timerId = 0;
  }
}

module.exports = {
  Context: TLContext,
  removeTmpButtons,
};
