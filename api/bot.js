// ============================================================
// Галерея Primavera — Telegram-бот
//
// Для клиентов: /start → кнопка «Открыть галерею»
// Для Аллы:     добавление и правка картин прямо из Telegram
//
// Картины хранятся в data.json на GitHub — бот пишет туда через GitHub API,
// а затем сам публикует новую версию сайта через Vercel API (проект не
// связан с репозиторием, поэтому коммит сам по себе сборку не запускает).
//
// Переменные окружения (Vercel → Settings → Environment Variables):
//   BOT_TOKEN          — токен бота от @BotFather
//   ADMIN_CHAT_ID      — Telegram ID администратора (только он правит каталог)
//   GITHUB_TOKEN       — токен с правом записи в репозиторий
//   VERCEL_TOKEN       — токен Vercel для публикации сайта
//   VERCEL_PROJECT_ID  — id проекта на Vercel
//   VERCEL_TEAM_ID     — id команды на Vercel
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

// Черновик карточки шлём без разметки: в названии картины может быть
// любой символ, а бот потом читает этот же текст обратно как память о диалоге.
function sayPlain(chatId, text, extra = {}) {
  return tg('sendMessage', { chat_id: chatId, text, ...extra });
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

// ---------- Публикация сайта ----------
//
// Проект не связан с GitHub-репозиторием, поэтому коммит сам по себе сайт
// не пересобирает. Бот публикует новую версию сам: берёт файлы последнего
// деплоя, подменяет в нём data.json (и добавляет новую картинку) и просит
// Vercel собрать из этого набора. Загружаются только изменённые файлы —
// остальные Vercel берёт из своего хранилища по их отпечатку (sha1).

const crypto = require('crypto');

function vercelReady() {
  return Boolean(process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID);
}

function vercelQuery(extra = '') {
  const team = process.env.VERCEL_TEAM_ID;
  return (team ? `?teamId=${team}` : '?') + (extra ? '&' + extra : '');
}

async function vercel(path, options = {}) {
  const resp = await fetch(`https://api.vercel.com${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const body = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(`Vercel ${resp.status}: ${body.error?.message || 'не удалось опубликовать'}`);
  }
  return body;
}

// Кладёт содержимое файла в хранилище Vercel, возвращает его отпечаток.
async function uploadFile(buffer) {
  const sha = crypto.createHash('sha1').update(buffer).digest('hex');
  const resp = await fetch(`https://api.vercel.com/v2/files${vercelQuery()}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
      'Content-Type': 'application/octet-stream',
      'x-vercel-digest': sha,
      'Content-Length': String(buffer.length)
    },
    body: buffer
  });
  if (!resp.ok) {
    throw new Error(`Vercel ${resp.status}: не удалось загрузить файл`);
  }
  return sha;
}

