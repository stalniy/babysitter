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
  wakeUp: Markup.button.callback('Wake Up', 'wakeUp', true),
  fallAsleep: Markup.button.callback('Fall asleep', 'fallAsleep', true),
};

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
    `, Markup.inlineKeyboard([
      [
        BUTTON.wakeUp,
        BUTTON.fallAsleep,
      ],
    ]));
  }
});

tf.action(BUTTON.fallAsleep.callback_data, async (ctx) => {
  console.log('register asleep', ctx.baby);
  const fallAsleep = {
    table: 'regime',
    type: 'fallAsleep',
    babyId: ctx.baby.key,
    at: new Date().toISOString(),
  };
  await data.set(fallAsleep);
  await updateLast('lastFallAsleep', fallAsleep);

  const duration = await calcDuration('lastWakeUp', fallAsleep);
  const message = duration
    ? `<b>Awaken time</b>: ${duration}`
    : 'Roger that!';
  await ctx.replyWithHTML(message, Markup.inlineKeyboard([
    [BUTTON.wakeUp],
  ]));
});

tf.action(BUTTON.wakeUp.callback_data, async (ctx) => {
  console.log('register wekeup', ctx.baby);
  const wakeUp = {
    table: 'regime',
    type: 'wakeUp',
    babyId: ctx.baby.key,
    at: new Date().toISOString(),
  };
  await data.set(wakeUp);
  await updateLast('lastWakeUp', wakeUp);

  const duration = await calcDuration('lastFallAsleep', wakeUp);
  const message = duration
    ? `<b>Sleep time</b>: ${duration}`
    : 'Roger that!';
  await ctx.replyWithHTML(message, Markup.inlineKeyboard([
    [BUTTON.fallAsleep],
  ]));
});

async function updateLast(prefix, object) {
  await data.set({
    table: 'regime',
    key: `${prefix}.${object.babyId}`,
    at: object.at,
  });
}

async function calcDuration(prefix, endObject) {
  const startObject = await data.get({
    table: 'regime',
    key: `${prefix}.${endObject.babyId}`,
  });

  if (!startObject) {
    return null;
  }

  const startDate = new Date(startObject.at).getTime();
  const endDate = new Date(endObject.at).getTime();
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
