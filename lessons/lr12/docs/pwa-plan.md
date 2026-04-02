# План доработки PWA для Todo-приложения

## Точки расширения в коде:

1. **src/App.tsx**
   - Функция `registerServiceWorker()` — строка ~70
   - useEffect для online/offline — строка ~125
   - Обработчики `onCreate`, `onToggle`, `onDelete` — добавление в очередь при ошибке сети
   - useEffect для синхронизации после восстановления сети

2. **src/sw.ts**
   - `install` — кэширование статических ресурсов
   - `activate` — очистка старых кэшей
   - `fetch` — стратегия cache-first для статики

3. **src/hooks/useOfflineQueue.ts** (создан)
   - Управление очередью операций в localStorage
   - Синхронизация очереди при восстановлении сети

## Что уже реализовано:

- Регистрация Service Worker
- Online/offline индикатор
- Офлайн-очередь операций (create, toggle, delete)
- Синхронизация после reconnect
- Кэширование статических ресурсов
- Cache-first стратегия для GET-запросов

## Что осталось (Checkpoint 2-5):

- Настройка manifest.webmanifest
- Добавление иконок
- Проверка установки приложения
- Финальное тестирование сценария online → offline → действия → online
- Lighthouse проверка