// Собирает плоский список исходных файлов последнего деплоя.
function flattenFiles(nodes, prefix = '') {
  const out = [];
  for (const node of nodes || []) {
    const path = (prefix + '/' + node.name).replace(/^\//, '');
    if (node.type === 'directory') {
      out.push(...flattenFiles(node.children, path));
    } else if (path.startsWith('src/')) {
      // out/... — это результат сборки, в новый деплой его передавать нельзя
      out.push({ file: path.slice(4), sha: node.uid });
    }
  }
  return out;
}

async function publishSite(catalog, image) {
  const list = await vercel(`/v6/deployments${vercelQuery(`projectId=${process.env.VERCEL_PROJECT_ID}&limit=5`)}`);
  const base = (list.deployments || []).find(d => d.state !== 'ERROR' && d.state !== 'CANCELED');
  if (!base) throw new Error('не нашёл предыдущую версию сайта');

  const tree = await vercel(`/v6/deployments/${base.uid}/files${vercelQuery()}`);
  const files = flattenFiles(Array.isArray(tree) ? tree : tree.files);
  if (!files.length) throw new Error('не удалось прочитать состав сайта');

  const dataSha = await uploadFile(Buffer.from(JSON.stringify(catalog, null, 2) + '\n', 'utf8'));
  const dataEntry = files.find(f => f.file === 'data.json');
  if (dataEntry) dataEntry.sha = dataSha;
  else files.push({ file: 'data.json', sha: dataSha });

  if (image) {
    const imageSha = await uploadFile(Buffer.from(image.base64, 'base64'));
    const existing = files.find(f => f.file === image.path);
    if (existing) existing.sha = imageSha;
    else files.push({ file: image.path, sha: imageSha });
  }

  const deployment = await vercel(`/v13/deployments${vercelQuery('forceNew=1')}`, {
    method: 'POST',
    body: JSON.stringify({
      name: 'my-galereya-project',
      project: process.env.VERCEL_PROJECT_ID,
      target: 'production',
      files
    })
  });

  return deployment.id;
}

// Сохраняет изменения в репозиторий и сразу публикует сайт.
// Если публикация недоступна — каталог всё равно записан, о чём и сообщаем.
async function saveAndPublish(catalog, message, image) {
  await commitCatalog(catalog, message, image);
  if (!vercelReady()) return { published: false, reason: 'публикация сайта не настроена' };

  try {
    await publishSite(catalog, image);
    return { published: true };
  } catch (err) {
    console.error('publish error:', err);
    return { published: false, reason: err.message };
  }
}

function publishNote(result) {
  return result.published
    ? '\n\nВ приложении появится через 1–2 минуты.'
    : `\n\n⚠️ В каталог записал, но сайт обновить не вышло: ${esc(result.reason)}`;
}

// ---------- Вспомогательное ----------

function formatPrice(value) {
  return Number(value).toLocaleString('ru-RU') + ' ₽';
}

// Названия картин пишет человек — символы < > & сломали бы разметку сообщения.
function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
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

// «Андрей Соколов» → sokolov. Нужен для фильтра по художнику в приложении.
const TRANSLIT = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
  й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '',
  э: 'e', ю: 'yu', я: 'ya'
};

function slugifyArtist(label) {
  const words = String(label).trim().split(/\s+/);
  const surname = words.length > 1 ? words[words.length - 1] : words[0];
  const slug = surname.toLowerCase().split('').map(ch => TRANSLIT[ch] ?? ch).join('')
    .replace(/[^a-z0-9]/g, '');
  return slug || 'artist';
}

// Находит художника среди уже заведённых — по имени, фамилии или slug.
function matchArtist(catalog, input) {
  const needle = String(input).trim().toLowerCase();
  if (!needle) return null;

  const known = [];
  (catalog.artists || []).forEach(a => known.push({ label: a.name, slug: slugifyArtist(a.name) }));
  catalog.paintings.forEach(p => {
    if (p.artistLabel && !known.some(k => k.slug === p.artist)) {
      known.push({ label: p.artistLabel, slug: p.artist });
    }
  });

  return known.find(k =>
    k.label.toLowerCase() === needle ||
    k.slug === needle ||
    k.label.toLowerCase().split(/\s+/).includes(needle)) || null;
}

function parseSize(input) {
  const match = String(input).match(/(\d+)\s*[x×х*]\s*(\d+)/i);
  if (!match) return null;
  return { width: Number(match[1]), height: Number(match[2]) };
}

function parsePrice(input) {
  const digits = String(input).replace(/[^\d]/g, '');
  return digits ? Number(digits) : null;
}

async function downloadTelegramFile(fileId) {
  const info = await tg('getFile', { file_id: fileId });
  if (!info.ok) throw new Error('не получилось скачать фото из Telegram');

  const filePath = info.result.file_path;
  const resp = await fetch(`https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${filePath}`);
  if (!resp.ok) throw new Error('не получилось скачать фото из Telegram');

  const buffer = Buffer.from(await resp.arrayBuffer());
  const ext = (filePath.split('.').pop() || 'jpg').toLowerCase();
  return { base64: buffer.toString('base64'), ext: ext === 'jpeg' ? 'jpg' : ext };
}

// Достаёт file_id самого крупного варианта фото (или картинки, присланной файлом).
function extractPhotoId(message) {
  if (Array.isArray(message.photo) && message.photo.length) {
    return message.photo[message.photo.length - 1].file_id;
  }
  if (message.document && String(message.document.mime_type || '').startsWith('image/')) {
    return message.document.file_id;
  }
  return null;
}

