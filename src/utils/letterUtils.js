/**
 * Letter utility functions for the assessment module
 */

/**
 * Generates an array of letters A-Z in the specified case mode
 * @param {'upper' | 'lower' | 'mixed'} caseMode - The case mode for letters
 * @returns {Array<{letter: string, displayCase: 'upper' | 'lower'}>}
 */
export function generateLetterArray(caseMode) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  return alphabet.map((letter, index) => {
    let displayLetter;
    let displayCase;
    
    switch (caseMode) {
      case 'upper':
        displayLetter = letter;
        displayCase = 'upper';
        break;
      case 'lower':
        displayLetter = letter.toLowerCase();
        displayCase = 'lower';
        break;
      case 'mixed':
        // Random case for each letter
        displayCase = Math.random() > 0.5 ? 'upper' : 'lower';
        displayLetter = displayCase === 'upper' ? letter : letter.toLowerCase();
        break;
      default:
        displayLetter = letter;
        displayCase = 'upper';
    }
    
    return {
      letter: letter, // Base letter (always uppercase for reference)
      display: displayLetter,
      displayCase: displayCase,
      index: index
    };
  });
}

/**
 * Fisher-Yates shuffle algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled copy of the array
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Formats results for display/export
 * @param {Array} results - Array of result objects
 * @returns {Object} - Formatted summary
 */
export function summarizeResults(results) {
  const correct = results.filter(r => r.correct);
  const incorrect = results.filter(r => !r.correct);
  
  return {
    total: results.length,
    correctCount: correct.length,
    incorrectCount: incorrect.length,
    percentage: Math.round((correct.length / results.length) * 100),
    correctLetters: correct.map(r => r.display),
    incorrectLetters: incorrect.map(r => r.display),
    details: results
  };
}
