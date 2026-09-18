# Правила работы с проектом Галерея Primavera

## Кто я в этом проекте

Я работаю здесь как **Jarvis** — персональный AI-разработчик Аллы.
Все мои правила, стиль, стандарты разработки — читай в DNA-файлах Jarvis:

```
C:/Users/alusa/OneDrive/Documents/Документы/projects/jarvis/CLAUDE.md      — правила работы
C:/Users/alusa/OneDrive/Documents/Документы/projects/jarvis/SOUL.md        — личность и стиль
C:/Users/alusa/OneDrive/Documents/Документы/projects/jarvis/MEMORY.md      — долгосрочная память
C:/Users/alusa/OneDrive/Documents/Документы/projects/jarvis/PROJECTS.md    — все проекты Аллы
C:/Users/alusa/OneDrive/Documents/Документы/projects/jarvis/GOALS.md       — текущие цели
```

Перед началом работы — прочитай эти файлы. Без них я работаю без контекста.

---

## Этот проект

**Галерея Primavera** — сайт + Telegram Mini App для продажи картин.

- Живой сайт: https://my-galereya-project.vercel.app
- Telegram бот: @primavera_gallery_bot
- GitHub: https://github.com/Allusa394/my-galereya-project

### Структура файлов

```
my-galereya-project/
├── index.html       — весь сайт (одна страница)
├── data.json        — данные: галерея, художник, 12 картин
├── images/          — фото картин (p01.jpg — p12.jpg)
└── docs/            — документация и деплой
```

### data.json — что внутри

- `gallery` — название, контакты (telegram, whatsapp, vk, tagline)
- `artists` — массив художников (name, photoUrl, bio)
- `paintings` — массив картин: id, title, artist, technique, width, height, year, price, imageUrl

### Бот: пополнение каталога из Telegram

Алла добавляет и правит картины прямо в переписке с ботом — код в `api/bot.js`.
Команды видит только Telegram ID из `ADMIN_CHAT_ID`, остальным бот отвечает как обычно.

Картины:
- фото без подписи → бот сам ведёт по шагам (название → описание → художник кнопкой → размер → цена)
- `/add` — то же самое, начиная с вопросов; фото с подписью из 5 строк — добавление одним сообщением
- `/list`, `/sold p03`, `/unsold p03`, `/price p03 30000`, `/del p03`
- `/title p03`, `/desc p03`, `/photo p03`, `/artist p03 Волкова` — с текстом правят сразу, без текста бот спрашивает
- если задан `ADMIN_CHANNEL_ID` — посты с полной подписью работают и в служебном канале

Художники:
- `/artists` — список с числом картин и пометками, есть ли фото и описание
- `/artist_add [Имя Фамилия]` — добавить (описание спросит, фото предложит сразу)
- `/artist_bio Волкова [текст]`, `/artist_photo Волкова`
- `/artist_del Волкова` — удаление только если у художника нет картин, иначе бот перечислит их и откажет
- при добавлении картины неизвестного художника бот предлагает кнопку «Завести карточку»

Фото художников лежат в `images/artists/<slug>.jpg`. При замене фото к `imageUrl`/`photoUrl`
дописывается `?v=<время>` — без этого телефон показывает старую картинку из кэша.

**Как бот помнит диалог без базы:** в своём вопросе он прячет невидимую ссылку —
`t.me/?f=<file_id>` (фото в мастере) или `t.me/?e=<что правим>` (правка одного поля).
Ответ приходит с этой меткой в `reply_to_message.entities`.

Бот пишет фото и `data.json` **одним коммитом** через GitHub Git Data API, а затем
**сам публикует сайт** через Vercel API. Состояние диалога живёт в тексте
сообщения-черновика (бот читает свой же текст через `reply_to_message`) — базы данных не нужно.

**Почему бот публикует сам:** проект на Vercel не связан с GitHub-репозиторием
(установка GitHub-приложения Vercel требует действия владельца в вебе), поэтому
коммит сборку не запускает. Бот берёт состав последнего деплоя, подменяет в нём
`data.json`, добавляет новую картинку и создаёт деплой — грузятся только изменённые
файлы, остальные Vercel берёт из хранилища по sha1. Важно: пути из API приходят с
префиксом `src/`, а ветка `out/` — это результат сборки, её передавать нельзя.

Переменные окружения в Vercel: `BOT_TOKEN`, `ADMIN_CHAT_ID`, `GITHUB_TOKEN`,
`VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_TEAM_ID`, `WEBAPP_URL`,
`ADMIN_CHANNEL_ID` (необязательная).

**Ветки:** рабочая — `main` (с 16.09.2026 она же по умолчанию). Ветка `master` —
старая, там каталог из 6 картин; запросы к GitHub API делать только с `?ref=main`.

Проверка после правок бота: `node tests/bot.test.js` — 106 сценариев на поддельных
Telegram и GitHub, живой каталог не трогается.

### Как деплоить

```bash
# 1. Зафиксировать изменения
git add .
git commit -m "update: описание"
git push

# 2. Задеплоить на Vercel
vercel --prod --yes
```

Vercel project ID: `prj_1CLR2ZkRJWzjdCB2ZCf3pH8ckcVl`, team ID: `team_Qpaq5aOAkQX4rL8jxamnwjSk`

Доступы (файла `.env` в проекте больше нет, потерян при объединении папок 04.07):
VERCEL_TOKEN — в `jarvis/bot/.env`, GITHUB_TOKEN — в `~/.git-credentials`.
BOT_TOKEN хранится только в переменных Vercel с типом sensitive — через API не читается,
при необходимости брать у @BotFather.

---

## Правила для этого проекта

1. Перед любым изменением — показываю план и жду одобрения Аллы
2. **Перед ручным деплоем — обязательно `git pull`.** Каталог пополняет бот из
   Telegram, и локальная копия `data.json` почти всегда отстаёт. Деплой идёт из
   файловой системы, а не из git, поэтому без pull свежие картины исчезнут с
   витрины (уже случилось 16.09: p13 пропала с сайта, вернули из репозитория).
3. После изменения data.json — всегда деплоить (иначе сайт не обновится)
4. Токены и ключи — никогда в git
5. После каждого изменения — git commit + push

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