// ---------- Добавление картины ----------

async function addPainting({ title, description, artistLabel, width, height, price, fileId }) {
  const catalog = await readCatalog();

  const duplicate = catalog.paintings.find(p =>
    p.title.trim().toLowerCase() === title.trim().toLowerCase());
  if (duplicate) {
    return { duplicate };
  }

  const known = matchArtist(catalog, artistLabel);
  const label = known ? known.label : artistLabel.trim();
  const slug = known ? known.slug : slugifyArtist(artistLabel);

  const photo = await downloadTelegramFile(fileId);
  const id = nextPaintingId(catalog.paintings);
  const imagePath = `images/${id}.${photo.ext}`;

  catalog.paintings.push({
    id,
    title: title.trim(),
    description: description.trim(),
    artist: slug,
    artistLabel: label,
    technique: DEFAULT_TECHNIQUE,
    width,
    height,
    year: new Date().getFullYear(),
    price,
    imageUrl: imagePath
  });

  const result = await saveAndPublish(catalog, `update: добавлена картина «${title.trim()}» (из Telegram)`, {
    path: imagePath,
    base64: photo.base64
  });

  return { id, label, isNewArtist: !known, publish: result };
}

// ---------- Мастер: пошаговый опрос ----------

const DRAFT_HEADER = '🖼 Новая картина';
const EMPTY = '—';

const STEPS = [
  { key: 'Название', ask: 'напиши название картины', placeholder: 'Скалы у моря' },
  { key: 'Описание', ask: 'напиши описание — одно-два предложения', placeholder: 'Тёплые скалы над морем...' },
  { key: 'Художник', ask: 'выбери художника кнопкой ниже', placeholder: '' },
  { key: 'Размер', ask: 'размер в сантиметрах — ширина на высоту', placeholder: '60x80' },
  { key: 'Цена', ask: 'цена в рублях', placeholder: '35000' }
];

// Список художников в стабильном порядке — на нём строятся кнопки выбора.
function artistNames(catalog) {
  const names = [];
  (catalog.artists || []).forEach(a => { if (a.name && !names.includes(a.name)) names.push(a.name); });
  catalog.paintings.forEach(p => { if (p.artistLabel && !names.includes(p.artistLabel)) names.push(p.artistLabel); });
  return names;
}

function renderDraft(draft, hint) {
  const lines = STEPS.map(step => `${step.key}: ${draft[step.key] || EMPTY}`);
  return `${DRAFT_HEADER}\n\n${lines.join('\n')}\n\n${hint}`;
}

function parseDraft(text) {
  const draft = {};
  String(text).split('\n').forEach(line => {
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (!match) return;
    const key = match[1].trim();
    const value = match[2].trim();
    if (STEPS.some(s => s.key === key) && value && value !== EMPTY) {
      draft[key] = value;
    }
  });
  return draft;
}

function currentStep(draft) {
  return STEPS.find(step => !draft[step.key]) || null;
}

function isDraftMessage(text) {
  return typeof text === 'string' && text.startsWith(DRAFT_HEADER);
}

// Отправляет следующий вопрос мастера. Черновик живёт прямо в тексте
// сообщения — поэтому боту не нужна база данных, чтобы помнить диалог.
async function askNextStep(chatId, draft) {
  const step = currentStep(draft);

  if (!step) {
    await sayPlain(chatId, renderDraft(draft, 'Шаг 6 из 6 — пришли фото картины ответом на это сообщение'), {
      reply_markup: { force_reply: true, input_field_placeholder: 'Прикрепи фото' }
    });
    return;
  }

  const number = STEPS.indexOf(step) + 1;
  const hint = `Шаг ${number} из 6 — ${step.ask}`;

  if (step.key === 'Художник') {
    const catalog = await readCatalog();
    const names = artistNames(catalog);

    await sayPlain(chatId, renderDraft(draft, hint + '\n(или пришли имя нового художника ответом на это сообщение)'), {
      reply_markup: {
        inline_keyboard: names.map((name, index) => [{ text: name, callback_data: `artist:${index}` }])
      }
    });
    return;
  }

  await sayPlain(chatId, renderDraft(draft, hint), {
    reply_markup: { force_reply: true, input_field_placeholder: step.placeholder || 'Напиши ответ' }
  });
}

