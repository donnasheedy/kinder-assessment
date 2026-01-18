/**
 * Phonics-H Assessment Data
 * 10 Parts (5 currently defined, 5 TBD)
 */

export const PHONICS_H_PARTS = [
    {
        id: 1,
        name: 'Rhyming Words',
        description: 'Do these two words rhyme?',
        type: 'rhyme-match', // Button selection: check or X
        examples: [
            { words: ['hop', 'pop'], rhymes: true, explanation: 'These words rhyme!' },
            { words: ['cat', 'cup'], rhymes: false, explanation: 'These words do NOT rhyme.' }
        ],
        items: [
            { words: ['hug', 'mug'], rhymes: true },
            { words: ['flip', 'clip'], rhymes: true },
            { words: ['mess', 'less'], rhymes: true },
            { words: ['big', 'cat'], rhymes: false },
            { words: ['sun', 'tree'], rhymes: false }
        ]
    },
    {
        id: 2,
        name: 'Rhyme Production',
        description: 'Can the student say a word that rhymes?',
        type: 'proctor', // Left/Right arrow keys
        examples: [
            { word: 'gate', sampleRhymes: ['late', 'bait', 'date'] }
        ],
        items: [
            { word: 'dad', sampleRhymes: ['had', 'sad', 'mad', 'bad'] },
            { word: 'sled', sampleRhymes: ['bed', 'red', 'fed', 'led'] },
            { word: 'rake', sampleRhymes: ['bake', 'cake', 'lake', 'make'] },
            { word: 'care', sampleRhymes: ['bear', 'fair', 'hair', 'share'] },
            { word: 'rope', sampleRhymes: ['hope', 'cope', 'soap', 'mope'] }
        ]
    },
    {
        id: 3,
        name: 'Beginning Sound',
        description: 'What sound does the word start with?',
        type: 'sound-select', // Button selection from choices
        examples: [
            { word: 'tip', answer: 't', explanation: 'The beginning sound in "tip" is "t".' }
        ],
        items: [
            { word: 'cat', answer: 'c', choices: ['c', 's', 'k', 't'] },
            { word: 'send', answer: 's', choices: ['s', 'n', 'd', 'e'] },
            { word: 'fair', answer: 'f', choices: ['f', 'a', 'r', 'e'] },
            { word: 'skate', answer: 'sk', choices: ['sk', 's', 'k', 'st'] },
            { word: 'usher', answer: 'u', choices: ['u', 'sh', 's', 'r'] }
        ]
    },
    {
        id: 4,
        name: 'Ending Sound',
        description: 'What sound does the word end with?',
        type: 'sound-select', // Button selection from choices
        examples: [
            { word: 'bed', answer: 'd', explanation: 'The ending sound of "bed" is "d".' }
        ],
        items: [
            { word: 'set', answer: 't', choices: ['t', 's', 'e', 'n'] },
            { word: 'flop', answer: 'p', choices: ['p', 'f', 'l', 'o'] },
            { word: 'frog', answer: 'g', choices: ['g', 'f', 'r', 'o'] },
            { word: 'leaf', answer: 'f', choices: ['f', 'l', 'a', 'e'] },
            { word: 'turn', answer: 'n', choices: ['n', 't', 'r', 'u'] }
        ]
    },
    {
        id: 5,
        name: 'Remove Beginning Sound',
        description: 'Take away the beginning sound - what\'s left?',
        type: 'word-select', // Button selection from word choices
        examples: [
            { word: 'part', remove: 'p', answer: 'art', explanation: 'Take away the "p" from "part" - "art" is left.' },
            { word: 'clip', remove: 'c', answer: 'lip', explanation: 'Take away the "c" from "clip" - "lip" is left.' }
        ],
        items: [
            { word: 'bat', remove: 'b', answer: 'at', choices: ['at', 'ba', 'ta', 'ab'] },
            { word: 'send', remove: 's', answer: 'end', choices: ['end', 'sen', 'den', 'ned'] },
            { word: 'plate', remove: 'pl', answer: 'ate', choices: ['ate', 'lat', 'pla', 'eta'] },
            { word: 'train', remove: 't', answer: 'rain', choices: ['rain', 'tra', 'ain', 'ran'] },
            { word: 'spin', remove: 'sp', answer: 'in', choices: ['in', 'spi', 'pin', 'ni'] }
        ]
    }
    // Parts 6-10 TBD - will be added later
];

export const getTotalParts = () => PHONICS_H_PARTS.length;
