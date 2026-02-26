import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { act } from "@testing-library/react";
import MultipleSelectQuestion from "../MultipleSelectQuestion";
import { gameStore } from "../../../stores/gameStore";
import { useUIStore } from "../../../stores/uiStore";
import { mockSingleQuestion } from "../../../test/mockData";

describe("Вопросы - Мультивыбор", () => {
  const defaultProps = {
    question: mockSingleQuestion,
    selectedAnswers: [],
  };

  beforeEach(() => {
    act(() => {
      gameStore.resetGame();
      useUIStore.setState({ theme: "light" });
    });
  });

  it("Отображение всех вариантов", () => {
    render(<MultipleSelectQuestion {...defaultProps} />);

    expect(screen.getByText("Вариант 1")).toBeInTheDocument();
    expect(screen.getByText("Вариант 2")).toBeInTheDocument();
    expect(screen.getByText("Вариант 3")).toBeInTheDocument();
    expect(screen.getByText("Вариант 4")).toBeInTheDocument();
  });

  it("Отображение буквенных полей, пока не выбрано", () => {
    render(<MultipleSelectQuestion {...defaultProps} />);

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
    expect(screen.getByText("D")).toBeInTheDocument();
  });

  it("Отображение кэшмарка выбранных полей", () => {
    render(<MultipleSelectQuestion {...defaultProps} selectedAnswers={[0]} />);
    expect(screen.getByText("✓")).toBeInTheDocument();
    expect(screen.queryByText("A")).not.toBeInTheDocument();
  });

  it("Переключение ответа на нажатии", async () => {
    const user = userEvent.setup();
    render(<MultipleSelectQuestion {...defaultProps} />);

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]);

    expect(gameStore.selectedAnswers).toContain(0);

    await user.click(buttons[0]);
    expect(gameStore.selectedAnswers).not.toContain(0);
  });

  it("Выглючение кнопок при отключении", () => {
    render(<MultipleSelectQuestion {...defaultProps} disabled />);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });
});