// Финал мастера: пришло фото — собираем карточку и публикуем.
async function finishWizard(chatId, draft, fileId) {
  const size = parseSize(draft['Размер']);
  const price = parsePrice(draft['Цена']);

  if (!size || !price) {
    await say(chatId, '❌ Размер или цена записаны непонятно. Начни заново: /add');
    return;
  }

  const waiting = await say(chatId, '⏳ Загружаю картину в галерею...');

  const result = await addPainting({
    title: draft['Название'],
    description: draft['Описание'],
    artistLabel: draft['Художник'],
    width: size.width,
    height: size.height,
    price,
    fileId
  });

  const messageId = waiting?.result?.message_id;
  if (messageId) {
    await tg('deleteMessage', { chat_id: chatId, message_id: messageId }).catch(() => {});
  }

  if (result.duplicate) {
    await say(chatId, `⚠️ Картина «${esc(result.duplicate.title)}» уже есть в каталоге (<code>${result.duplicate.id}</code>). Ничего не менял.`);
    return;
  }

  await say(chatId,
    `✅ Готово! Картина <b>${esc(draft['Название'])}</b> добавлена под номером <code>${result.id}</code>.\n\n` +
    `Художник: ${esc(result.label)}\n` +
    `Размер: ${size.width}×${size.height} см\n` +
    `Цена: ${formatPrice(price)}` +
    publishNote(result.publish) +
    (result.isNewArtist
      ? `\n\n⚠️ Художник «${esc(result.label)}» новый — в разделе «Художники» его карточки пока нет, фото и биографию нужно добавить отдельно.`
      : ''));
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
    `<code>${p.id}</code> ${p.sold ? '🔴' : '🟢'} ${esc(p.title)} — ${formatPrice(p.price)}`);

  const sold = catalog.paintings.filter(p => p.sold).length;
  await say(chatId,
    `<b>Картины в галерее (${catalog.paintings.length})</b>\n\n` +
    lines.join('\n') +
    `\n\n🟢 в продаже: ${catalog.paintings.length - sold}   🔴 продано: ${sold}`);
}

// ---------- Правка картин ----------

async function cmdSold(chatId, id, sold) {
  if (!id) {
    await say(chatId, `Нужен номер картины: <code>${sold ? '/sold' : '/unsold'} p03</code>. Номера — /list`);
    return;
  }

  const catalog = await readCatalog();
  const painting = findPainting(catalog, id);

  if (!painting) {
    await say(chatId, `❌ Картины <code>${esc(id)}</code> нет. Посмотри номера: /list`);
    return;
  }

  if (sold) {
    painting.sold = true;
  } else {
    delete painting.sold;
  }

  const result = await saveAndPublish(catalog, `update: «${painting.title}» — ${sold ? 'продана' : 'снова в продаже'} (из Telegram)`);
  await say(chatId, `${sold ? '🔴' : '🟢'} «${esc(painting.title)}» — ${sold ? 'помечена проданной' : 'вернулась в продажу'}.` + publishNote(result));
}

async function cmdPrice(chatId, id, priceRaw) {
  if (!id) {
    await say(chatId, 'Нужен номер и новая цена: <code>/price p03 30000</code>. Номера — /list');
    return;
  }

  const price = parsePrice(priceRaw);
  if (!price) {
    await say(chatId, `❌ Не понял цену «${esc(priceRaw)}». Нужно так: <code>/price p03 30000</code>`);
    return;
  }

  const catalog = await readCatalog();
  const painting = findPainting(catalog, id);
  if (!painting) {
    await say(chatId, `❌ Картины <code>${esc(id)}</code> нет. Посмотри номера: /list`);
    return;
  }

  const was = painting.price;
  painting.price = price;

  const result = await saveAndPublish(catalog, `update: цена «${painting.title}» — ${price} (из Telegram)`);
  await say(chatId, `💰 «${esc(painting.title)}»: ${formatPrice(was)} → <b>${formatPrice(price)}</b>.` + publishNote(result));
}

