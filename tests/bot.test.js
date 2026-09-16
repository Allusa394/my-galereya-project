// Прогон бота галереи на поддельных Telegram и GitHub.
// Живой каталог не трогается: data.json читается с диска в память.

const fs = require('fs');
const path = require('path');

const PROJECT = path.join(__dirname, '..');

process.env.BOT_TOKEN = 'TEST:TOKEN';
process.env.ADMIN_CHAT_ID = '1313466262';
process.env.GITHUB_TOKEN = 'ghp_test';
process.env.WEBAPP_URL = 'https://my-galereya-project.vercel.app';
process.env.ADMIN_CHANNEL_ID = '-1009999999';

const ADMIN = 1313466262;
const STRANGER = 555000111;

let catalog = JSON.parse(fs.readFileSync(path.join(PROJECT, 'data.json'), 'utf8'));
let outbox = [];      // что бот отправил в Telegram
let commits = [];     // что бот записал в GitHub
let failNextGithub = null;

function b64(str) { return Buffer.from(str, 'utf8').toString('base64'); }

globalThis.fetch = async (url, options = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : null;

  // ---- Telegram ----
  if (url.includes('api.telegram.org/file/')) {
    const fake = Buffer.from('FAKE-JPEG-BYTES-' + 'x'.repeat(64));
    return { ok: true, arrayBuffer: async () => fake.buffer.slice(fake.byteOffset, fake.byteOffset + fake.length) };
  }
  if (url.includes('api.telegram.org')) {
    const tgMethod = url.split('/').pop();
    if (tgMethod === 'getFile') {
      return { ok: true, json: async () => ({ ok: true, result: { file_path: 'photos/file_42.jpg' } }) };
    }
    outbox.push({ method: tgMethod, ...body });
    return { ok: true, json: async () => ({ ok: true, result: { message_id: outbox.length } }) };
  }

  // ---- GitHub ----
  if (failNextGithub) {
    const status = failNextGithub; failNextGithub = null;
    return { ok: false, status, json: async () => ({ message: 'Bad credentials' }) };
  }
  if (url.includes('/contents/data.json')) {
    return { ok: true, status: 200, json: async () => ({ content: b64(JSON.stringify(catalog, null, 2)), sha: 'filesha' }) };
  }
  if (url.includes('/git/ref/heads/')) {
    return { ok: true, status: 200, json: async () => ({ object: { sha: 'headsha' } }) };
  }
  if (url.includes('/git/commits/headsha')) {
    return { ok: true, status: 200, json: async () => ({ tree: { sha: 'treesha' } }) };
  }
  if (method === 'POST' && url.endsWith('/git/blobs')) {
    return { ok: true, status: 201, json: async () => ({ sha: 'blobsha', size: Buffer.from(body.content, 'base64').length }) };
  }
  if (method === 'POST' && url.endsWith('/git/trees')) {
    const dataEntry = body.tree.find(t => t.path === 'data.json');
    const imageEntry = body.tree.find(t => t.path !== 'data.json');
    if (dataEntry) catalog = JSON.parse(dataEntry.content);   // применяем запись
    commits.push({ image: imageEntry ? imageEntry.path : null });
    return { ok: true, status: 201, json: async () => ({ sha: 'newtree' }) };
  }
  if (method === 'POST' && url.endsWith('/git/commits')) {
    commits[commits.length - 1].message = body.message;
    return { ok: true, status: 201, json: async () => ({ sha: 'commitsha' }) };
  }
  if (method === 'PATCH' && url.includes('/git/refs/heads/')) {
    return { ok: true, status: 200, json: async () => ({}) };
  }

  throw new Error('Неожиданный запрос в тесте: ' + method + ' ' + url);
};

const handler = require(path.join(PROJECT, 'api', 'bot.js'));

const res = { status: () => ({ json: () => {} }) };
async function send(update) { outbox = []; await handler({ method: 'POST', body: update }, res); return outbox; }

function msg(text, from = ADMIN, extra = {}) {
  return { message: { chat: { id: from }, from: { id: from }, text, ...extra } };
}
function photoMsg(extra = {}, from = ADMIN) {
  return { message: { chat: { id: from }, from: { id: from }, photo: [{ file_id: 'small' }, { file_id: 'big' }], ...extra } };
}
// В русском формате цены разделитель — неразрывный пробел, приводим к обычному.
function lastText() {
  return outbox.filter(o => o.method === 'sendMessage').map(o => o.text).join('\n---\n')
    .replace(/[  ]/g, ' ');
}
function draftOf(sent) { return sent.filter(o => o.method === 'sendMessage').pop().text; }

let passed = 0, failed = 0;
function check(name, condition, details = '') {
  if (condition) { passed++; console.log('  ✅ ' + name); }
  else { failed++; console.log('  ❌ ' + name + (details ? '\n      ' + details : '')); }
}

