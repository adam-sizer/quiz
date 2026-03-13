export interface QuizOption {
  text: string;
}

export interface QuizQuestion {
  text: string;
  options: QuizOption[];
  correctIndex: number;
  timeLimit: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
}
