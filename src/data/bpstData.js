/**
 * BPST II Data - Basic Phonics Skills Test II
 * 13 Parts with progressive difficulty
 */

export const BPST_PARTS = [
    {
        id: 1,
        name: 'Consonant Sounds',
        description: 'Identify consonant letter sounds',
        items: ['m', 's', 'f', 'l', 'r', 'n', 'h', 'v', 'w', 'z', 'b', 'c', 'd', 'g', 'p', 't', 'j', 'k', 'y', 'x', 'q'],
        type: 'letter'
    },
    {
        id: 2,
        name: 'Short Vowel Sounds',
        description: 'Identify short vowel sounds',
        items: ['i', 'o', 'a', 'u', 'e'],
        type: 'vowel'
    },
    {
        id: 3,
        name: 'Digraphs',
        description: 'Identify digraph sounds',
        items: ['sh', 'th', 'ch', 'wh'],
        type: 'digraph'
    },
    {
        id: 4,
        name: 'Short Vowel Blending',
        description: 'Read short vowel words',
        items: ['map', 'rip', 'met', 'rub', 'mop', 'lip', 'lot', 'zap', 'fell', 'nut'],
        type: 'word'
    },
    {
        id: 5,
        name: 'Blends',
        description: 'Read consonant blend words',
        items: ['left', 'must', 'frog', 'flip', 'snack'],
        type: 'word'
    },
    {
        id: 6,
        name: 'Final E Words',
        description: 'Read silent-e words',
        items: ['fine', 'rope', 'rake', 'cute', 'kite'],
        type: 'word'
    },
    {
        id: 7,
        name: 'Long Vowel Words',
        description: 'Read long vowel pattern words',
        items: ['soap', 'leak', 'pain', 'feed', 'ray'],
        type: 'word'
    },
    {
        id: 8,
        name: 'R-Controlled Words',
        description: 'Read r-controlled vowel words',
        items: ['burn', 'fork', 'dirt', 'part', 'serve'],
        type: 'word'
    },
    {
        id: 9,
        name: 'OVD Words',
        description: 'Read other vowel digraph words',
        items: ['coin', 'soon', 'round', 'lawn', 'foot'],
        type: 'word'
    },
    {
        id: 10,
        name: 'Inflections',
        description: 'Read words with inflected endings',
        items: ['filled', 'letting', 'rested', 'passes', 'licked'],
        type: 'word'
    },
    {
        id: 11,
        name: '2-Syllable Words',
        description: 'Read two-syllable words',
        items: ['silent', 'ladder', 'napkin', 'polite', 'cactus'],
        type: 'word'
    },
    {
        id: 12,
        name: 'Affixes',
        description: 'Read words with prefixes and suffixes',
        items: ['distrust', 'useful', 'unfair', 'hardship', 'nonsense'],
        type: 'word'
    },
    {
        id: 13,
        name: '3-4 Syllable Words',
        description: 'Read multi-syllable words',
        items: ['volcano', 'potato', 'electric', 'respectfully', 'transportation'],
        type: 'word'
    }
];

// Calculate passing threshold (need at least 40% correct to pass)
export const PASSING_THRESHOLD = 0.4;

// Get total items for a part
export const getPartItemCount = (partId) => {
    const part = BPST_PARTS.find(p => p.id === partId);
    return part ? part.items.length : 0;
};

// Calculate if student passed a part (got at least 40% correct)
export const didPassPart = (correctCount, totalCount) => {
    return (correctCount / totalCount) >= PASSING_THRESHOLD;
};
