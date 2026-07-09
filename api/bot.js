module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true });
  }

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const WEBAPP_URL = (process.env.WEBAPP_URL || 'https://my-galereya-project.vercel.app').replace(/\/$/, '');
  const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

  try {
    const update = req.body;
    const text = update?.message?.text;

    if (text?.startsWith('/start')) {
      const chatId = update.message.chat.id;
      const source = text.split(' ')[1] || 'прямой переход';

      if (ADMIN_CHAT_ID) {
        const username = update.message.from?.username;
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: ADMIN_CHAT_ID,
            text: `🔔 Переход в галерею\nИсточник: ${source}\nПользователь: ${username ? '@' + username : chatId}`
          })
        });
      }

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '🎨 Галерея Primavera\n\nАвторские картины маслом для вашего интерьера.\n\nПримерьте любую картину на свою стену — загрузите фото и выберите идеальный вариант.\n\nПродолжая, вы соглашаетесь с Политикой конфиденциальности.',
          reply_markup: {
            inline_keyboard: [[{
              text: '🖼 Открыть галерею',
              web_app: { url: WEBAPP_URL }
            }], [{
              text: '📄 Политика конфиденциальности',
              url: `${WEBAPP_URL}/privacy.html`
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
