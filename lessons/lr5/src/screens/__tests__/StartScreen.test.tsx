import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { act } from "@testing-library/react";
import StartScreen from "../StartScreen";
import { useUIStore } from "../../stores/uiStore";

describe("Первичный экран", () => {
  const mockOnStart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    act(() => {
      useUIStore.setState({ theme: "light", soundEnabled: true });
    });
  });

  it("Нажатие кнопки НАЧАТЬ ИГРУ", async () => {
    const user = userEvent.setup();
    render(<StartScreen onStart={mockOnStart} isLoading={false} />);

    await user.click(screen.getByRole("button", { name: "Начать игру" }));

    expect(mockOnStart).toHaveBeenCalledTimes(1);
  });
});
