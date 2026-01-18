import React, { useState, useCallback } from 'react';

/**
 * CompareNumbers - Compare numbers as numerals and quantities
 * Kindergarten-friendly: Click on the bigger/smaller number
 * 6 numeral comparisons + 6 quantity comparisons = 12 problems total
 */
export default function CompareNumbers() {
    const [isAssessing, setIsAssessing] = useState(false);
    const [problems, setProblems] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [results, setResults] = useState([]);
    const [isComplete, setIsComplete] = useState(false);

    const EMOJIS = ['🍎', '⭐', '🔵', '🌸', '🎈', '🍊'];
    const MAX_NUM = 10;

    // Generate comparison problems
    const generateProblems = useCallback(() => {
        const probs = [];
        const usedPairs = new Set();

        // Generate 6 numeral comparisons (ensure a != b for clear bigger/smaller)
        while (probs.filter(p => p.type === 'numeral').length < 6) {
            const a = Math.floor(Math.random() * (MAX_NUM + 1));
            const b = Math.floor(Math.random() * (MAX_NUM + 1));

            if (a === b) continue; // Skip equal pairs for kindergarten

            const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
            if (usedPairs.has(key)) continue;
            usedPairs.add(key);

            probs.push({
                type: 'numeral',
                a,
                b,
                answer: Math.max(a, b) // The bigger number is the answer
            });
        }

        // Generate 6 quantity comparisons
        while (probs.filter(p => p.type === 'quantity').length < 6) {
            const a = Math.floor(Math.random() * MAX_NUM) + 1;
            const b = Math.floor(Math.random() * MAX_NUM) + 1;

            if (a === b) continue; // Skip equal pairs

            const key = `q${Math.min(a, b)}-${Math.max(a, b)}`;
            if (usedPairs.has(key)) continue;
            usedPairs.add(key);

            const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

            probs.push({
                type: 'quantity',
                a,
                b,
                emoji,
                answer: Math.max(a, b) // The bigger quantity is the answer
            });
        }

        // Shuffle all problems
        return probs.sort(() => Math.random() - 0.5);
    }, []);

    const handleStart = useCallback(() => {
        const probs = generateProblems();
        setProblems(probs);
        setCurrentIndex(0);
        setResults([]);
        setIsComplete(false);
        setIsAssessing(true);
    }, [generateProblems]);

    const handleAnswer = useCallback((selectedAnswer) => {
        const problem = problems[currentIndex];
        const isCorrect = selectedAnswer === problem.answer;

        setResults(prev => [...prev, {
            ...problem,
            selected: selectedAnswer,
            correct: isCorrect
        }]);

        if (currentIndex >= problems.length - 1) {
            setIsComplete(true);
        } else {
            setCurrentIndex(prev => prev + 1);
        }
    }, [problems, currentIndex]);

    const handleRestart = useCallback(() => {
        setIsAssessing(false);
        setProblems([]);
        setCurrentIndex(0);
        setResults([]);
        setIsComplete(false);
    }, []);

    // Render quantity items in rows
    const renderQuantity = (count, emoji) => {
        const items = [];
        for (let i = 0; i < count; i++) {
            items.push(<span key={i} className="quantity-item">{emoji}</span>);
        }
        // Arrange in rows of 5
        const rows = [];
        for (let i = 0; i < items.length; i += 5) {
            rows.push(
                <div key={i} className="quantity-row">
                    {items.slice(i, i + 5)}
                </div>
            );
        }
        return rows;
    };

    // Results screen
    if (isComplete) {
        const correctCount = results.filter(r => r.correct).length;
        const percentage = Math.round((correctCount / results.length) * 100);

        return (
            <div className="setup-container" style={{ maxWidth: '700px' }}>
                <div className="card">
                    <div className="card-header text-center">
                        <h2>Compare Numbers Complete!</h2>
                    </div>

                    <div className="sight-words-summary">
                        <div className="summary-stat">
                            <span className="stat-value">{correctCount}</span>
                            <span className="stat-label">Correct</span>
                        </div>
                        <div className="summary-stat">
                            <span className="stat-value">{results.length - correctCount}</span>
                            <span className="stat-label">Incorrect</span>
                        </div>
                        <div className="summary-stat">
                            <span className="stat-value">{percentage}%</span>
                            <span className="stat-label">Score</span>
                        </div>
                    </div>

                    <div className="text-center" style={{ marginTop: '2rem' }}>
                        <button className="btn btn-primary btn-large" onClick={handleRestart}>
                            Start New Assessment
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Assessment view
    if (isAssessing && problems.length > 0) {
        const problem = problems[currentIndex];

        return (
            <div className="sight-words-assessment">
                <div className="sight-words-header">
                    <span className="level-label">Compare Numbers</span>
                    <span className="progress-indicator">{currentIndex + 1} / {problems.length}</span>
                </div>

                <p className="quantity-prompt">
                    {problem.type === 'numeral'
                        ? 'Click the BIGGER number'
                        : 'Click the group with MORE'}
                </p>

                <div className="compare-display">
                    {problem.type === 'numeral' ? (
                        <div className="compare-clickable">
                            <button
                                className="compare-num-btn"
                                onClick={() => handleAnswer(problem.a)}
                            >
                                {problem.a}
                            </button>
                            <span className="compare-or">or</span>
                            <button
                                className="compare-num-btn"
                                onClick={() => handleAnswer(problem.b)}
                            >
                                {problem.b}
                            </button>
                        </div>
                    ) : (
                        <div className="compare-clickable">
                            <button
                                className="compare-group-btn"
                                onClick={() => handleAnswer(problem.a)}
                            >
                                {renderQuantity(problem.a, problem.emoji)}
                            </button>
                            <span className="compare-or">or</span>
                            <button
                                className="compare-group-btn"
                                onClick={() => handleAnswer(problem.b)}
                            >
                                {renderQuantity(problem.b, problem.emoji)}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Setup screen
    return (
        <div className="setup-container">
            <div className="card">
                <div className="card-header">
                    <h2>Compare Numbers</h2>
                    <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                        Which is bigger?
                    </p>
                </div>

                <div className="info-box">
                    <h4>📋 How it works</h4>
                    <ul>
                        <li>12 comparison problems</li>
                        <li>6 number comparisons</li>
                        <li>6 counting comparisons</li>
                        <li>Click the bigger number or group</li>
                    </ul>
                </div>

                <div className="text-center" style={{ marginTop: '2rem' }}>
                    <button className="btn btn-primary btn-large" onClick={handleStart}>
                        Begin Assessment
                    </button>
                </div>
            </div>
        </div>
    );
}
