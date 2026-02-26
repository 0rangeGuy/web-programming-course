import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore } from "../uiStore";
import { act } from "@testing-library/react";

describe("UIStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("Переключение звука", () => {
    const initialSound = useUIStore.getState().soundEnabled;

    act(() => {
      useUIStore.getState().toggleSound();
    });
    expect(useUIStore.getState().soundEnabled).toBe(!initialSound);

    act(() => {
      useUIStore.getState().toggleSound();
    });
    expect(useUIStore.getState().soundEnabled).toBe(initialSound);
  });

  it("Переключение темы (темная-светлая)", () => {
    act(() => {
      useUIStore.getState().setTheme("light");
    });

    act(() => {
      useUIStore.getState().toggleTheme();
    });
    expect(useUIStore.getState().theme).toBe("dark");

    act(() => {
      useUIStore.getState().toggleTheme();
    });
    expect(useUIStore.getState().theme).toBe("light");
  });
});
