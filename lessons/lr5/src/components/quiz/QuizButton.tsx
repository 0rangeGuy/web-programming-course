import { useUIStore } from "../../stores/uiStore";

interface QuizButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  fullWidth?: boolean;
  variant?: "primary" | "scale";
}

const QuizButton = ({
  onClick,
  disabled = false,
  children,
  fullWidth = true,
  variant = "primary",
}: QuizButtonProps) => {
  const theme = useUIStore((state) => state.theme);

  const primaryColor = theme === "light" ? "bg-purple-600" : "bg-purple-700";
  const primaryHover =
    theme === "light" ? "hover:bg-purple-700" : "hover:bg-purple-800";

  const scaleClass = variant === "scale" ? "hover:scale-105 transform" : "";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${fullWidth ? "w-full" : ""} ${primaryColor} ${primaryHover} ${scaleClass} rounded-xl px-6 py-3 font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {children}
    </button>
  );
};

export default QuizButton;
