/**
 * Сервис для подсчёта баллов за ответы
 * Содержит бизнес-логику оценки разных типов вопросов
 */
export class ScoringService {
  /**
   * Оценивает вопрос с множественным выбором (multiple-select)
   * Правила: +1 за правильный выбор, -0.5 за неправильный, но не меньше 0
   *
   * @param correctAnswers - Массив правильных ответов (например, [1, 3, 5])
   * @param studentAnswers - Массив ответов студента
   * @returns Итоговый балл (число с плавающей точкой)
   */
  scoreMultipleSelect(correctAnswers: any[], studentAnswers: any[]): number {
    // Базовая проверка
    if (!Array.isArray(correctAnswers) || !Array.isArray(studentAnswers)) {
      return 0;
    }

    // Преобразуем в Set для удобства поиска
    const correctSet = new Set(correctAnswers);
    const studentSet = new Set(studentAnswers);

    let score = 0;

    // Проверяем каждый ответ студента
    for (const answer of studentAnswers) {
      if (correctSet.has(answer)) {
        score += 1; // Правильный ответ: +1
      } else {
        score -= 0.5; // Неправильный ответ: -0.5
      }
    }

    // Балл не может быть ниже 0
    return Math.max(0, score);
  }

  /**
   * Оценивает эссе на основе рубрики
   *
   * @param grades - Массив оценок по критериям (например, [4, 5, 3])
   * @param rubric - Рубрика с максимальными баллами (например, [5, 5, 5])
   * @returns Итоговый балл
   */
  scoreEssay(grades: number[], rubric: number[]): number {
    if (!Array.isArray(grades) || !Array.isArray(rubric)) {
      return 0;
    }

    // Суммируем баллы, но не больше максимума по каждому критерию
    let total = 0;
    for (let i = 0; i < grades.length; i++) {
      const maxPoints = rubric[i] || 0;
      const grade = Math.min(grades[i] || 0, maxPoints);
      total += Math.max(0, grade); // Не может быть отрицательным
    }

    return total;
  }

  /**
   * Оценивает вопрос с выбором одного ответа
   *
   * @param correctAnswer - Правильный ответ
   * @param studentAnswer - Ответ студента
   * @param points - Максимальные баллы за вопрос
   * @returns Баллы (points если правильно, 0 если нет)
   */
  scoreSingleSelect(
    correctAnswer: any,
    studentAnswer: any,
    points: number = 1,
  ): number {
    // Простое сравнение
    if (JSON.stringify(correctAnswer) === JSON.stringify(studentAnswer)) {
      return points;
    }
    return 0;
  }
}

// Экспортируем синглтон для использования во всём приложении
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
testScoring();
