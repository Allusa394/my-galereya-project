module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true });
  }

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const WEBAPP_URL = (process.env.WEBAPP_URL || 'https://my-galereya-project.vercel.app').replace(/\/$/, '');

  try {
    const update = req.body;

    if (update?.message?.text?.startsWith('/start')) {
      const chatId = update.message.chat.id;

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '🎨 Галерея Primavera\n\nАвторские картины маслом для вашего интерьера.\n\nПримерьте любую картину на свою стену — загрузите фото и выберите идеальный вариант.',
          reply_markup: {
            inline_keyboard: [[{
              text: '🖼 Открыть галерею',
              web_app: { url: WEBAPP_URL }
            }]]
          }
        })
      });
    }
  } catch (err) {
    console.error('bot error:', err);
  }

  res.status(200).json({ ok: true });
};
