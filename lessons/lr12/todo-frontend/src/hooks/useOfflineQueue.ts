// src/hooks/useOfflineQueue.ts
import { useState, useEffect, useCallback } from "react";

export type QueueAction = {
  id: string;
  type: "create" | "toggle" | "delete";
  payload: any;
  timestamp: number;
};

const QUEUE_KEY = "offline-queue";

const loadQueue = (): QueueAction[] => {
  const stored = localStorage.getItem(QUEUE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveQueue = (queue: QueueAction[]) => {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const addToQueue = (action: Omit<QueueAction, "id" | "timestamp">) => {
  const queue = loadQueue();
  const newAction: QueueAction = {
    ...action,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  queue.push(newAction);
  saveQueue(queue);
  return newAction;
};

export const removeFromQueue = (actionId: string) => {
  const queue = loadQueue();
  const filtered = queue.filter((a) => a.id !== actionId);
  saveQueue(filtered);
};

export const useOfflineQueue = () => {
  const [queue, setQueue] = useState<QueueAction[]>([]);

  const refreshQueue = useCallback(() => {
    setQueue(loadQueue());
  }, []);

  const addAction = useCallback(
    (action: Omit<QueueAction, "id" | "timestamp">) => {
      addToQueue(action);
      refreshQueue();
    },
    [refreshQueue],
  );

  const removeAction = useCallback(
    (actionId: string) => {
      removeFromQueue(actionId);
      refreshQueue();
    },
    [refreshQueue],
  );

  const syncQueue = useCallback(
    async (apiCall: (action: QueueAction) => Promise<any>) => {
      let currentQueue = loadQueue();
      if (currentQueue.length === 0) return;

      console.log("🔄 Начинаем синхронизацию, действий:", currentQueue.length);

      // Сортируем по времени (старые сначала)
      currentQueue.sort((a, b) => a.timestamp - b.timestamp);

      // Словарь: временный ID → реальный ID
      const tempIdToRealId: Record<string, number> = {};

      // Сначала обрабатываем все create
      for (let i = 0; i < currentQueue.length; i++) {
        const action = currentQueue[i];
        if (action.type === "create") {
          try {
            console.log("📝 Создаём задачу:", action.payload);
            const createdTodo = await apiCall(action);
            if (createdTodo && createdTodo.id) {
              tempIdToRealId[action.payload.id] = createdTodo.id;
              console.log(
                `✅ Задача создана: временный ID ${action.payload.id} → реальный ID ${createdTodo.id}`,
              );
            }
            removeFromQueue(action.id);
          } catch (error) {
            console.error("❌ Ошибка создания задачи:", error);
          }
        }
      }

      // Обновляем текущую очередь после обработки create
      currentQueue = loadQueue();

      // Обновляем payload для toggle/delete, заменяя временные ID на реальные
      for (const action of currentQueue) {
        if (action.type === "toggle" || action.type === "delete") {
          const oldId = action.payload.id;
          if (tempIdToRealId[oldId]) {
            action.payload.id = tempIdToRealId[oldId];
            console.log(
              `🔄 Заменяем ID в ${action.type}: ${oldId} → ${action.payload.id}`,
            );
            // Обновляем в localStorage
            const allQueue = loadQueue();
            const updatedQueue = allQueue.map((a) =>
              a.id === action.id
                ? { ...a, payload: { ...a.payload, id: action.payload.id } }
                : a,
            );
            saveQueue(updatedQueue);
          }
        }
      }

      // Обрабатываем toggle и delete
      const finalQueue = loadQueue();
      for (const action of finalQueue) {
        if (action.type === "toggle" || action.type === "delete") {
          try {
            console.log(
              `📝 ${action.type} для задачи ID: ${action.payload.id}`,
            );
            await apiCall(action);
            removeFromQueue(action.id);
            console.log(`✅ ${action.type} выполнен`);
          } catch (error) {
            console.error(`❌ Ошибка ${action.type}:`, error);
          }
        }
      }

      refreshQueue();
      console.log(
        "🏁 Синхронизация завершена, осталось действий:",
        loadQueue().length,
      );
    },
    [refreshQueue],
  );

  useEffect(() => {
    refreshQueue();
    const handleStorage = () => refreshQueue();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [refreshQueue]);

  return { queue, addAction, removeAction, syncQueue, refreshQueue };
};
