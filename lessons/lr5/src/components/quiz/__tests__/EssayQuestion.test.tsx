import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { act } from "@testing-library/react";
import EssayQuestion from "../EssayQuestion";
import { useUIStore } from "../../../stores/uiStore";
import { mockEssayQuestion } from "../../../test/mockData";

describe("Вопросы - Эссе", () => {
  const defaultProps = {
    question: mockEssayQuestion,
    essayAnswer: "",
    onAnswerChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    act(() => {
      useUIStore.setState({ theme: "light" });
    });
  });

  it("Отображение поля ввода", () => {
    render(<EssayQuestion {...defaultProps} />);
    expect(
      screen.getByPlaceholderText("Введите ваш ответ здесь...")
    ).toBeInTheDocument();
  });

  it("Отображает то, что ввел", () => {
    render(<EssayQuestion {...defaultProps} essayAnswer="Test answer" />);
    expect(screen.getByDisplayValue("Test answer")).toBeInTheDocument();
  });

  it("Вызов onAnswerChange при вводе", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<EssayQuestion {...defaultProps} onAnswerChange={handleChange} />);

    const textarea = screen.getByPlaceholderText("Введите ваш ответ здесь...");
    await user.type(textarea, "A");

    expect(handleChange).toHaveBeenCalledWith("A");
  });

  it("Подсчет символов", () => {
    render(<EssayQuestion {...defaultProps} essayAnswer="Hello" />);
    expect(screen.getByText(/5 символов/)).toBeInTheDocument();
  });

  it("Отображение минимальной длины", () => {
    render(<EssayQuestion {...defaultProps} />);
    expect(screen.getByText(/минимум 100/)).toBeInTheDocument();
  });

  it("Контроль максимальной длины", () => {
    render(<EssayQuestion {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(
      "Введите ваш ответ здесь..."
    ) as HTMLTextAreaElement;
    expect(textarea.maxLength).toBe(1000);
  });
});
