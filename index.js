const { Telegraf, session } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

(async () => {
  try {
    await bot.telegram.deleteWebhook();
    console.log("✅ Webhook deleted");
  } catch (err) {
    console.error("❌ Failed to delete webhook", err);
  }
})();

bot.use(session());

const steps = [
  { field: 'service', question: 'Какую услугу выбираете? (креативы / лендинг / брендинг)' },
  { field: 'description', question: 'Опиши задачу или прикрепи ссылку.' },
  { field: 'deadline', question: 'Когда нужно завершить?' },
  { field: 'contact', question: 'Ваш Telegram или email.' },
];

bot.start(ctx => {
  ctx.session.step = 0;
  ctx.session.data = {};
  ctx.reply('Привет! Расскажите о задаче:');
  ctx.reply(steps[0].question);
});

bot.on('text', async ctx => {
  const step = ctx.session.step;
  ctx.session.data[steps[step].field] = ctx.message.text;

  if (step + 1 < steps.length) {
    ctx.session.step++;
    return ctx.reply(steps[ctx.session.step].question);
  }

  const msg = ctx.session.data;
  await ctx.telegram.sendMessage(process.env.CHAT_ID,
    `Новая заявка:\n` +
    `Услуга: ${msg.service}\n` +
    `Описание: ${msg.description}\n` +
    `Срок: ${msg.deadline}\n` +
    `Контакт: ${msg.contact}`
  );

  await ctx.reply('✅ Спасибо! Заявка получена.');
  ctx.session = null;
});

bot.launch({ dropPendingUpdates: true }).then(() => {
  console.log("🤖 Bot launched with polling");
});