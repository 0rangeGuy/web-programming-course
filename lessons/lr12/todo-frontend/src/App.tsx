import { FormEvent, useCallback, useEffect, useState } from "react";
import { useOfflineQueue } from "./hooks/useOfflineQueue";

type ServerTodo = {
  id: number;
  title: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
};

type QueueAction = {
  id: string;
  type: "create" | "toggle" | "delete";
  payload: any;
  timestamp: number;
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

function toLocalText(value: string) {
  const normalized = value.includes(" ") ? value.replace(" ", "T") : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("ru-RU");
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

async function apiFetchTodos(): Promise<ServerTodo[]> {
  const response = await fetch(`${API_BASE_URL}/api/todos`);
  const data = await parseJson<{ items: ServerTodo[] }>(response);
  return data.items;
}

async function apiCreate(title: string): Promise<ServerTodo> {
  const response = await fetch(`${API_BASE_URL}/api/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  return parseJson<ServerTodo>(response);
}

async function apiToggle(todoId: number, done: boolean): Promise<ServerTodo> {
  const response = await fetch(`${API_BASE_URL}/api/todos/${todoId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ done }),
  });
  return parseJson<ServerTodo>(response);
}

async function apiDelete(todoId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/todos/${todoId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("SW registered:", reg))
        .catch((err) => console.log("SW registration failed:", err));
    });
  }
}

export default function App() {
  const [todos, setTodos] = useState<ServerTodo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const {
    queue: queueActions,
    addAction,
    syncQueue,
    refreshQueue,
  } = useOfflineQueue();

  const refreshFromServer = useCallback(async () => {
    const serverTodos = await apiFetchTodos();
    setTodos(serverTodos);
  }, []);

  // Синхронизация очереди при возвращении online
  useEffect(() => {
    if (isOnline && queueActions.length > 0) {
      const performSync = async () => {
        setMessage("Синхронизация...");
        await syncQueue(async (action: QueueAction) => {
          switch (action.type) {
            case "create":
              // Возвращаем созданную задачу с сервера
              return await apiCreate(action.payload.title);
            case "toggle":
              await apiToggle(action.payload.id, action.payload.done);
              break;
            case "delete":
              await apiDelete(action.payload.id);
              break;
          }
        });
        await refreshFromServer();
        refreshQueue();
        setMessage("Синхронизация завершена");
      };
      performSync();
    }
  }, [
    isOnline,
    queueActions.length,
    syncQueue,
    refreshFromServer,
    refreshQueue,
  ]);

  const onCreate = useCallback(
    async (title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;

      try {
        await apiCreate(trimmed);
        await refreshFromServer();
        setMessage("Задача добавлена.");
      } catch {
        const tempId = Date.now();
        // ✅ ИСПРАВЛЕНО: добавляем id в payload
        addAction({ type: "create", payload: { id: tempId, title: trimmed } });
        setTodos((prev) => [
          ...prev,
          {
            id: tempId,
            title: trimmed,
            done: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
        setMessage(
          "Задача добавлена в офлайн-очередь. Будет синхронизирована при восстановлении сети.",
        );
      }
    },
    [refreshFromServer, addAction],
  );

  const onToggle = useCallback(
    async (todo: ServerTodo) => {
      try {
        await apiToggle(todo.id, !todo.done);
        await refreshFromServer();
        setMessage("Статус обновлен.");
      } catch {
        addAction({
          type: "toggle",
          payload: { id: todo.id, done: !todo.done },
        });
        setTodos((prev) =>
          prev.map((t) => (t.id === todo.id ? { ...t, done: !t.done } : t)),
        );
        setMessage("Действие добавлено в офлайн-очередь.");
      }
    },
    [refreshFromServer, addAction],
  );

  const onDelete = useCallback(
    async (todo: ServerTodo) => {
      try {
        await apiDelete(todo.id);
        await refreshFromServer();
        setMessage("Задача удалена.");
      } catch {
        addAction({ type: "delete", payload: { id: todo.id } });
        setTodos((prev) => prev.filter((t) => t.id !== todo.id));
        setMessage("Действие добавлено в офлайн-очередь.");
      }
    },
    [refreshFromServer, addAction],
  );

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const value = inputValue;
      setInputValue("");
      await onCreate(value);
    },
    [inputValue, onCreate],
  );

  useEffect(() => {
    registerServiceWorker();

    let cancelled = false;

    const bootstrap = async () => {
      try {
        await refreshFromServer();
      } catch {
        if (!cancelled) {
          setMessage(
            "Не удалось загрузить данные. Проверьте, что backend запущен.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [refreshFromServer]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setMessage("Соединение восстановлено");
    };
    const handleOffline = () => {
      setIsOnline(false);
      setMessage("Нет соединения. Действия будут добавлены в очередь.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <main className="app">
      <header className="header">
        <h1>Todo-сы</h1>
        <span className={`badge ${isOnline ? "online" : "offline"}`}>
          {isOnline ? "online" : "offline"}
        </span>
      </header>

      <form className="toolbar" onSubmit={onSubmit}>
        <input
          type="text"
          maxLength={200}
          placeholder="Новая задача"
          required
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
        />
        <button type="submit">Добавить</button>
      </form>

      <section className="meta">
        <span className="badge">Офлайн-очередь: {queueActions.length}</span>
      </section>

      {message ? <div className="message">{message}</div> : null}
      {isLoading ? <p>Загрузка...</p> : null}
      {!isLoading && todos.length === 0 ? (
        <div className="empty">Пока нет задач</div>
      ) : null}

      <ul className="list">
        {todos.map((todo) => (
          <li className="item" key={todo.id}>
            <button type="button" onClick={() => void onToggle(todo)}>
              {todo.done ? "✅" : "⬜"}
            </button>
            <div>
              <div className={todo.done ? "done" : ""}>{todo.title}</div>
              <div className="hint">Сервер · {toLocalText(todo.updatedAt)}</div>
            </div>
            <button type="button" onClick={() => void onDelete(todo)}>
              Удалить
            </button>
            <span className="hint">#{todo.id}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
