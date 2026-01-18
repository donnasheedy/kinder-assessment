import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * NumberIdentification - Number recognition assessment (0-20)
 * Shows one number at a time, proctor scores with arrow keys
 */
export default function NumberIdentification() {
    // Setup state
    const [shuffleEnabled, setShuffleEnabled] = useState(false);

    // Assessment state
    const [isAssessing, setIsAssessing] = useState(false);
    const [numbers, setNumbers] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [results, setResults] = useState([]);
    const [isComplete, setIsComplete] = useState(false);

    // Use refs to track latest values for keyboard handler
    const stateRef = useRef({ isAssessing, isComplete, currentIndex, numbers });
    useEffect(() => {
        stateRef.current = { isAssessing, isComplete, currentIndex, numbers };
    }, [isAssessing, isComplete, currentIndex, numbers]);

    // Generate numbers 0-20
    const generateNumberArray = () => {
        return Array.from({ length: 21 }, (_, i) => ({
            value: i,
            display: String(i)
        }));
    };

    // Shuffle array
    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const handleStart = useCallback(() => {
        let numberArray = generateNumberArray();
        if (shuffleEnabled) {
            numberArray = shuffleArray(numberArray);
        }
        setNumbers(numberArray);
        setCurrentIndex(0);
        setResults([]);
        setIsComplete(false);
        setIsAssessing(true);
    }, [shuffleEnabled]);

    const handleRestart = useCallback(() => {
        setIsAssessing(false);
        setNumbers([]);
        setCurrentIndex(0);
        setResults([]);
        setIsComplete(false);
    }, []);

    // Keyboard handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            const { isAssessing, isComplete, currentIndex, numbers } = stateRef.current;

            if (!isAssessing || isComplete || currentIndex >= numbers.length) return;

            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();

                const currentNumber = numbers[currentIndex];
                const isCorrect = e.key === 'ArrowRight';

                const result = {
                    value: currentNumber.value,
                    display: currentNumber.display,
                    correct: isCorrect,
                    index: currentIndex
                };

                setResults(prev => [...prev, result]);

                if (currentIndex === numbers.length - 1) {
                    setIsComplete(true);
                } else {
                    setCurrentIndex(currentIndex + 1);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Results screen
    if (isComplete) {
        const correctCount = results.filter(r => r.correct).length;
        const incorrectCount = results.filter(r => !r.correct).length;
        const percentage = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;
        const incorrectNumbers = results.filter(r => !r.correct).map(r => r.display);

        return (
            <div className="setup-container">
                <div className="card">
                    <div className="card-header text-center">
                        <h2>Assessment Complete!</h2>
                        <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                            Numbers 0-20
                        </p>
                    </div>

                    <div className="stats-row">
                        <div className="stat-card correct">
                            <div className="stat-value">{correctCount}</div>
                            <div className="stat-label">Correct</div>
                        </div>
                        <div className="stat-card incorrect">
                            <div className="stat-value">{incorrectCount}</div>
                            <div className="stat-label">Incorrect</div>
                        </div>
                    </div>

                    <div className="text-center mb-xl">
                        <span style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: percentage >= 70 ? 'var(--correct)' : 'var(--incorrect)'
                        }}>
                            {percentage}%
                        </span>
                    </div>

                    <h4 className="mb-md">All Numbers</h4>
                    <div className="results-grid mb-xl">
                        {results.map((result, index) => (
                            <div
                                key={index}
                                className={`result-cell ${result.correct ? 'correct' : 'incorrect'}`}
                            >
                                {result.display}
                            </div>
                        ))}
                    </div>

                    {incorrectCount > 0 && (
                        <div className="mb-xl">
                            <h4 className="mb-md">Numbers Needing Practice</h4>
                            <p style={{
                                fontSize: '1.5rem',
                                fontFamily: 'var(--font-display)',
                                color: 'var(--incorrect)',
                                letterSpacing: '0.25em'
                            }}>
                                {incorrectNumbers.join('  ')}
                            </p>
                        </div>
                    )}

                    <div className="text-center">
                        <button className="btn btn-primary btn-large" onClick={handleRestart}>
                            Start New Assessment
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Assessment view - one number at a time
    if (isAssessing) {
        const currentNumber = numbers[currentIndex];

        return (
            <div className="sight-words-assessment">
                <div className="sight-words-header">
                    <span className="level-label">Number Identification (0-20)</span>
                    <span className="progress-indicator">{currentIndex + 1} / {numbers.length}</span>
                </div>

                <div className="sight-word-display">
                    <div className="sight-word-card" style={{ fontSize: '8rem' }}>
                        {currentNumber?.display}
                    </div>
                </div>

                <div className="sight-words-controls">
                    <div className="control-hint incorrect">
                        <span className="key">←</span>
                        <span>Incorrect</span>
                    </div>
                    <div className="control-hint correct">
                        <span className="key">→</span>
                        <span>Correct</span>
                    </div>
                </div>
            </div>
        );
    }

    // Setup screen
    return (
        <div className="setup-container">
            <div className="card">
                <div className="card-header">
                    <h2>Number Identification</h2>
                    <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                        Can the student identify numbers 0-20?
                    </p>
                </div>

                <div className="setup-section">
                    <label className="checkbox-toggle">
                        <input
                            type="checkbox"
                            checked={shuffleEnabled}
                            onChange={(e) => setShuffleEnabled(e.target.checked)}
                        />
                        <span className="toggle-track">
                            <span className="toggle-thumb"></span>
                        </span>
                        <span>Shuffle number order</span>
                    </label>
                </div>

                <div className="keyboard-hint">
                    <div className="key-hint">
                        <span className="key">←</span>
                        <span>Incorrect</span>
                    </div>
                    <div className="key-hint">
                        <span className="key">→</span>
                        <span>Correct</span>
                    </div>
                </div>

                <div className="info-box">
                    <h4>📋 How it works</h4>
                    <ul>
                        <li>Numbers 0-20 shown one at a time</li>
                        <li>Student says the number name</li>
                        <li>Use arrow keys to score (← wrong, → correct)</li>
                    </ul>
                </div>

                <div className="text-center mb-lg" style={{ marginTop: '2rem' }}>
                    <button className="btn btn-primary btn-large" onClick={handleStart}>
                        Begin Assessment
                    </button>
                </div>
            </div>
        </div>
    );
}
