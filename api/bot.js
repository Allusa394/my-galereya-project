// ============================================================
// Галерея Primavera — Telegram-бот
//
// Для клиентов: /start → кнопка «Открыть галерею»
// Для Аллы:     добавление и правка картин прямо из Telegram
//
// Картины хранятся в data.json на GitHub. Бот пишет туда через
// GitHub API — Vercel видит новый коммит и пересобирает сайт.
//
// Переменные окружения (Vercel → Settings → Environment Variables):
//   BOT_TOKEN          — токен бота от @BotFather
//   ADMIN_CHAT_ID      — Telegram ID администратора (только он правит каталог)
//   GITHUB_TOKEN       — токен с правом записи в репозиторий
//   WEBAPP_URL         — адрес приложения (по умолчанию my-galereya-project.vercel.app)
//   ADMIN_CHANNEL_ID   — (необязательно) id служебного канала для постов-карточек
// ============================================================

const REPO = 'Allusa394/my-galereya-project';
const BRANCH = 'main';
const DEFAULT_TECHNIQUE = 'Холст, масло';

// ---------- Telegram ----------

async function tg(method, payload) {
  const resp = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return resp.json();
}

function say(chatId, text, extra = {}) {
  return tg('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', ...extra });
}

// ---------- GitHub ----------

function ghHeaders() {
  return {
    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'User-Agent': 'primavera-gallery-bot'
  };
}

async function gh(path, options = {}) {
  const resp = await fetch(`https://api.github.com${path}`, { headers: ghHeaders(), ...options });
  const body = await resp.json();
  if (!resp.ok) {
    throw new Error(`GitHub ${resp.status}: ${body.message || 'неизвестная ошибка'}`);
  }
  return body;
}

// Читает каталог картин из репозитория (всегда свежий, без кэша).
async function readCatalog() {
  const file = await gh(`/repos/${REPO}/contents/data.json?ref=${BRANCH}&t=${Date.now()}`);
  const json = Buffer.from(file.content.replace(/\n/g, ''), 'base64').toString('utf8');
  return JSON.parse(json);
}

// Записывает каталог и (необязательно) картинку ОДНИМ коммитом,
// чтобы Vercel пересобрал сайт один раз, а не дважды.
async function commitCatalog(catalog, message, image) {
  const ref = await gh(`/repos/${REPO}/git/ref/heads/${BRANCH}`);
  const headSha = ref.object.sha;
  const headCommit = await gh(`/repos/${REPO}/git/commits/${headSha}`);

  const tree = [{
    path: 'data.json',
    mode: '100644',
    type: 'blob',
    content: JSON.stringify(catalog, null, 2) + '\n'
  }];

  if (image) {
    const blob = await gh(`/repos/${REPO}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify({ content: image.base64, encoding: 'base64' })
    });
    tree.push({ path: image.path, mode: '100644', type: 'blob', sha: blob.sha });
  }

  const newTree = await gh(`/repos/${REPO}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ base_tree: headCommit.tree.sha, tree })
  });

  const commit = await gh(`/repos/${REPO}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({ message, tree: newTree.sha, parents: [headSha] })
  });

  await gh(`/repos/${REPO}/git/refs/heads/${BRANCH}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha })
  });

  return commit.sha;
}

// ---------- Вспомогательное ----------

function formatPrice(value) {
  return Number(value).toLocaleString('ru-RU') + ' ₽';
}

function nextPaintingId(paintings) {
  const numbers = paintings
    .map(p => Number(String(p.id).replace(/\D/g, '')))
    .filter(n => !Number.isNaN(n));
  const next = (numbers.length ? Math.max(...numbers) : 0) + 1;
  return 'p' + String(next).padStart(2, '0');
}

function findPainting(catalog, id) {
  const wanted = String(id).trim().toLowerCase();
  return catalog.paintings.find(p => String(p.id).toLowerCase() === wanted);
}

// ---------- Команды ----------

async function cmdStart(message) {
  const chatId = message.chat.id;
  const webapp = (process.env.WEBAPP_URL || 'https://my-galereya-project.vercel.app').replace(/\/$/, '');
  const source = (message.text || '').split(' ')[1] || 'прямой переход';
  const adminId = process.env.ADMIN_CHAT_ID;

  if (adminId && String(chatId) !== String(adminId)) {
    const username = message.from?.username;
    await say(adminId, `🔔 Переход в галерею\nИсточник: ${source}\nПользователь: ${username ? '@' + username : chatId}`);
  }

  await say(chatId,
    '🎨 Галерея Primavera\n\nАвторские картины маслом для вашего интерьера.\n\n' +
    'Примерьте любую картину на свою стену — загрузите фото и выберите идеальный вариант.\n\n' +
    'Продолжая, вы соглашаетесь с Политикой конфиденциальности.',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🖼 Открыть галерею', web_app: { url: webapp } }],
          [{ text: '📄 Политика конфиденциальности', url: `${webapp}/privacy.html` }]
        ]
      }
    });
}

async function cmdHelp(chatId) {
  await say(chatId,
    '<b>Управление галереей</b>\n\n' +
    '/add — добавить картину (бот спросит по шагам)\n' +
    '/list — список картин с номерами\n' +
    '/sold p03 — пометить проданной\n' +
    '/unsold p03 — вернуть в продажу\n' +
    '/price p03 30000 — изменить цену\n' +
    '/del p03 — удалить картину\n\n' +
    'Быстрый способ: пришли фото картины с подписью из пяти строк —\n' +
    '<code>Название\nОписание\nХудожник\n60x80\n35000</code>');
}

async function cmdList(chatId) {
  const catalog = await readCatalog();
  if (!catalog.paintings.length) {
    await say(chatId, 'В каталоге пока нет картин. Добавь первую: /add');
    return;
  }

  const lines = catalog.paintings.map(p =>
    `<code>${p.id}</code> ${p.sold ? '🔴' : '🟢'} ${p.title} — ${formatPrice(p.price)}`);

  const sold = catalog.paintings.filter(p => p.sold).length;
  await say(chatId,
    `<b>Картины в галерее (${catalog.paintings.length})</b>\n\n` +
    lines.join('\n') +
    `\n\n🟢 в продаже: ${catalog.paintings.length - sold}   🔴 продано: ${sold}`);
}

// ---------- Точка входа ----------

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, bot: 'primavera-gallery', version: 2 });
  }

  const update = req.body || {};
  const adminId = process.env.ADMIN_CHAT_ID;

  try {
    const message = update.message;

    if (message) {
      const chatId = message.chat.id;
      const text = (message.text || '').trim();
      const isAdmin = adminId && String(message.from?.id) === String(adminId);

      if (text.startsWith('/start')) {
        await cmdStart(message);
      } else if (isAdmin && (text === '/help' || text === '/admin')) {
        await cmdHelp(chatId);
      } else if (isAdmin && text === '/list') {
        await cmdList(chatId);
      }
    }
  } catch (err) {
    console.error('bot error:', err);
    const chatId = update.message?.chat?.id;
    if (chatId && adminId && String(chatId) === String(adminId)) {
      await say(chatId, `❌ Ошибка: ${err.message}`).catch(() => {});
    }
  }

  res.status(200).json({ ok: true });
};
