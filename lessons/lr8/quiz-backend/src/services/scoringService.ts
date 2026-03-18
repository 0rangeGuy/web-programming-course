/**
 * Сервис для подсчёта баллов за ответы
 */
export class ScoringService {
  /**
   * Оценивает вопрос с множественным выбором (multiple-select)
   */
  scoreMultipleSelect(correctAnswers: any[], studentAnswers: any[]): number {
    // Базовая проверка
    if (!Array.isArray(correctAnswers) || !Array.isArray(studentAnswers)) {
      return 0;
    }

    const correctSet = new Set(correctAnswers);
    const studentSet = new Set(studentAnswers);

    let score = 0;

    for (const answer of studentAnswers) {
      if (correctSet.has(answer)) {
        score += 1;
      } else {
        score -= 0.5;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Оценивает вопрос с выбором одного ответа
   */
  scoreSingleSelect(
    correctAnswer: any,
    studentAnswer: any,
    points: number = 1,
  ): number {
    // Приводим оба значения к одному типу и убираем лишние кавычки
    const correctStr = String(correctAnswer).replace(/^"|"$/g, "").trim();
    const studentStr = String(studentAnswer).replace(/^"|"$/g, "").trim();

    console.log("Comparing:", correctStr, "vs", studentStr); // для отладки

    if (correctStr === studentStr) {
      return points;
    }
    return 0;
  }
  /**
   * Оценивает эссе на основе рубрики
   */
  scoreEssay(grades: number[], rubric: number[]): number {
    if (!Array.isArray(grades) || !Array.isArray(rubric)) {
      return 0;
    }

    let total = 0;
    for (let i = 0; i < grades.length; i++) {
      const maxPoints = rubric[i] || 0;
      const grade = Math.min(grades[i] || 0, maxPoints);
      total += Math.max(0, grade);
    }

    return total;
  }

  /**
   * Универсальный метод для оценки вопроса по его типу
   */
  scoreQuestion(
    questionType: string,
    correctAnswer: string | null,
    userAnswer: string,
    points: number = 1,
  ): { score: number | null; isCorrect: boolean | null } {
    // Парсим правильный ответ
    let parsedCorrect: any = null;
    try {
      parsedCorrect = correctAnswer ? JSON.parse(correctAnswer) : null;
    } catch {
      parsedCorrect = correctAnswer; // если не JSON, используем как есть
    }

    // Для single-select userAnswer уже строка, не парсим её
    let parsedUser: any = userAnswer;

    // Для других типов пытаемся распарсить
    if (questionType !== "single-select") {
      try {
        parsedUser = JSON.parse(userAnswer);
      } catch {
        parsedUser = userAnswer;
      }
    }

    switch (questionType) {
      case "single-select":
        // Приводим к строкам и сравниваем
        const correctStr = String(parsedCorrect).trim();
        const userStr = String(parsedUser).trim();
        const score = correctStr === userStr ? points : 0;
        return {
          score,
          isCorrect: score === points,
        };

      case "multiple-select":
        const correctArray = Array.isArray(parsedCorrect) ? parsedCorrect : [];
        const userArray = Array.isArray(parsedUser) ? parsedUser : [];
        const multiScore = this.scoreMultipleSelect(correctArray, userArray);
        return {
          score: Math.min(multiScore, points),
          isCorrect: multiScore >= points,
        };

      case "essay":
        return {
          score: null,
          isCorrect: null,
        };

      default:
        return {
          score: null,
          isCorrect: null,
        };
    }
  }
}

export const scoringService = new ScoringService();

//-------------------------------------------------------------------------------------------------------------------------
//   Тесты
//npx ts-node src/services/scoringService.ts
//для запуска теста
//-------------------------------------------------------------------------------------------------------------------------
const testScoring = () => {
  const service = new ScoringService();

  // Тест multiple-select
  console.log(
    "Multiple-select test 1:",
    service.scoreMultipleSelect([1, 3, 5], [1, 2, 3]),
  );
  // Должно быть: +1 за 1, -0.5 за 2, +1 за 3 = 1.5

  console.log(
    "Multiple-select test 2 (min 0):",
    service.scoreMultipleSelect([1, 3], [2, 4, 5]),
  );
  // Должно быть: -0.5*3 = -1.5 -> 0

  // Тест essay
  console.log("Essay test:", service.scoreEssay([4, 5, 3], [5, 5, 5]));
  // Должно быть: 4+5+3 = 12

  // Тест single-select
  console.log(
    "Single-select test (correct):",
    service.scoreSingleSelect("A", "A", 2),
  );
  // Должно быть: 2

  console.log(
    "Single-select test (wrong):",
    service.scoreSingleSelect("A", "B", 2),
  );
  // Должно быть: 0
};

// Раскомментируйте для теста:
//testScoring();