async function cmdDeleteAsk(chatId, id) {
  if (!id) {
    await say(chatId, 'Нужен номер картины: <code>/del p03</code>. Номера — /list');
    return;
  }

  const catalog = await readCatalog();
  const painting = findPainting(catalog, id);

  if (!painting) {
    await say(chatId, `❌ Картины <code>${esc(id)}</code> нет. Посмотри номера: /list`);
    return;
  }

  await say(chatId,
    `Удалить «<b>${esc(painting.title)}</b>» (${formatPrice(painting.price)}) из галереи?\n\nЭто действие не отменить.`,
    {
      reply_markup: {
        inline_keyboard: [[
          { text: '🗑 Удалить', callback_data: `del:${painting.id}` },
          { text: 'Отмена', callback_data: 'cancel' }
        ]]
      }
    });
}

async function cmdDeleteConfirm(chatId, id) {
  const catalog = await readCatalog();
  const painting = findPainting(catalog, id);

  if (!painting) {
    await say(chatId, `❌ Картины <code>${esc(id)}</code> уже нет.`);
    return;
  }

  catalog.paintings = catalog.paintings.filter(p => p.id !== painting.id);
  const result = await saveAndPublish(catalog, `update: удалена картина «${painting.title}» (из Telegram)`);
  await say(chatId, `🗑 «${esc(painting.title)}» удалена из галереи.` + publishNote(result));
}

// ---------- Быстрый режим: фото с подписью из пяти строк ----------

const QUICK_FORMAT =
  'Нужно пять строк в подписи к фото:\n\n' +
  '<code>Название\nОписание\nХудожник\n60x80\n35000</code>';

async function quickAdd(chatId, message) {
  const lines = String(message.caption || '').split('\n').map(s => s.trim()).filter(Boolean);

  if (lines.length < 5) {
    await say(chatId, `❌ Не хватает данных. ${QUICK_FORMAT}`);
    return;
  }

  const [title, description, artistLabel, sizeRaw, priceRaw] = lines;
  const size = parseSize(sizeRaw);
  const price = parsePrice(priceRaw);

  if (!size) {
    await say(chatId, `❌ Не понял размер «${esc(sizeRaw)}». Нужно так: <code>60x80</code>`);
    return;
  }
  if (!price) {
    await say(chatId, `❌ Не понял цену «${esc(priceRaw)}». Нужно число: <code>35000</code>`);
    return;
  }

  const result = await addPainting({
    title, description, artistLabel,
    width: size.width, height: size.height, price,
    fileId: extractPhotoId(message)
  });

  if (result.duplicate) {
    await say(chatId, `⚠️ «${esc(result.duplicate.title)}» уже есть в каталоге (<code>${result.duplicate.id}</code>). Ничего не менял.`);
    return;
  }

  await say(chatId,
    `✅ Добавлена картина <b>${esc(title)}</b> — номер <code>${result.id}</code>.\n` +
    `${esc(result.label)}, ${size.width}×${size.height} см, ${formatPrice(price)}` +
    publishNote(result.publish) +
    (result.isNewArtist ? `\n\n⚠️ Художник «${esc(result.label)}» новый — карточки в разделе «Художники» у него пока нет.` : ''));
}

// ---------- Точка входа ----------

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, bot: 'primavera-gallery', version: 2 });
  }

  const update = req.body || {};
  const adminId = process.env.ADMIN_CHAT_ID;
  const channelId = process.env.ADMIN_CHANNEL_ID;

  try {
    if (update.callback_query) {
      await handleCallback(update.callback_query, adminId);
    } else if (update.message) {
      await handleMessage(update.message, adminId);
    } else if (update.channel_post && channelId && String(update.channel_post.chat.id) === String(channelId)) {
      // Служебный канал: пост с фото и подписью = новая картина в галерее.
      if (extractPhotoId(update.channel_post)) {
        await quickAdd(update.channel_post.chat.id, update.channel_post);
      }
    }
  } catch (err) {
    console.error('bot error:', err);
    const chatId = update.message?.chat?.id || update.callback_query?.message?.chat?.id || update.channel_post?.chat?.id;
    const allowed = chatId && ((adminId && String(chatId) === String(adminId)) || (channelId && String(chatId) === String(channelId)));
    if (allowed) {
      await say(chatId, `❌ Не получилось: ${err.message}`).catch(() => {});
    }
  }

  res.status(200).json({ ok: true });
};

