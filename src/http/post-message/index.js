const arc = require('@architect/functions');
const data = require('@begin/data');
const { Telegraf, session, Markup } = require('telegraf');
const assert = require('assert');
const deindent = require('deindent');
const { stage } = require('./flows');

assert.ok(process.env.TL_TOKEN, 'Please set "TL_TOKEN" env var');

const tf = new Telegraf(process.env.TL_TOKEN, {
  telegram: {
    webhookReply: true,
    webhook: true,
  },
});

const babies = new Map();

tf.use(session());
tf.use(stage);
tf.use(async (ctx, next) => {
  if (!babies.has(ctx.chat.id)) {
    ctx.baby = await data.get({
      table: 'babies',
      key: ctx.chat.id,
    });

    if (ctx.baby) {
      babies.set(ctx.chat.id, ctx.baby);
    }
  }

  ctx.baby = babies.get(ctx.chat.id);
  await next();
});

const BUTTON = {
  wakeUp: Markup.button.callback('Wake Up', 'wakeUp'),
  fallAsleep: Markup.button.callback('Fall asleep', 'fallAsleep'),
};
const commands = [];

commands.push({ command: '/start', description: 'Register baby' });
tf.start(async (ctx) => {
  const name = ctx.from.first_name || ctx.from.username || '';

  if (!ctx.baby) {
    await ctx.reply(deindent`
      Hi ${name},
      I'm a babysitter. I'll help you to control regime of your baby.
      But before we start, I'd like to know a bit more about your baby. Let's start!
    `);
    await ctx.scene.enter('RegisterBaby', {
      async onDone() {
        await ctx.reply('Woohooo! We are done.', Markup.inlineKeyboard([
          [
            BUTTON.wakeUp,
            BUTTON.fallAsleep,
          ],
        ]));
      },
    });
  } else {
    await ctx.reply(deindent`
      Hi ${name},
      I've already know that this chat is for "${ctx.baby.name}".
      If you want to add another baby just create a new chat group and add me there.
    `);
  }
});

commands.push({ command: '/status', description: 'Shows the current state of regime' });
tf.command('status', async (ctx) => {
  const status = await getCurrentStatus(ctx.baby.key);

  if (!status) {
    return ctx.replyWithMarkdownV2(deindent`
      *Status*:

      You have never tracked either wake up or sleep\\. So, I have no information
    `, Markup.inlineKeyboard([
      [
        BUTTON.wakeUp,
        BUTTON.fallAsleep,
      ],
    ]));
  }

  const duration = await calcDuration(ctx.baby.key, new Date().toISOString());

  ctx.replyWithMarkdownV2(deindent`
    *Status*:

    ${ctx.baby.name} has been *${status.lastType}* for *${duration}*
  `, Markup.inlineKeyboard([
    [status.lastType === 'wakeUp' ? BUTTON.fallAsleep : BUTTON.wakeUp],
  ]));
});

tf.telegram.setMyCommands(commands);

tf.action(BUTTON.fallAsleep.callback_data, async (ctx) => {
  console.log('register asleep', ctx.baby);
  const state = await data.set({
    table: 'regime',
    type: 'fallAsleep',
    babyId: ctx.baby.key,
    at: new Date().toISOString(),
  });

  const duration = await calcDuration(state.babyId, state.at);
  await updateStatus(state);
  const message = duration
    ? `*Awaken time*: ${duration}`
    : 'Roger that!';
  await ctx.editMessageReplyMarkup(Markup.inlineKeyboard([]));
  await ctx.replyWithMarkdownV2(message, Markup.inlineKeyboard([
    [BUTTON.wakeUp],
  ]));
});

tf.action(BUTTON.wakeUp.callback_data, async (ctx) => {
  console.log('register wekeup', ctx.baby);
  const state = await data.set({
    table: 'regime',
    type: 'wakeUp',
    babyId: ctx.baby.key,
    at: new Date().toISOString(),
  });

  const duration = await calcDuration(state.babyId, state.at);
  await updateStatus(state);
  const message = duration
    ? `*Sleep time*: ${duration}`
    : 'Roger that!';
  await ctx.editMessageReplyMarkup(Markup.inlineKeyboard([]));
  await ctx.replyWithMarkdownV2(message, Markup.inlineKeyboard([
    [BUTTON.fallAsleep],
  ]));
});

let currentStatus;
async function updateStatus(object, meta) {
  currentStatus = {
    ...meta,
    key: `status.${object.babyId}`,
    lastKey: object.key,
    lastType: object.type,
    updatedAt: object.at,
  };
  await data.set({
    table: 'regime',
    ...currentStatus,
  });
}

async function getCurrentStatus(babyId) {
  return currentStatus || await data.get({
    table: 'regime',
    key: `status.${babyId}`,
  });
}

async function calcDuration(babyId, endTime) {
  const status = await getCurrentStatus(babyId);

  if (!status) {
    return null;
  }

  const startDate = new Date(status.updatedAt).getTime();
  const endDate = new Date(endTime).getTime();
  return humanizeTime((endDate - startDate) / 1000);
}

function humanizeTime(duration) {
  const time = [
    Math.floor(duration / 3600),
    parseInt((duration / 60) % 60, 10),
    parseInt(duration % 60, 10),
  ];

  time.forEach((part, index) => {
    time[index] = part < 10 ? `0${part}` : part;
  });

  return time.join(':');
}

exports.handler = async function postMessage(req) {
  const body = arc.http.helpers.bodyParser(req);
  console.log('received request');
  await tf.handleUpdate(body);
  console.log('updates tf', body);

  return {
    statusCode: 200,
  };
};
