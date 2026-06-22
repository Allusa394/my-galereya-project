# Ход событий — Deployment Log

## Проект: Галерея Primavera

### Что это
Telegram Mini App + сайт-галерея для продажи картин маслом.
Бот `@primavera_gallery_bot` открывает этот сайт как Mini App.

---

## Где что лежит

| Что | Где |
|-----|-----|
| **Код проекта** | `c:\Users\alusa\OneDrive\Documents\Документы\projects\my-galereya-project\` |
| **GitHub** | https://github.com/Allusa394/my-galereya-project |
| **Vercel (живой сайт)** | https://my-galereya-project.vercel.app |
| **Telegram бот** | @primavera_gallery_bot |
| **Ключи (.env)** | `C:\Users\alusa\Documents\my-galereya-project\.env` (не в git!) |
| **Старый бот-проект** | `C:\Users\alusa\Documents\my-galereya-tg\` (не задеплоен) |

---

## Структура файлов

```
my-galereya-project/
├── index.html          ← весь сайт (одна HTML-страница, ~1600 строк)
├── data.json           ← данные: галерея, художник, 12 картин
├── images/
│   ├── p01.jpg         ← Скалы у моря
│   ├── p02.jpg         ← Деревья у воды
│   ├── p03.jpg         ← Южная бухта
│   ├── p04.jpg         ← Скала
│   ├── p05.jpg         ← Вечерний дворик
│   ├── p06.jpg         ← Пляж. Полдень
│   ├── p07.jpg         ← Две скалы
│   ├── p08.jpg         ← Южный дворик
│   ├── p09.jpg         ← Скала в море
│   ├── p10.jpg         ← Синяя бухта
│   ├── p11.jpg         ← Парк с розами
│   └── p12.jpg         ← Пляж. Лето
├── docs/
│   └── DEPLOYMENT.md   ← этот файл
├── sheets-import/
│   ├── Artists.csv
│   └── Paintings.csv
└── .gitignore
```

---

## Ключи и токены (не хранятся в git)

Файл: `C:\Users\alusa\Documents\my-galereya-project\.env`

```
VERCEL_TOKEN=<смотри C:\Users\alusa\Documents\my-galereya-project\.env>
VERCEL_ORG_ID=team_Qpaq5aOAkQX4rL8jxamnwjSk
VERCEL_PROJECT_ID=prj_JzKFvj3gFW11ON7QwL3JO59AEyCb  (из .env)
BOT_TOKEN=<смотри .env>             ← токен бота @primavera_gallery_bot
WEBAPP_URL=https://my-galereya-project.vercel.app/
GITHUB_TOKEN=<смотри .env>          ← GitHub (Allusa394)
```

Vercel project.json: `.vercel/project.json`
```json
{"projectId":"prj_1CLR2ZkRJWzjdCB2ZCf3pH8ckcVl","orgId":"team_Qpaq5aOAkQX4rL8jxamnwjSk"}
```

---

## Как задеплоить

```powershell
# В папке проекта:
cd "c:\Users\alusa\OneDrive\Documents\Документы\projects\my-galereya-project"

# Деплой на Vercel (токен берётся из C:\Users\alusa\Documents\my-galereya-project\.env):
vercel --prod --token <VERCEL_TOKEN из .env> --yes

# Сохранить изменения в GitHub:
git add -A
git commit -m "описание изменений"
git push
```

---

## История изменений

### 2026-06-22
- ✅ Инициализирован git, проект запушен на GitHub
- ✅ Заменены все Wikipedia-изображения на реальные фото картин (images/p01-p12.jpg)
- ✅ Исправлена ошибка: картины не появлялись на холсте (CORS-конфликт кешированных изображений)
- ✅ Виртуальный зал скрыт в Telegram Mini App
- ✅ Задеплоено на Vercel

### До 2026-06-22
- Создан сайт-галерея (index.html)
- Настроен Telegram бот @primavera_gallery_bot
- Вебхук указывает на https://my-galereya-project.vercel.app/api/bot (endpoint не реализован — бот не отвечает на сообщения, только открывает Mini App)

---

## Что нужно сделать

- [ ] Уточнить у художника: имя, названия картин, размеры (см), цены
- [ ] Добавить api/bot.js — чтобы бот отвечал на /start и сообщения
- [ ] Проверить работу canvas в Telegram (картины должны накладываться на стену)
