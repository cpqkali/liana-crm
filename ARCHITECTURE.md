# Архитектура CRM Liana

## Обзор

Liana CRM - это полнофункциональная система управления недвижимостью, построенная на Next.js с использованием React компонентов и localStorage для хранения данных.

## Стек технологий

- **Frontend**: React 18, Next.js 14, TypeScript
- **UI**: shadcn/ui, Tailwind CSS
- **Хранилище**: localStorage (in-memory)
- **Уведомления**: Sonner
- **Иконки**: Lucide React

## Архитектура приложения

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                    Next.js App Router                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Pages (app/(authenticated)/)           │  │
│  │  - home/page.tsx (Домашняя страница)            │  │
│  │  - objects/page.tsx (Объекты)                   │  │
│  │  - clients/page.tsx (Клиенты)                   │  │
│  │  - showings/page.tsx (Показы)                   │  │
│  └──────────────────────────────────────────────────┘  │
│                          ↓                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Components (components/)               │  │
│  │  - PropertyForm (Форма объекта)                 │  │
│  │  - PropertyList (Список объектов)               │  │
│  │  - PropertyFilters (Фильтры)                    │  │
│  │  - ShowingsCalendar (Календарь)                 │  │
│  │  - NotificationsPanel (Уведомления)             │  │
│  │  - PropertyNotes (Заметки)                      │  │
│  └──────────────────────────────────────────────────┘  │
│                          ↓                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │            API Routes (app/api/)                 │  │
│  │  - /api/objects (CRUD объектов)                 │  │
│  │  - /api/clients (CRUD клиентов)                 │  │
│  │  - /api/showings (CRUD показов)                 │  │
│  └──────────────────────────────────────────────────┘  │
│                          ↓                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Libraries (lib/)                         │  │
│  │  - data-store.ts (Хранилище данных)             │  │
│  │  - validation.ts (Валидация)                    │  │
│  │  - export.ts (Экспорт CSV)                      │  │
│  │  - api.ts (Утилиты API)                         │  │
│  └──────────────────────────────────────────────────┘  │
│                          ↓                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Storage (localStorage)                   │  │
│  │  - crm_properties (Объекты)                     │  │
│  │  - crm_clients (Клиенты)                        │  │
│  │  - crm_showings (Показы)                        │  │
│  │  - crm_users (Пользователи)                     │  │
│  │  - crm_admin_actions (Логи действий)            │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
\`\`\`

## Поток данных

### Добавление объекта

\`\`\`
PropertyForm (компонент)
    ↓
handleSubmit (валидация)
    ↓
fetch POST /api/objects
    ↓
API Route (app/api/objects/route.ts)
    ↓
validatePropertyForm (валидация)
    ↓
getDataStore().createProperty()
    ↓
localStorage.setItem("crm_properties", ...)
    ↓
Успешное сохранение
    ↓
Перенаправление на /objects
\`\`\`

### Получение объектов

\`\`\`
PropertyList (компонент)
    ↓
useEffect → loadProperties()
    ↓
fetch GET /api/objects
    ↓
API Route (app/api/objects/route.ts)
    ↓
getDataStore().getProperties()
    ↓
localStorage.getItem("crm_properties")
    ↓
Возврат JSON
    ↓
setProperties(data)
    ↓
Отображение в UI
\`\`\`

## Компоненты и их ответственность

### PropertyForm
- Управление формой добавления/редактирования объекта
- Валидация данных
- Загрузка фотографий
- Управление заметками и тегами
- Выбор собственника из списка

### PropertyList
- Отображение списка объектов
- Фильтрация и поиск
- Два режима отображения (таблица/карточки)
- Пагинация
- Удаление объектов

### PropertyFilters
- Поле поиска
- Фильтры по статусу, комнатам, району
- Фильтры по цене и площади
- Кнопка сброса фильтров

### ShowingsCalendar
- Визуальный календарь
- Навигация по месяцам
- Отображение показов на календаре

### NotificationsPanel
- Генерация уведомлений
- Отображение уведомлений
- Скрытие уведомлений

### PropertyNotes
- Управление заметками
- Управление тегами
- Добавление/удаление тегов

## Хранилище данных (DataStore)

### Структура

\`\`\`typescript
class DataStore {
  private properties: Property[]
  private clients: Client[]
  private showings: Showing[]
  private users: User[]
  private adminActions: AdminAction[]
  
  // Методы для работы с объектами
  getProperties()
  getProperty(id)
  createProperty(property)
  updateProperty(id, updates)
  deleteProperty(id)
  
  // Методы для работы с клиентами
  getClients()
  getClient(id)
  createClient(client)
  updateClient(id, updates)
  deleteClient(id)
  
  // Методы для работы с показами
  getShowings()
  getShowing(id)
  createShowing(showing)
  updateShowing(id, updates)
  deleteShowing(id)
  
  // Методы для работы с пользователями
  getUser(username)
  updateUser(username, updates)
  
  // Методы для логирования
  logAdminAction(action)
  getAdminActions(username?)
}
\`\`\`

### Синглтон паттерн

\`\`\`typescript
let dataStore: DataStore | null = null

export function getDataStore() {
  if (!dataStore) {
    dataStore = new DataStore()
  }
  return dataStore
}
\`\`\`

## API маршруты

### GET /api/objects
Получить все объекты

### POST /api/objects
Создать новый объект

### PUT /api/objects/[id]
Обновить объект

### DELETE /api/objects/[id]
Удалить объект

### GET /api/clients
Получить всех клиентов

### POST /api/clients
Создать нового клиента

### GET /api/showings
Получить все показы

### POST /api/showings
Создать новый показ

## Валидация

### Клиентская валидация
- Проверка обязательных полей
- Проверка типов данных
- Проверка диапазонов значений

### Серверная валидация
- Повторная проверка всех данных
- Проверка уникальности ID
- Проверка целостности данных

## Безопасность

### Защита данных
- Валидация входных данных
- Проверка типов
- Защита от пустых значений
- Санитизация строк

### Хранение
- Данные хранятся в localStorage браузера
- Нет передачи чувствительных данных
- Нет логирования паролей

## Производительность

### Оптимизации
- Кэширование клиентов при выборе собственника
- Эффективная фильтрация на клиенте
- Пагинация списков
- Ленивая загрузка компонентов

### Метрики
- Время загрузки страницы: < 1 сек
- Время применения фильтров: < 500 мс
- Время сохранения объекта: < 1 сек

## Масштабируемость

### Текущие ограничения
- Максимум ~10,000 объектов в localStorage
- Максимум ~5MB данных в localStorage
- Нет синхронизации между вкладками

### Рекомендации для масштабирования
1. Перейти на реальную базу данных (PostgreSQL, MongoDB)
2. Добавить серверную пагинацию
3. Добавить кэширование на сервере
4. Добавить индексы для быстрого поиска
5. Добавить синхронизацию в реальном времени

## Тестирование

### Типы тестов
- Unit тесты для валидации
- Integration тесты для API
- E2E тесты для пользовательских сценариев

### Инструменты
- Jest для unit тестов
- Cypress для E2E тестов

## Развертывание

### Локальное развертывание
\`\`\`bash
npm install
npm run dev
\`\`\`

### Production развертывание
\`\`\`bash
npm run build
npm run start
\`\`\`

### Vercel развертывание
\`\`\`bash
vercel deploy
\`\`\`

## Мониторинг и логирование

### Логирование
- Логи ошибок в консоль браузера
- Логирование действий администратора
- Логирование API запросов

### Мониторинг
- Отслеживание ошибок
- Отслеживание производительности
- Отслеживание использования памяти
