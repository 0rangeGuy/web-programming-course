# Программа курса "Веб-программирование с TypeScript и React"

## Общая информация

**Продолжительность:** 10 занятий (включая ознакомительное)
**Формат:** 9 лекций (90 мин) + 9 лабораторных работ (180 мин) + 1 ознакомительное занятие
**Целевая аудитория:** Студенты с поверхностным знанием HTML, CSS, JavaScript и React

> **Примечание для текущего семестра:** Занятия 8-9 (React Native и Production Deployment) переносятся на следующий семестр. В этом семестре завершаем на занятии 7.



## Технологический стек

- **Основные технологии:** TypeScript, React, Vite, Tailwind CSS
- **Управление состоянием:** MobX, Zustand
- **Тестирование:** Vitest, React Testing Library, Playwright
- **Мобильная разработка:** React + strict-dom
- **Инструменты:** ESLint, Prettier, Git

---

## Занятие 0
### Ознакомительное занятие

**Цели:**
- Онбординг студентов
- Знакомство с процессом работы (fork → pull request)
- Диагностика текущих знаний

**Содержание:**
- Введение в курс и методологию работы
- Диагностическая лабораторная работа (HTML, CSS, JavaScript)
- Настройка рабочего окружения (Git, IDE)

---

## Занятие 1: Основы TypeScript
### Лекция: Введение в TypeScript

**Темы:**
- Мотивация перехода с JavaScript на TypeScript
- Система типов: примитивы, объекты, массивы
- Union и intersection типы
- Интерфейсы и типы (type vs interface)
- Generics для начинающих
- Настройка tsconfig.json
- Работа с внешними библиотеками (@types)

### Лабораторная работа: Практика TypeScript

**Задачи:**
- Рефакторинг существующего JavaScript кода в TypeScript
- Создание типизированных функций и объектов
- Работа с массивами и объектами сложной структуры
- Создание интерфейсов для API responses
- Практика с generics
- Решение типовых проблем типизации

---

## Занятие 2: React + TypeScript
### Лекция: React с типизацией

**Темы:**
- **Быстрое освежение React:** компоненты, props, state, хуки
- **Типизация React компонентов:**
  - Функциональные компоненты с TypeScript
  - Типизация props (включая children и callback props)
  - Типизация состояния (useState, useReducer)
  - Event handlers в TypeScript
  - Типизация useEffect и кастомных хуков
  - Работа с ref'ами

### Лабораторная работа: Практика React + TypeScript

**Задачи:**
- Создание сложных типизированных компонентов
- Передача данных между компонентами с типизацией
- Работа с формами и валидацией
- Условный рендеринг и списки
- Композиция компонентов
- Создание переиспользуемых типизированных компонентов

---

## Занятие 3: Современный стек разработки
### Лекция: Vite + Tailwind CSS

**Темы:**
- Сравнение Vite с Create React App
- Настройка проекта: Vite + React + TypeScript
- Конфигурация Vite (vite.config.ts)
- Введение в Tailwind CSS
- Utility-first подход к стилизации
- Интеграция Tailwind с Vite
- Hot Module Replacement (HMR) и dev experience
- Настройка ESLint + Prettier для TypeScript

### Лабораторная работа: Освоение стека

**Задачи:**
- Инициализация нескольких проектов с нуля
- Настройка полного dev окружения
- Создание компонентной библиотеки с Tailwind
- Responsive дизайн и мобильная адаптация
- Настройка линтинга и форматирования
- Оптимизация dev experience

---

## Занятие 4: Управление состоянием - MobX + Zustand
### Лекция: Современный state management

**MobX:**
- Концепции: Observable, Action, Computed
- Создание stores с TypeScript
- Интеграция с React (observer HOC/hook)
- Архитектурные паттерны с MobX
- Best practices и распространенные ошибки

**Zustand:**
- Минималистичный API
- TypeScript типизация store'ов
- Создание простых глобальных store'ов
- Middleware и persistence

**Комбинирование:**
- Когда использовать MobX vs Zustand
- Паттерны совместного использования
- Архитектурные решения

### Лабораторная работа: Комплексное приложение с состоянием

**Задачи:**
- Создание MobX stores для бизнес-логики
- Zustand для UI состояния и пользовательских настроек
- API интеграция с обработкой ошибок
- Полная типизация всех store'ов
- Реализация оптимистичных обновлений
- Практика с различными сценариями состояния
- Отладка и профилирование состояния

---

