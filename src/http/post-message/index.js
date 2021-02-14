const arc = require('@architect/functions')
const data = require('@begin/data')
const { Telegraf, session, Markup } = require('telegraf');
const assert = require('assert');
const deindent = require('deindent');
const { stage } = require('./flows');

assert.ok(process.env.TL_TOKEN, `Please set "TL_TOKEN" env var`);

const tf = new Telegraf(process.env.TL_TOKEN);

const babies = new Map();

tf.use(session());
tf.use(stage);
tf.use(async (ctx, next) => {
  if (!babies.has(ctx.chat.id)) {
    ctx.baby = await data.get({
      table: 'babies',
      key: ctx.chat.id
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
}

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
        await ctx.reply(`Woohooo! We are done.`, Markup.keyboard([
          [
            BUTTON.wakeUp,
            BUTTON.fallAsleep,
          ]
        ]));
      }
    });
  } else {
    await ctx.reply(deindent`
      Hi ${name},
      I've already know that this chat is for "${baby.name}".
      If you want to add another baby just create a new chat group and add me there.
    `, Markup.keyboard([
      [
        BUTTON.wakeUp,
        BUTTON.fallAsleep,
      ]
    ]));
  }
});

tf.on('callback_query', async (ctx) => {
  try {
    let button;
    switch (msg.data) {
    case 'woke_up':
      await wakeUp(ctx.baby);
      button = BUTTON.fallAsleep;
      break;
    case 'fall_asleep':
      await fallAsleep(ctx.baby);
      button = BUTTON.wakeUp;
      break;
    }

    ctx.reply('Roger that!', Markup.keyboard([
      [button]
    ]));
  } catch (error) {
    console.error(error)
    ctx.reply('Sorry but there is some unexpected error happened and I cannot help you this time')
  }
});

tf.launch({
  allowedUpdates: ['callback_query', 'message'],
});

async function fallAsleep(baby) {
  console.log('register asleep', baby)
  await data.set({
    table: 'regime',
    type: 'fallAsleep',
    babyId: baby.key,
    at: new Date().toISOString()
  });
}

async function wakeUp(baby) {
  console.log('register wekeup', baby)
  await data.set({
    table: 'regime',
    type: 'wakeUp',
    babyId: baby.key,
    at: new Date().toISOString()
  });
}

exports.handler = async function postMessage (req) {
  const body = arc.http.helpers.bodyParser(req);
  console.log('received request');
  tf.handleUpdate(body);

  return {
    statusCode: 200,
  };
}
