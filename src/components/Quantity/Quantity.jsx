import React, { useState, useCallback } from 'react';

// Generate items for counting display using emoji
const ITEM_TYPES = ['⭐', '🍎', '🔵', '❤️', '🌸', '🐟', '🦋', '🎈'];

/**
 * Quantity - Count items and select the correct number (0-20)
 * Shows visual items, student picks from 3 answer choices
 */
export default function Quantity() {
    const [isAssessing, setIsAssessing] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [results, setResults] = useState([]);
    const [isComplete, setIsComplete] = useState(false);

    // Generate questions for 0-20
    const generateQuestions = () => {
        const qs = [];
        for (let i = 0; i <= 20; i++) {
            const itemType = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];

            // Generate 3 choices including the correct answer
            const choices = new Set([i]);
            while (choices.size < 3) {
                // Add nearby numbers as distractors
                const offset = Math.floor(Math.random() * 5) - 2; // -2 to +2
                const distractor = Math.max(0, Math.min(20, i + offset));
                if (distractor !== i) {
                    choices.add(distractor);
                }
                // If we still need more, add random numbers
                if (choices.size < 3) {
                    choices.add(Math.floor(Math.random() * 21));
                }
            }

            // Shuffle choices
            const choicesArray = Array.from(choices).sort(() => Math.random() - 0.5);

            qs.push({
                count: i,
                item: itemType,
                choices: choicesArray
            });
        }

        // Shuffle questions
        return qs.sort(() => Math.random() - 0.5);
    };

    const handleStart = useCallback(() => {
        const qs = generateQuestions();
        setQuestions(qs);
        setCurrentIndex(0);
        setResults([]);
        setIsComplete(false);
        setIsAssessing(true);
    }, []);

    const handleAnswer = useCallback((selectedAnswer) => {
        const question = questions[currentIndex];
        const isCorrect = selectedAnswer === question.count;

        setResults(prev => [...prev, {
            count: question.count,
            selected: selectedAnswer,
            correct: isCorrect
        }]);

        if (currentIndex >= questions.length - 1) {
            setIsComplete(true);
        } else {
            setCurrentIndex(prev => prev + 1);
        }
    }, [questions, currentIndex]);

    const handleRestart = useCallback(() => {
        setIsAssessing(false);
        setQuestions([]);
        setCurrentIndex(0);
        setResults([]);
        setIsComplete(false);
    }, []);

    // Generate visual display of items
    const renderItems = (count, item) => {
        if (count === 0) {
            return (
                <div className="quantity-empty">
                    <span style={{ fontSize: '2rem', color: 'var(--gray-400)' }}>Empty!</span>
                </div>
            );
        }

        // Arrange items in rows (max 5 per row for clarity)
        const rows = [];
        const itemsPerRow = count <= 10 ? 5 : 7;
        for (let i = 0; i < count; i += itemsPerRow) {
            const rowItems = [];
            for (let j = i; j < Math.min(i + itemsPerRow, count); j++) {
                rowItems.push(
                    <span key={j} className="quantity-item">{item}</span>
                );
            }
            rows.push(
                <div key={i} className="quantity-row">{rowItems}</div>
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
                        <h2>Counting Complete!</h2>
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

                    <div className="sight-words-results">
                        <h4>Numbers Tested</h4>
                        <div className="words-grid">
                            {results.map((result, idx) => (
                                <span
                                    key={idx}
                                    className={`word-pill ${result.correct ? 'correct' : 'incorrect'}`}
                                    title={result.correct ? 'Correct' : `Selected ${result.selected}`}
                                >
                                    {result.count}
                                </span>
                            ))}
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
    if (isAssessing && questions.length > 0) {
        const question = questions[currentIndex];

        return (
            <div className="sight-words-assessment">
                <div className="sight-words-header">
                    <span className="level-label">Count the Items</span>
                    <span className="progress-indicator">{currentIndex + 1} / {questions.length}</span>
                </div>

                <div className="quantity-display">
                    <div className="quantity-items-box">
                        {renderItems(question.count, question.item)}
                    </div>
                </div>

                <p className="quantity-prompt">How many items are there?</p>

                <div className="quantity-choices">
                    {question.choices.map((choice, idx) => (
                        <button
                            key={idx}
                            className="quantity-choice-btn"
                            onClick={() => handleAnswer(choice)}
                        >
                            {choice}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Setup screen
    return (
        <div className="setup-container">
            <div className="card">
                <div className="card-header">
                    <h2>Quantity</h2>
                    <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                        Count items and select the correct number (0-20)
                    </p>
                </div>

                <div className="info-box">
                    <h4>📋 How it works</h4>
                    <ul>
                        <li>Items are displayed on screen</li>
                        <li>Student counts the items</li>
                        <li>Student clicks the correct number from 3 choices</li>
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
