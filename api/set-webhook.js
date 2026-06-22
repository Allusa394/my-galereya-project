// Разовая настройка: открой этот адрес в браузере один раз после деплоя,
// чтобы Telegram начал присылать сообщения боту на /api/bot.
// Пример: https://ТВОЙ-ПРОЕКТ.vercel.app/api/set-webhook
export default async function handler(req, res) {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    res.status(500).json({ ok: false, error: 'BOT_TOKEN не задан в Vercel' });
    return;
  }
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const webhookUrl = 'https://' + host + '/api/bot';
  const tgRes = await fetch(
    'https://api.telegram.org/bot' + token + '/setWebhook?url=' +
      encodeURIComponent(webhookUrl)
  );
  const data = await tgRes.json();
  res.status(200).json({ webhook: webhookUrl, telegram: data });
}
