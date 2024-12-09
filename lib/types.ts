export interface QuizQuestion {
    question: string;
    choices: string[];
    answer: string | string[];
    reason: string;
}

export interface QuizAttempt {
    question: QuizQuestion;
    userAnswer: string[];
    isCorrect: boolean;
}