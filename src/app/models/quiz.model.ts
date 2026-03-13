export interface QuizOption {
  text: string;
}

export interface QuizQuestion {
  text: string;
  options: QuizOption[];
  correctIndex: number;
  timeLimit: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
}
