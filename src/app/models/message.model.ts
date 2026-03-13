// Host → Player messages
export interface WelcomeMessage {
  type: 'welcome';
  playerCount: number;
}

export interface PlayerJoinedMessage {
  type: 'player-joined';
  name: string;
  playerCount: number;
}

export interface StartMessage {
  type: 'start';
}

export interface QuestionMessage {
  type: 'question';
  index: number;
  text: string;
  options: string[];
  timeLimit: number;
}

export interface RevealMessage {
  type: 'reveal';
  correctIndex: number;
  scores: { name: string; score: number; delta: number }[];
}

export interface GameOverMessage {
  type: 'game-over';
  finalScores: { name: string; score: number; rank: number }[];
}

export type HostMessage =
  | WelcomeMessage
  | PlayerJoinedMessage
  | StartMessage
  | QuestionMessage
  | RevealMessage
  | GameOverMessage;

// Player → Host messages
export interface JoinMessage {
  type: 'join';
  name: string;
}

export interface AnswerMessage {
  type: 'answer';
  questionIndex: number;
  optionIndex: number;
}

export type PlayerMessage = JoinMessage | AnswerMessage;

export type GameMessage = HostMessage | PlayerMessage;
