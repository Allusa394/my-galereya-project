// Telegram-бот галереи. Работает на Vercel как serverless-функция (webhook).
// Токен берётся из переменной окружения BOT_TOKEN (задаётся в настройках Vercel).
import { Bot, InlineKeyboard, webhookCallback } from 'grammy';

const token = process.env.BOT_TOKEN;
if (!token) throw new Error('BOT_TOKEN не задан в переменных окружения Vercel');

// Адрес витрины (Mini App). По умолчанию — тот же проект на Vercel.
const WEBAPP_URL =
  process.env.WEBAPP_URL ||
  (process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL + '/' : '');

const bot = new Bot(token);

const galleryKeyboard = () =>
  new InlineKeyboard().webApp('🖼 Открыть галерею', WEBAPP_URL);

bot.command('start', (ctx) =>
  ctx.reply(
    'Добро пожаловать в галерею авторских картин маслом.\n\n' +
      'Нажмите кнопку ниже — откроется витрина: каталог, фильтр по художникам и примерка картины на вашей стене.',
    { reply_markup: galleryKeyboard() }
  )
);

bot.command('gallery', (ctx) =>
  ctx.reply('Открыть витрину:', { reply_markup: galleryKeyboard() })
);

// На любое другое сообщение — тоже предлагаем открыть галерею
bot.on('message', (ctx) =>
  ctx.reply('Чтобы посмотреть картины, откройте галерею:', {
    reply_markup: galleryKeyboard(),
  })
);

export default webhookCallback(bot, 'https');
