import React, { useState, useCallback } from 'react';

/**
 * Addition - Addition assessment with parts
 * type="single": Part 1 (0-5), Part 2 (0-9)
 * type="double": Part 1 (10-20 + 1-digit), Part 2 (10-90 + 1-digit)
 */
export default function Addition({ type = 'single' }) {
    const [selectedPart, setSelectedPart] = useState(1);
    const [isAssessing, setIsAssessing] = useState(false);
    const [problems, setProblems] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [results, setResults] = useState([]);
    const [isComplete, setIsComplete] = useState(false);

    const TYPE_SETTINGS = {
        single: {
            title: 'Addition (Single Digit)',
            parts: [
                { num: 1, label: 'Part 1: 0-5', desc: 'Add numbers 0-5', max: 5 },
                { num: 2, label: 'Part 2: 0-9', desc: 'Add numbers 0-9', max: 9 }
            ]
        },
        double: {
            title: 'Addition (Double Digit)',
            parts: [
                { num: 1, label: 'Part 1: 10-20', desc: '2-digit (10-20) + 1-digit', min: 10, max: 20 },
                { num: 2, label: 'Part 2: 10-90', desc: '2-digit (10-90) + 1-digit', min: 10, max: 90 }
            ]
        }
    };

    const settings = TYPE_SETTINGS[type];
    const currentPart = settings.parts[selectedPart - 1];
    const NUM_PROBLEMS = 10;

    // Generate 10 random addition problems
    const generateProblems = useCallback(() => {
        const probs = [];
        const usedProblems = new Set();

        while (probs.length < NUM_PROBLEMS) {
            let a, b;

            if (type === 'double') {
                // Double digit: range (min-max) + 1-digit (1-9)
                a = Math.floor(Math.random() * (currentPart.max - currentPart.min + 1)) + currentPart.min;
                b = Math.floor(Math.random() * 9) + 1;
            } else {
                // Single digit: 0 to max
                a = Math.floor(Math.random() * (currentPart.max + 1));
                b = Math.floor(Math.random() * (currentPart.max + 1));
            }

            const key = `${a}+${b}`;
            if (usedProblems.has(key)) continue;
            usedProblems.add(key);

            const answer = a + b;

            // Generate 3 choices
            const choices = new Set([answer]);
            while (choices.size < 3) {
                const offset = Math.floor(Math.random() * 7) - 3;
                const distractor = Math.max(0, answer + offset);
                if (distractor !== answer) {
                    choices.add(distractor);
                }
            }

            probs.push({
                a,
                b,
                answer,
                choices: Array.from(choices).sort(() => Math.random() - 0.5)
            });
        }

        return probs;
    }, [type, currentPart]);

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
            a: problem.a,
            b: problem.b,
            answer: problem.answer,
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

    // Results screen
    if (isComplete) {
        const correctCount = results.filter(r => r.correct).length;
        const percentage = Math.round((correctCount / results.length) * 100);

        return (
            <div className="setup-container" style={{ maxWidth: '700px' }}>
                <div className="card">
                    <div className="card-header text-center">
                        <h2>Addition Complete!</h2>
                        <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                            {currentPart.label}
                        </p>
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
                        <h4>Problems</h4>
                        <div className="addition-results-list">
                            {results.map((result, idx) => (
                                <div
                                    key={idx}
                                    className={`addition-result-item ${result.correct ? 'correct' : 'incorrect'}`}
                                >
                                    <span className="problem-text">
                                        {result.a} + {result.b} = {result.answer}
                                    </span>
                                    {!result.correct && (
                                        <span className="wrong-answer">
                                            (answered {result.selected})
                                        </span>
                                    )}
                                </div>
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
    if (isAssessing && problems.length > 0) {
        const problem = problems[currentIndex];

        return (
            <div className="sight-words-assessment">
                <div className="sight-words-header">
                    <span className="level-label">{settings.title} - {currentPart.label}</span>
                    <span className="progress-indicator">{currentIndex + 1} / {problems.length}</span>
                </div>

                <div className="addition-display">
                    <div className="addition-problem">
                        <span className="addend">{problem.a}</span>
                        <span className="operator">+</span>
                        <span className="addend">{problem.b}</span>
                        <span className="equals">=</span>
                        <span className="answer-blank">?</span>
                    </div>
                </div>

                <div className="quantity-choices">
                    {problem.choices.map((choice, idx) => (
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

    // Setup screen with part selection
    return (
        <div className="setup-container">
            <div className="card">
                <div className="card-header">
                    <h2>{settings.title}</h2>
                    <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                        10 addition problems
                    </p>
                </div>

                <div className="setup-section">
                    <label className="setup-label">Select Part</label>
                    <div className="toggle-group">
                        {settings.parts.map((part) => (
                            <button
                                key={part.num}
                                className={`toggle-btn ${selectedPart === part.num ? 'active' : ''}`}
                                onClick={() => setSelectedPart(part.num)}
                            >
                                {part.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="info-box">
                    <h4>📋 How it works</h4>
                    <ul>
                        <li>10 addition problems</li>
                        <li>{currentPart.desc}</li>
                        <li>Click the correct answer from 3 choices</li>
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
