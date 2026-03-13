import { Quiz } from '../models/quiz.model';

export const QUIZZES: Quiz[] = [
  {
    id: 'general-knowledge',
    title: 'General Knowledge',
    description: 'Test your general knowledge with these fun trivia questions!',
    questions: [
      {
        text: 'What is the capital of Australia?',
        options: [{ text: 'Sydney' }, { text: 'Melbourne' }, { text: 'Canberra' }, { text: 'Perth' }],
        correctIndex: 2,
        timeLimit: 20,
      },
      {
        text: 'Which planet is known as the Red Planet?',
        options: [{ text: 'Venus' }, { text: 'Mars' }, { text: 'Jupiter' }, { text: 'Saturn' }],
        correctIndex: 1,
        timeLimit: 15,
      },
      {
        text: 'What year did the Titanic sink?',
        options: [{ text: '1905' }, { text: '1912' }, { text: '1918' }, { text: '1923' }],
        correctIndex: 1,
        timeLimit: 20,
      },
      {
        text: 'Which element has the chemical symbol "O"?',
        options: [{ text: 'Gold' }, { text: 'Osmium' }, { text: 'Oxygen' }, { text: 'Oganesson' }],
        correctIndex: 2,
        timeLimit: 15,
      },
      {
        text: 'How many sides does a hexagon have?',
        options: [{ text: '5' }, { text: '6' }, { text: '7' }, { text: '8' }],
        correctIndex: 1,
        timeLimit: 10,
      },
    ],
  },
  {
    id: 'science-tech',
    title: 'Science & Technology',
    description: 'How well do you know science and tech?',
    questions: [
      {
        text: 'What does "HTTP" stand for?',
        options: [
          { text: 'HyperText Transfer Protocol' },
          { text: 'High Tech Transfer Program' },
          { text: 'HyperText Transmission Process' },
          { text: 'Home Tool Transfer Protocol' },
        ],
        correctIndex: 0,
        timeLimit: 20,
      },
      {
        text: 'What is the speed of light approximately?',
        options: [
          { text: '300,000 km/s' },
          { text: '150,000 km/s' },
          { text: '500,000 km/s' },
          { text: '1,000,000 km/s' },
        ],
        correctIndex: 0,
        timeLimit: 20,
      },
      {
        text: 'Who is known as the father of computer science?',
        options: [
          { text: 'Albert Einstein' },
          { text: 'Isaac Newton' },
          { text: 'Alan Turing' },
          { text: 'Nikola Tesla' },
        ],
        correctIndex: 2,
        timeLimit: 20,
      },
      {
        text: 'What programming language was created by Brendan Eich in 10 days?',
        options: [{ text: 'Python' }, { text: 'Java' }, { text: 'JavaScript' }, { text: 'C++' }],
        correctIndex: 2,
        timeLimit: 15,
      },
      {
        text: 'What does DNA stand for?',
        options: [
          { text: 'Deoxyribonucleic Acid' },
          { text: 'Dinitrogen Acid' },
          { text: 'Dynamic Nucleic Assembly' },
          { text: 'Dual Nitrogen Acid' },
        ],
        correctIndex: 0,
        timeLimit: 20,
      },
    ],
  },
  {
    id: 'pop-culture',
    title: 'Pop Culture',
    description: 'Movies, music, and more!',
    questions: [
      {
        text: 'Which movie features the quote "I\'ll be back"?',
        options: [
          { text: 'RoboCop' },
          { text: 'The Terminator' },
          { text: 'Die Hard' },
          { text: 'Predator' },
        ],
        correctIndex: 1,
        timeLimit: 15,
      },
      {
        text: 'What is the name of the fictional continent in Game of Thrones?',
        options: [{ text: 'Westeros' }, { text: 'Narnia' }, { text: 'Middle-earth' }, { text: 'Tamriel' }],
        correctIndex: 0,
        timeLimit: 20,
      },
      {
        text: 'Which band released the album "Abbey Road"?',
        options: [
          { text: 'The Rolling Stones' },
          { text: 'The Beatles' },
          { text: 'Led Zeppelin' },
          { text: 'Pink Floyd' },
        ],
        correctIndex: 1,
        timeLimit: 15,
      },
      {
        text: 'In what year was the first iPhone released?',
        options: [{ text: '2005' }, { text: '2006' }, { text: '2007' }, { text: '2008' }],
        correctIndex: 2,
        timeLimit: 15,
      },
      {
        text: 'What is the highest-grossing film of all time (not adjusted for inflation)?',
        options: [
          { text: 'Avengers: Endgame' },
          { text: 'Avatar' },
          { text: 'Titanic' },
          { text: 'Star Wars: The Force Awakens' },
        ],
        correctIndex: 1,
        timeLimit: 20,
      },
    ],
  },
];