(async () => {
  console.log('\n=== 1. Клиент: /start ===');
  let out = await send(msg('/start', STRANGER));
  const startMsg = out.find(o => o.chat_id === STRANGER);
  check('клиент получил приветствие с кнопкой',
    startMsg && JSON.stringify(startMsg.reply_markup).includes('web_app'));
  check('админу ушло уведомление о переходе',
    out.some(o => String(o.chat_id) === String(ADMIN) && o.text.includes('Переход в галерею')));

  console.log('\n=== 2. Чужой пытается командовать ===');
  out = await send(msg('/list', STRANGER));
  check('на /list от чужого бот молчит', out.length === 0, 'ответов: ' + out.length);
  out = await send(msg('/del p01', STRANGER));
  check('на /del от чужого бот молчит', out.length === 0);
  out = await send({ callback_query: { id: 'c1', from: { id: STRANGER }, data: 'del:p01', message: { chat: { id: STRANGER }, message_id: 1, text: 'x' } } });
  check('кнопка удаления от чужого не срабатывает',
    !commits.some(c => (c.message || '').includes('удалена')));

  console.log('\n=== 3. Список картин ===');
  out = await send(msg('/list'));
  check('в списке 12 картин и номера', lastText().includes('p12') && lastText().includes('12'));
  check('проданные помечены', lastText().includes('🔴'));

  console.log('\n=== 4. Мастер добавления по шагам ===');
  out = await send(msg('/add'));
  let draft = draftOf(out);
  check('шаг 1 спрашивает название', draft.includes('Шаг 1 из 6'));
  check('у шага есть принудительный ответ', out.pop().reply_markup?.force_reply === true);

  out = await send(msg('Тестовая картина', ADMIN, { reply_to_message: { text: draft } }));
  draft = draftOf(out);
  check('название записалось', draft.includes('Название: Тестовая картина'));
  check('шаг 2 — описание', draft.includes('Шаг 2 из 6'));

  out = await send(msg('Проверочное описание картины.', ADMIN, { reply_to_message: { text: draft } }));
  draft = draftOf(out);
  check('шаг 3 — художник кнопками', draft.includes('Шаг 3 из 6'));
  const buttons = out.filter(o => o.method === 'sendMessage').pop().reply_markup?.inline_keyboard || [];
  check('кнопки художников из каталога', buttons.length === 3 && buttons[0][0].text.includes('Соколов'),
    JSON.stringify(buttons));

  out = await send({ callback_query: { id: 'c2', from: { id: ADMIN }, data: 'artist:1', message: { chat: { id: ADMIN }, message_id: 7, text: draft } } });
  draft = draftOf(out);
  check('художник выбран кнопкой', draft.includes('Художник: Елена Волкова'));
  check('шаг 4 — размер', draft.includes('Шаг 4 из 6'));

  out = await send(msg('большая', ADMIN, { reply_to_message: { text: draft } }));
  check('кривой размер отклонён', lastText().includes('Не понял размер'));

  out = await send(msg('60х80', ADMIN, { reply_to_message: { text: draft } }));  // русская «х»
  draft = draftOf(out);
  check('размер с русской «х» принят', draft.includes('Размер: 60х80'));

  out = await send(msg('сколько-то', ADMIN, { reply_to_message: { text: draft } }));
  check('кривая цена отклонена', lastText().includes('Не понял цену'));

  out = await send(msg('35 000', ADMIN, { reply_to_message: { text: draft } }));
  draft = draftOf(out);
  check('шаг 6 — просит фото', draft.includes('Шаг 6 из 6'));

  out = await send(msg('ещё текст', ADMIN, { reply_to_message: { text: draft } }));
  check('текст вместо фото — понятная подсказка', lastText().includes('Осталось только фото'));

  const before = catalog.paintings.length;
  out = await send(photoMsg({ reply_to_message: { text: draft } }));
  const added = catalog.paintings[catalog.paintings.length - 1];
  check('картина добавлена в каталог', catalog.paintings.length === before + 1);
  check('номер p13', added.id === 'p13', JSON.stringify(added));
  check('поля заполнены верно',
    added.title === 'Тестовая картина' && added.artist === 'volkova' &&
    added.artistLabel === 'Елена Волкова' && added.width === 60 && added.height === 80 &&
    added.price === 35000 && added.technique === 'Холст, масло' && added.imageUrl === 'images/p13.jpg',
    JSON.stringify(added));
  check('фото и каталог ушли одним коммитом',
    commits[commits.length - 1].image === 'images/p13.jpg');
  check('бот отчитался номером', lastText().includes('p13') && lastText().includes('✅'));

  console.log('\n=== 5. Быстрый режим: фото с подписью ===');
  out = await send(photoMsg({ caption: 'Вторая тестовая\nОписание второй.\nСоколов\n40x30\n28000' }));
  const quick = catalog.paintings[catalog.paintings.length - 1];
  check('добавлена p14', quick.id === 'p14' && quick.title === 'Вторая тестовая');
  check('художник найден по фамилии', quick.artist === 'sokolov' && quick.artistLabel === 'Андрей Соколов');
  check('цена и размер разобраны', quick.price === 28000 && quick.width === 40 && quick.height === 30);

  console.log('\n=== 6. Защита от повторов и мусора ===');
  const countBefore = catalog.paintings.length;
  out = await send(photoMsg({ caption: 'Вторая тестовая\nОписание второй.\nСоколов\n40x30\n28000' }));
  check('дубль по названию не добавлен', catalog.paintings.length === countBefore);
  check('бот предупредил о дубле', lastText().includes('уже есть в каталоге'));

  out = await send(photoMsg({ caption: 'Только название' }));
  check('неполная подпись — подсказка формата', lastText().includes('Не хватает данных'));
  check('в каталог ничего не попало', catalog.paintings.length === countBefore);

  out = await send(photoMsg({ caption: 'Картина\nОписание\nСоколов\nбольшая\n28000' }));
  check('кривой размер в подписи отклонён', lastText().includes('Не понял размер'));

  console.log('\n=== 7. Правки: продано, цена, удаление ===');
  out = await send(msg('/sold p13'));
  check('p13 помечена проданной', catalog.paintings.find(p => p.id === 'p13').sold === true);
  out = await send(msg('/unsold p13'));
  check('p13 вернулась в продажу', catalog.paintings.find(p => p.id === 'p13').sold === undefined);

  out = await send(msg('/price p13 41000'));
  check('цена изменена', catalog.paintings.find(p => p.id === 'p13').price === 41000);
  check('бот показал старую и новую цену', lastText().includes('35 000') && lastText().includes('41 000'));

  out = await send(msg('/sold p99'));
  check('несуществующий номер — понятная ошибка', lastText().includes('нет'));
  out = await send(msg('/price'));
  check('/price без аргументов — подсказка', lastText().includes('Нужен номер'));
  out = await send(msg('/sold'));
  check('/sold без номера — подсказка', lastText().includes('Нужен номер'));

  out = await send(msg('/del p13'));
  check('удаление спрашивает подтверждение',
    lastText().includes('Удалить') && JSON.stringify(out).includes('del:p13'));
  check('без подтверждения картина на месте', catalog.paintings.some(p => p.id === 'p13'));

  out = await send({ callback_query: { id: 'c3', from: { id: ADMIN }, data: 'cancel', message: { chat: { id: ADMIN }, message_id: 9, text: 'Удалить' } } });
  check('отмена ничего не удаляет', catalog.paintings.some(p => p.id === 'p13'));

  out = await send({ callback_query: { id: 'c4', from: { id: ADMIN }, data: 'del:p13', message: { chat: { id: ADMIN }, message_id: 9, text: 'Удалить' } } });
  check('после подтверждения картина удалена', !catalog.paintings.some(p => p.id === 'p13'));
  out = await send({ callback_query: { id: 'c5', from: { id: ADMIN }, data: 'del:p13', message: { chat: { id: ADMIN }, message_id: 9, text: 'Удалить' } } });
  check('повторное удаление не ломает бота', lastText().includes('уже нет'));

  console.log('\n=== 8. Служебный канал ===');
  const beforeChannel = catalog.paintings.length;
  out = await send({ channel_post: { chat: { id: -1009999999 }, photo: [{ file_id: 'big' }], caption: 'Из канала\nОписание из канала.\nОрлов\n50x70\n39000' } });
  check('пост в служебном канале добавил картину', catalog.paintings.length === beforeChannel + 1);
  out = await send({ channel_post: { chat: { id: -1001111111 }, photo: [{ file_id: 'big' }], caption: 'Чужой канал\nОписание.\nОрлов\n50x70\n39000' } });
  check('пост в чужом канале проигнорирован', catalog.paintings.length === beforeChannel + 1);

  console.log('\n=== 9. Сломанный доступ к GitHub ===');
  failNextGithub = 401;
  out = await send(msg('/list'));
  check('ошибка GitHub — бот пишет админу, а не падает', lastText().includes('Не получилось'));

  console.log('\n=== 10. Опасные символы в названии ===');
  out = await send(photoMsg({ caption: 'Море & небо <солнце>\nОписание.\nОрлов\n30x40\n15000' }));
  const tricky = catalog.paintings[catalog.paintings.length - 1];
  check('картина с < > & добавлена', tricky.title === 'Море & небо <солнце>');
  const reply = outbox.filter(o => o.method === 'sendMessage').pop();
  check('в сообщении символы экранированы',
    reply.text.includes('&amp;') && reply.text.includes('&lt;солнце&gt;'), reply.text);

  console.log('\n=== 11. Каталог остался валидным ===');
  check('JSON собирается без ошибок', typeof JSON.parse(JSON.stringify(catalog)) === 'object');
  check('у всех картин есть обязательные поля',
    catalog.paintings.every(p => p.id && p.title && p.artist && p.imageUrl && p.price && p.width && p.height));
  check('исходные 12 картин на месте',
    ['p01', 'p05', 'p12'].every(id => catalog.paintings.some(p => p.id === id)));

  console.log(`\n${'='.repeat(46)}\nПройдено: ${passed}   Провалено: ${failed}\n${'='.repeat(46)}`);
  process.exit(failed ? 1 : 0);
})();