## Занятие 5: HTTP и API Fundamentals
### Лекция: Глубокое погружение в работу с API

**Часть 1: HTTP протокол (2**
- **HTTP методы детально:**
  - GET (идемпотентность, кэширование)
  - POST vs PUT vs PATCH (семантика, idempotency)
  - DELETE
  - OPTIONS, HEAD (preflight, metadata)
- **Коды ответов по категориям:**
  - 2xx: успех (200, 201, 204)
  - 3xx: редиректы (301, 302, 304)
  - 4xx: клиентские ошибки (400, 401, 403, 404, 422, 429)
  - 5xx: серверные ошибки (500, 502, 503)
- **Headers:** Content-Type, Authorization, Cache-Control, CORS

**Часть 2: Форматы передачи данных (1**
- **JSON:** стандарт для современных API
- **Query params:** фильтрация, сортировка, пагинация
- **URL/Path params:** REST ресурсы
- **Request body:** JSON vs FormData
- **Multipart/form-data:** загрузка файлов
- **XML:** legacy APIs (краткий обзор)
- **gRPC + Protocol Buffers:** обзор (когда нужна производительность)

**Часть 3: REST архитектура**
- Принципы REST
- **CRUD → HTTP методы маппинг:**
  - Create → POST /resources
  - Read → GET /resources/:id
  - Update → PUT/PATCH /resources/:id
  - Delete → DELETE /resources/:id
- Именование endpoints (множественное число, вложенность)
- Stateless коммуникация

**Часть 4: Real-time и альтернативы (1**
- **WebSockets:** двусторонняя связь
- **Server-Sent Events (SSE):** уведомления от сервера
- **Long polling:** историческая справка
- **HTTP/2 и gRPC:** мультиплексирование, streaming

**Часть 5: Валидация данных (1**
- **Клиентская vs серверная валидация:**
  - Почему нужны обе
  - UX vs безопасность
- **Валидация на уровне API:**
  - HTTP 422 Unprocessable Entity
  - Структура ошибок валидации в responses
  - Стандарты описания ошибок (RFC 7807, JSON:API)
- **Типы валидации:**
  - Структурная (типы данных, обязательные поля)
  - Бизнес-правила (ограничения, форматы)
  - Референциальная (внешние ключи, связи)

**Часть 6: AAA - Authentication, Authorization, Accounting (2**
- **Различие понятий:**
  - Authentication (кто ты?)
  - Authorization (что тебе можно?)
  - Accounting (что ты делал?)
- **Механизмы аутентификации:**
  - Session-based (cookies)
  - Token-based (JWT)
  - OAuth 2.0 flows
- **GitHub OAuth детально (для лабы):**
  - Authorization Code flow
  - Redirect URI
  - Access tokens и scopes
- **JWT структура:** header.payload.signature
- **Bearer tokens** в заголовках
- **Refresh tokens** и их ротация

### Лабораторная работа: GitHub OAuth интеграция

**Задачи:**
- Регистрация GitHub OAuth App
- Реализация Authorization Code flow
- Обработка callback и получение access token
- Работа с GitHub API (получение профиля пользователя)
- Хранение токенов (localStorage vs memory, безопасность)
- Protected routes на основе авторизации
- Обработка различных HTTP статусов (401, 403, 422, 429)
- **Валидация ответов от API** (проверка структуры данных)
- Pagination через GitHub API (query params, Link headers)
- Error handling для auth flow с детальными сообщениями валидации
- Refresh token flow (опционально)

> **Примечание:** В следующих семестрах рекомендуется проводить это занятие ПЕРЕД занятием 6, так как оно закладывает фундаментальные знания для работы с react-query и OpenAPI.

---

## Занятие 6: Продвинутые React паттерны + API
### Лекция: Advanced React + работа с данными

**Темы:**
- Кастомные хуки с TypeScript
- Error Boundaries и обработка ошибок
- React.memo, useMemo, useCallback для оптимизации
- Suspense и concurrent features
- Паттерны работы с API (fetch, axios)
- **Валидация на клиенте:**
  - Библиотеки валидации (Zod, Yup, io-ts)
  - React Hook Form + схемы валидации
  - Реактивная валидация и UX
  - TypeScript типы из схем валидации
- **React Query:** декларативная работа с данными
- **OpenAPI/Swagger:** типобезопасная генерация клиентов + схемы валидации
- Композиция компонентов и render props
- Контекст и провайдеры

### Лабораторная работа: Архитектура и API интеграция

**Задачи:**
- Рефакторинг приложения под производительность
- Создание переиспользуемых архитектурных решений
- **Валидация форм:**
  - Интеграция Zod/Yup с React Hook Form
  - Создание переиспользуемых схем валидации
  - Валидация API responses с типобезопасностью
  - Отображение ошибок валидации в UI
- Сложные API интеграции с различными endpoints
- Интеграция React Query для кэширования
- Генерация API клиента из OpenAPI спецификации (с автоматическими схемами валидации)
- Кэширование данных и синхронизация
- Профилирование и оптимизация React приложения
- Создание системы компонентов

---

## Занятие 7: Testing - Vitest & Playwright
### Лекция: Автоматическое тестирование React приложений

**Часть 1: Введение в тестирование**
- Зачем нужно тестирование (уверенность, документация, экономия времени)
- Тестовая пирамида: Unit (60-70%), Integration (20-30%), E2E (5-10%)
- **Jest vs Vitest:**
  - Jest - индустриальный стандарт (70% проектов)
  - Vitest - современная альтернатива (в 2-10 раз быстрее)
  - API на 95% совместим - знание переносится
  - Vitest для курса: нативная интеграция с Vite, лучший DX

**Часть 2: Vitest - Unit & Component тесты**
- Setup Vitest + React Testing Library
- Структура теста: AAA pattern (Arrange, Act, Assert)
- Matchers (assertions): toBe, toEqual, toContain, toThrow
- **Моки (Mocking):**
  - Mock функций: `vi.fn()` (в Jest: `jest.fn()`)
  - Mock модулей: `vi.mock()`
  - Spy на методы: `vi.spyOn()`
- **React Testing Library:**
  - Философия: тестируем как пользователь
  - Queries приоритеты: getByRole → getByLabelText → getByText → getByTestId
  - User Events: `userEvent.click()`, `userEvent.type()`
  - Async testing: `findBy*`, `waitFor()`
- **Jest-DOM matchers:** toBeInTheDocument, toBeVisible, toBeDisabled
- Тестирование MobX stores

**Часть 3: Playwright - E2E тестирование**
- Что такое E2E и когда использовать
- Setup Playwright (автозапуск dev-сервера)
- Написание E2E теста (полный user flow)
- Локаторы: getByRole, getByText, CSS selectors
- Actions: click, fill, type, select
- Assertions: toBeVisible, toHaveText, toHaveValue
- UI Mode для debugging

**Часть 4: Best Practices**
- Тестируйте поведение, не implementation details
- Один тест = одна проверка
- Не мокайте всё подряд
- Используйте правильные селекторы (getByRole)
- Coverage ≠ качество (70-80% достаточно)

### Лабораторная работа: Тестирование Quiz приложения

**Задачи:**

**Часть 1: Setup**
- Установка Vitest, RTL, Playwright
- Конфигурация vitest.config.ts и playwright.config.ts
- Создание setup файлов

**Часть 2: Рефакторинг на компоненты**
- Декомпозиция Task4.tsx на переиспользуемые компоненты:
  - QuizButton - переиспользуемая кнопка
  - MultipleSelectQuestion - вопросы с выбором
  - EssayQuestion - текстовые вопросы
  - QuizProgress - индикатор прогресса

**Часть 3: Unit тесты**
- Тесты для utils (calculateScore, getCorrectAnswersCount)
- Тесты для gameStore (toggleAnswer, nextQuestion, computed properties)
- ≥10 unit тестов

**Часть 4: Component тесты**
- Тесты для QuizButton (render, onClick, disabled)
- Тесты для EssayQuestion (textarea, character count, onChange)
- Тесты для MultipleSelectQuestion (options, selection, toggle)
- ≥3 компонента покрыты тестами

**Часть 5: E2E тесты (30 мин, опционально)**
- E2E тест: прохождение квиза
- E2E тест: разные типы вопросов
- Проверка полного user flow

---

## Занятие 8: Cross-platform разработка с React Native
### Лекция: React + ReactStrict-DOM → React Native

> **Примечание:** Занятия 8 и 9 переносятся на следующий семестр для обеспечения достаточного времени на освоение материала.

**Часть 1: Теория ReactStrict-DOM**
- Концепция "write once, run everywhere"
- ReactStrict-DOM как мост между web и native
- Архитектура: общие компоненты + platform-specific код
- Сравнение с другими подходами (Expo, Flutter, PWA)

**Часть 2: Настройка окружения**
- Установка React Native CLI vs Expo CLI
- Настройка Android Studio / Xcode
- Создание проекта с ReactStrict-DOM
- Конфигурация Metro bundler для cross-platform
- Настройка TypeScript для React Native

**Часть 3: Мобильная разработка**
- Адаптация веб-компонентов под мобильные
- Навигация: React Navigation с TypeScript
- Мобильные UX/UI паттерны и компоненты
- Touch события, жесты и анимации
- Platform-specific код и условная компиляция
- Работа с нативными API (камера, геолокация, хранилище)

### Лабораторная работа: Полноценное мобильное приложение (3 часа)

**Этап 1: Настройка cross-platform проекта**
- Создание React Native проекта с ReactStrict-DOM
- Настройка TypeScript конфигурации для mobile
- Интеграция существующих компонентов и stores (MobX/Zustand)
- Настройка hot reload для мобильной разработки
- Первый запуск на эмуляторе Android/iOS

**Этап 2: Адаптация под мобильные**
- Рефакторинг веб-компонентов для ReactStrict-DOM
- Создание мобильной навигации (стеки, табы, модалы)
- Адаптация форм под touch-интерфейсы
- Responsive компоненты с учетом размеров экрана
- Обработка состояний клавиатуры и orientation

**Этап 3: Нативные возможности**
- Интеграция с нативными API через ReactStrict-DOM
- Работа с камерой и галереей фотографий
- Push-уведомления и background tasks
- Offline functionality и синхронизация данных
- Тестирование на реальных устройствах

**Бонусные задачи:**
- Настройка CI/CD для автоматической сборки APK/IPA
- Публикация тестовой версии в Google Play Console/TestFlight
- Performance профилирование мобильного приложения
- Интеграция с нативными модулями

---

## Занятие 9: Production Deployment & Optimization

> **Примечание:** Это занятие переносится на следующий семестр. Детальные материалы в разработке.

### Лекция: Подготовка к production (90 мин)

**Темы:**
- Build оптимизация (Code Splitting, Lazy Loading, Bundle analysis)
- Environment variables и конфигурация
- Deployment platforms (Vercel, Netlify, Cloudflare Pages, GitHub Pages)
- Monitoring и Analytics (Sentry, Web Vitals, Google Analytics)
- Security best practices (CSP, HTTPS, XSS protection)

### Лабораторная работа: Production deployment

**Задачи:**
- Оптимизация bundle size и lazy loading
- Production build и deployment на Vercel/Netlify
- Интеграция Sentry для error tracking
- Lighthouse score ≥90
- CI/CD pipeline (опционально)

---

## Финальный проект

К концу курса студенты создают полноценное веб-приложение, включающее:

### Технические требования:
- **Frontend:** TypeScript + React + Vite + Tailwind CSS
- **State Management:** MobX для бизнес-логики + Zustand для UI состояния
- **API интеграция:** React Query + OpenAPI генерация клиентов
- **Тестирование:** Vitest (unit/component) + Playwright (E2E)
- **Мобильная поддержка:** React Native + ReactStrict-DOM (след. семестр)
- **Production ready:** Оптимизированная сборка, деплой на Vercel/Netlify

### Функциональные возможности:
- Аутентификация пользователей (GitHub OAuth)
- CRUD операции с данными через API
- Responsive дизайн для всех устройств
- Обработка состояний загрузки и ошибок
- Кэширование данных с React Query
- Test coverage ≥70%
- Мобильное приложение (React Native, след. семестр)
- Monitoring с Sentry
- Lighthouse score ≥90

---

## Методология работы

### Процесс выполнения лабораторных работ:
1. Форк репозитория курса
2. Выполнение задания (в классе или дома)
3. Отправка Pull Request для проверки

### Материалы для подготовки:
- Конспекты в директориях `lr*/docs/`
- Интерактивные руководства
- Примеры кода

---

## Ожидаемые результаты

По завершении курса студенты будут уметь:

- Разрабатывать типобезопасные React приложения с TypeScript
- Использовать современные инструменты разработки (Vite, Tailwind)
- Эффективно управлять состоянием приложения (MobX, Zustand)
- Создавать адаптивные и мобильные интерфейсы
- Интегрироваться с внешними API (REST, OAuth, React Query)
- Писать автоматические тесты (Vitest, RTL, Playwright)
- Разрабатывать cross-platform приложения (React Native)
- Оптимизировать производительность React приложений
- Деплоить production-ready приложения (Vercel, Netlify)
- Настраивать monitoring и error tracking (Sentry)
- Следовать современным best practices веб-разработки