async function handleMessage(message, adminId) {
  const chatId = message.chat.id;
  const text = (message.text || '').trim();
  const isAdmin = adminId && String(message.from?.id) === String(adminId);

  if (text.startsWith('/start')) {
    await cmdStart(message);
    return;
  }

  if (!isAdmin) return;

  // Ответ на сообщение-черновик — очередной шаг мастера.
  const repliedText = message.reply_to_message?.text;
  if (isDraftMessage(repliedText)) {
    await handleWizardReply(chatId, parseDraft(repliedText), message, text);
    return;
  }

  const photoId = extractPhotoId(message);
  if (photoId) {
    await quickAdd(chatId, message);
    return;
  }

  const [command, ...args] = text.split(/\s+/);

  switch (command) {
    case '/add':
      await askNextStep(chatId, {});
      break;
    case '/list':
      await cmdList(chatId);
      break;
    case '/sold':
      await cmdSold(chatId, args[0], true);
      break;
    case '/unsold':
      await cmdSold(chatId, args[0], false);
      break;
    case '/price':
      await cmdPrice(chatId, args[0], args[1]);
      break;
    case '/del':
      await cmdDeleteAsk(chatId, args[0]);
      break;
    default:
      if (command.startsWith('/')) await cmdHelp(chatId);
  }
}

async function handleWizardReply(chatId, draft, message, text) {
  const photoId = extractPhotoId(message);
  const step = currentStep(draft);

  if (photoId) {
    if (step) {
      await say(chatId, `❌ Сначала заполни «${step.key}» — ответь текстом на последнее сообщение.`);
      return;
    }
    await finishWizard(chatId, draft, photoId);
    return;
  }

  if (!step) {
    await say(chatId, 'Осталось только фото — пришли его ответом на сообщение с карточкой.');
    return;
  }

  if (!text) {
    await say(chatId, `❌ Жду текст: ${step.ask}`);
    return;
  }

  if (step.key === 'Размер' && !parseSize(text)) {
    await say(chatId, `❌ Не понял размер «${esc(text)}». Нужно так: <code>60x80</code> (ширина на высоту)`);
    return;
  }
  if (step.key === 'Цена' && !parsePrice(text)) {
    await say(chatId, `❌ Не понял цену «${esc(text)}». Нужно число: <code>35000</code>`);
    return;
  }

  draft[step.key] = text.replace(/\n/g, ' ');
  await askNextStep(chatId, draft);
}

async function handleCallback(callback, adminId) {
  const chatId = callback.message?.chat?.id;
  const isAdmin = adminId && String(callback.from?.id) === String(adminId);

  await tg('answerCallbackQuery', { callback_query_id: callback.id }).catch(() => {});
  if (!isAdmin || !chatId) return;

  const data = String(callback.data || '');

  if (data === 'cancel') {
    await tg('editMessageText', {
      chat_id: chatId,
      message_id: callback.message.message_id,
      text: 'Отменено — ничего не изменилось.'
    }).catch(() => {});
    return;
  }

  if (data.startsWith('del:')) {
    await tg('editMessageReplyMarkup', {
      chat_id: chatId,
      message_id: callback.message.message_id,
      reply_markup: { inline_keyboard: [] }
    }).catch(() => {});
    await cmdDeleteConfirm(chatId, data.slice(4));
    return;
  }

  if (data.startsWith('artist:')) {
    const draft = parseDraft(callback.message.text || '');
    const catalog = await readCatalog();
    const name = artistNames(catalog)[Number(data.split(':')[1])];
    if (!name) return;

    draft['Художник'] = name;
    await tg('editMessageReplyMarkup', {
      chat_id: chatId,
      message_id: callback.message.message_id,
      reply_markup: { inline_keyboard: [] }
    }).catch(() => {});
    await askNextStep(chatId, draft);
  }
}
