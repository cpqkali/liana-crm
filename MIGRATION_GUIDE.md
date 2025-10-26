# Руководство по Миграции на PostgreSQL

Этот проект был мигрирован с SQLite на PostgreSQL с использованием Prisma ORM.

## Шаг 1: Установка Зависимостей

Зависимости уже обновлены в `package.json`. Установите их:

\`\`\`bash
npm install
\`\`\`

## Шаг 2: Настройка PostgreSQL

### Вариант A: Render (Бесплатный)

1. Войдите в [Render Dashboard](https://dashboard.render.com/)
2. Нажмите **New** → **PostgreSQL**
3. Выберите **Free** план
4. Скопируйте **Internal Database URL**

### Вариант B: Supabase (Бесплатный)

1. Войдите в [Supabase](https://supabase.com)
2. Создайте новый проект
3. Перейдите в Settings → Database
4. Скопируйте **Connection String** (режим Session)

### Вариант C: Neon (Бесплатный)

1. Войдите в [Neon](https://neon.tech)
2. Создайте новый проект
3. Скопируйте **Connection String**

## Шаг 3: Установка Переменных Окружения

Создайте файл `.env` в корне проекта:

\`\`\`env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="your-secret-key-here"
FRONTEND_URL="http://localhost:3000"
\`\`\`

**Важно:** В продакшене используйте Internal Database URL от Render для лучшей производительности.

## Шаг 4: Создание Схемы Базы Данных

Выполните миграции Prisma:

\`\`\`bash
npx prisma migrate dev --name init
\`\`\`

Или для продакшена:

\`\`\`bash
npx prisma migrate deploy
\`\`\`

## Шаг 5: Экспорт Данных из SQLite (Опционально)

Если у вас есть существующие данные в SQLite:

\`\`\`bash
node scripts/export-sqlite.js
\`\`\`

Это создаст файл `data-export.json` с вашими данными.

## Шаг 6: Импорт Данных в PostgreSQL (Опционально)

После экспорта данных импортируйте их:

\`\`\`bash
npx tsx scripts/import-postgres.ts
\`\`\`

## Шаг 7: Проверка Подключения

Запустите приложение локально:

\`\`\`bash
npm run dev
\`\`\`

Откройте http://localhost:3000 и попробуйте войти.

## Деплой на Render

### Build Command

\`\`\`bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run build
\`\`\`

### Start Command

\`\`\`bash
npm start
\`\`\`

### Переменные Окружения на Render

Добавьте в настройках Web Service:

- `DATABASE_URL` - Internal Database URL от PostgreSQL
- `JWT_SECRET` - Секретный ключ для JWT
- `FRONTEND_URL` - URL вашего фронтенда (например, https://your-app.onrender.com)

## Проверка Миграции

### Тестирование Подключения

Создайте тестовый эндпоинт (опционально):

\`\`\`typescript
// app/api/test-db/route.ts
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.$connect()
    const userCount = await prisma.user.count()
    const objectCount = await prisma.object.count()
    
    return Response.json({ 
      success: true, 
      userCount,
      objectCount,
      message: 'PostgreSQL connection successful!'
    })
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
\`\`\`

## Частые Проблемы

### Ошибка: "Can't reach database server"

- Проверьте правильность `DATABASE_URL`
- Убедитесь, что используете Internal URL на Render
- Проверьте, что PostgreSQL база данных запущена

### Ошибка: "Prisma Client not generated"

Выполните:

\`\`\`bash
npx prisma generate
\`\`\`

### Таблицы не созданы

Выполните миграции:

\`\`\`bash
npx prisma migrate deploy
\`\`\`

### Ошибка подключения в продакшене

- Убедитесь, что `DATABASE_URL` установлена в переменных окружения Render
- Проверьте, что используете Internal Database URL, а не External

## Что Изменилось

### Удалено

- ❌ `better-sqlite3` пакет
- ❌ `sqlite3` пакет
- ❌ Файл `database.sqlite`
- ❌ Отдельные базы данных для объектов (`object_*.db`)

### Добавлено

- ✅ `@prisma/client` и `prisma`
- ✅ `pg` (PostgreSQL драйвер)
- ✅ `prisma/schema.prisma` - схема базы данных
- ✅ `lib/prisma.ts` - Prisma Client singleton
- ✅ Скрипты миграции данных

### Изменено

- 🔄 `lib/db.ts` - теперь использует Prisma
- 🔄 `server/index.js` - все запросы переписаны на Prisma
- 🔄 `package.json` - обновлены зависимости и скрипты
- 🔄 `next.config.mjs` - удалена конфигурация для SQLite

## Команды Prisma

### Генерация Prisma Client

\`\`\`bash
npx prisma generate
\`\`\`

### Создание Миграции

\`\`\`bash
npx prisma migrate dev --name migration_name
\`\`\`

### Применение Миграций

\`\`\`bash
npx prisma migrate deploy
\`\`\`

### Просмотр Базы Данных

\`\`\`bash
npx prisma studio
\`\`\`

Откроется веб-интерфейс для просмотра и редактирования данных.

## Поддержка

Если возникли проблемы:

1. Проверьте логи в Render Dashboard
2. Убедитесь, что все переменные окружения установлены
3. Проверьте, что миграции применены: `npx prisma migrate status`
