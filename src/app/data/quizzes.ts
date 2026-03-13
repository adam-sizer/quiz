import { Quiz } from '../models/quiz.model';

export const QUIZZES: Quiz[] = [
  {
    id: 'js-quirks',
    title: 'JavaScript Quirks',
    description: 'Think you know JS? Prove it with these cursed code snippets.',
    questions: [
      {
        text: 'What does console.log(!!-1) output?',
        options: [{ text: 'true' }, { text: 'false' }],
        correctIndex: 0,
        timeLimit: 15,
        explanation:
          'All numbers are truthy except 0, -0, and NaN. !! converts a value to its boolean equivalent, and -1 is truthy.',
      },
      {
        text: 'What does console.log([] == ![]) output?',
        options: [{ text: 'true' }, { text: 'false' }],
        correctIndex: 0,
        timeLimit: 20,
        explanation:
          '![] becomes false (arrays are truthy). Then [] == false coerces both to numbers: [] \u2192 "" \u2192 0, false \u2192 0. So 0 == 0 is true.',
      },
      {
        text: 'What does console.log(null == undefined) and console.log(null === undefined) output?',
        options: [
          { text: 'true, true' },
          { text: 'true, false' },
          { text: 'false, true' },
          { text: 'false, false' },
        ],
        correctIndex: 1,
        timeLimit: 20,
        explanation:
          'Loose equality (==) has a special rule: null and undefined are equal to each other. Strict equality (===) requires the same type, so they are not equal.',
      },
      {
        text: 'What does console.log("5" - 3) and console.log("5" + 3) output?',
        options: [
          { text: '2 and 8' },
          { text: '2 and "53"' },
          { text: '"2" and "53"' },
          { text: '"2" and 8' },
        ],
        correctIndex: 1,
        timeLimit: 20,
        explanation:
          'The minus operator forces numeric coercion, so "5" becomes 5. The plus operator prefers string concatenation if either operand is a string.',
      },
      {
        text: 'What does console.log(typeof []) output?',
        options: [
          { text: '"array"' },
          { text: '"object"' },
          { text: '"list"' },
          { text: '"undefined"' },
        ],
        correctIndex: 1,
        timeLimit: 15,
        explanation:
          'Arrays are objects in JavaScript. typeof only returns broad categories like "object" and does not distinguish arrays.',
      },
      {
        text: 'What does console.log(0.1 + 0.2 === 0.3) output?',
        options: [{ text: 'true' }, { text: 'false' }],
        correctIndex: 1,
        timeLimit: 15,
        explanation:
          'JavaScript uses IEEE 754 floating-point math. 0.1 + 0.2 becomes 0.30000000000000004, so strict equality fails.',
      },
      {
        text: 'Given: const arr = [1,2,3]; delete arr[1]; What is arr.length and arr?',
        options: [
          { text: '2 and [1, 3]' },
          { text: '3 and [1, 3]' },
          { text: '3 and [1, empty, 3]' },
          { text: '2 and [1, empty, 3]' },
        ],
        correctIndex: 2,
        timeLimit: 20,
        explanation:
          'delete removes the element but does not reindex the array. It creates a sparse "hole" and leaves length unchanged.',
      },
      {
        text: 'What does new Date(2025, 0, 1).getMonth() return?',
        options: [
          { text: '0' },
          { text: '1' },
          { text: 'January' },
          { text: 'Throws an error' },
        ],
        correctIndex: 0,
        timeLimit: 15,
        explanation:
          'In JavaScript Dates, months are zero-indexed. 0 = January, 1 = February, etc.',
      },
      {
        text: 'What does new Date("2025-02-31") evaluate to?',
        options: [
          { text: 'Invalid Date' },
          { text: 'February 31st, 2025' },
          { text: 'March 3rd, 2025' },
          { text: 'Throws an error' },
        ],
        correctIndex: 2,
        timeLimit: 20,
        explanation:
          'JavaScript auto-rolls invalid dates forward. February only has 28 days in 2025, so the 31st overflows into March.',
      },
      {
        text: 'What does console.log(true + true) output?',
        options: [
          { text: 'true' },
          { text: 'false' },
          { text: '1' },
          { text: '2' },
        ],
        correctIndex: 3,
        timeLimit: 15,
        explanation:
          'In arithmetic operations, booleans are coerced to numbers. true becomes 1, so true + true = 2.',
      },
      {
        text: 'What does console.log([] + []) output?',
        options: [
          { text: '0' },
          { text: '""  (empty string)' },
          { text: '[]' },
          { text: '"[object Object]"' },
        ],
        correctIndex: 1,
        timeLimit: 15,
        explanation:
          'Both arrays are converted to empty strings via .toString(). Then string concatenation occurs: "" + "" gives "".',
      },
      {
        text: 'What does console.log([] == 0) and console.log([] === 0) output?',
        options: [
          { text: 'true, true' },
          { text: 'true, false' },
          { text: 'false, true' },
          { text: 'false, false' },
        ],
        correctIndex: 1,
        timeLimit: 20,
        explanation:
          'Loose equality coerces [] \u2192 "" \u2192 0, so 0 == 0 is true. Strict equality requires the same type, so object !== number.',
      },
      {
        text: '\uD83D\uDC51 FINAL BOSS: What does console.log([1,2] + [3,4]) output?',
        options: [
          { text: '[1, 2, 3, 4]' },
          { text: '"1,23,4"' },
          { text: '"1,2,3,4"' },
          { text: 'Throws an error' },
        ],
        correctIndex: 1,
        timeLimit: 20,
        explanation:
          'Arrays convert to strings via .toString(). "1,2" + "3,4" concatenates to "1,23,4". Use .concat() or spread to merge arrays.',
      },
      {
        text: '\uD83D\uDC51 FINAL BOSS: What does console.log(3 > 2 > 1) output?',
        options: [
          { text: 'true' },
          { text: 'false' },
          { text: 'Throws an error' },
        ],
        correctIndex: 1,
        timeLimit: 20,
        explanation:
          'JS evaluates left to right: 3 > 2 becomes true. Then true > 1 coerces true to 1, so 1 > 1 is false.',
      },
      {
        text: '\uD83D\uDC51 FINAL BOSS: What does console.log("2" > "10") output?',
        options: [{ text: 'true' }, { text: 'false' }],
        correctIndex: 0,
        timeLimit: 15,
        explanation:
          'String comparisons are lexicographic (dictionary order), not numeric. "2" comes after "1" in Unicode, so "2" > "10" is true.',
      },
    ],
  },
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
