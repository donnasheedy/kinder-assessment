import React, { useState, useCallback } from 'react';

/**
 * NumberSequence - Count number sequences
 * Part 1: Pick 1 next number
 * Part 2: Pick 2 next numbers (one at a time)
 * Part 3: Pick 3 next numbers (one at a time)
 */
export default function NumberSequence() {
    const [selectedPart, setSelectedPart] = useState(1);
    const [isAssessing, setIsAssessing] = useState(false);
    const [problems, setProblems] = useState([]);
    const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
    const [currentAnswerIndex, setCurrentAnswerIndex] = useState(0); // For multi-answer parts
    const [revealedAnswers, setRevealedAnswers] = useState([]); // Answers revealed so far
    const [results, setResults] = useState([]);
    const [isComplete, setIsComplete] = useState(false);

    const PARTS = [
        { num: 1, label: 'Part 1: One Number', desc: 'Pick 1 next number', answersNeeded: 1 },
        { num: 2, label: 'Part 2: Two Numbers', desc: 'Pick 2 next numbers', answersNeeded: 2 },
        { num: 3, label: 'Part 3: Three Numbers', desc: 'Pick 3 next numbers', answersNeeded: 3 }
    ];

    const currentPart = PARTS[selectedPart - 1];
    const MAX_NUM = 10 + currentPart.answersNeeded; // Allow higher answers for longer sequences

    // Generate sequence problems based on part
    const generateProblems = useCallback(() => {
        const probs = [];
        const answersNeeded = currentPart.answersNeeded;

        // Valid starts depend on how many answers we need
        // Start + 2 visible + answersNeeded <= MAX_NUM
        const maxStart = MAX_NUM - 2 - answersNeeded;
        const validStarts = [];
        for (let i = 0; i <= maxStart; i++) {
            validStarts.push(i);
        }

        // Shuffle and take up to 8
        const shuffledStarts = validStarts.sort(() => Math.random() - 0.5).slice(0, 8);

        for (const start of shuffledStarts) {
            const sequence = [start, start + 1, start + 2];
            const answers = [];
            for (let i = 0; i < answersNeeded; i++) {
                answers.push(start + 3 + i);
            }

            probs.push({
                sequence,
                answers, // Array of correct answers
            });
        }

        return probs;
    }, [currentPart, MAX_NUM]);

    // Generate choices for current answer
    const getChoices = useCallback((correctAnswer) => {
        const choices = new Set([correctAnswer]);
        while (choices.size < 3) {
            const offset = Math.floor(Math.random() * 5) - 2;
            const distractor = Math.max(0, correctAnswer + offset);
            if (distractor !== correctAnswer) {
                choices.add(distractor);
            }
        }
        return Array.from(choices).sort(() => Math.random() - 0.5);
    }, []);

    const handleStart = useCallback(() => {
        const probs = generateProblems();
        setProblems(probs);
        setCurrentProblemIndex(0);
        setCurrentAnswerIndex(0);
        setRevealedAnswers([]);
        setResults([]);
        setIsComplete(false);
        setIsAssessing(true);
    }, [generateProblems]);

    const handleAnswer = useCallback((selectedAnswer) => {
        const problem = problems[currentProblemIndex];
        const correctAnswer = problem.answers[currentAnswerIndex];
        const isCorrect = selectedAnswer === correctAnswer;

        // Record this answer
        setResults(prev => [...prev, {
            problemIndex: currentProblemIndex,
            answerIndex: currentAnswerIndex,
            sequence: problem.sequence,
            correctAnswer,
            selected: selectedAnswer,
            correct: isCorrect
        }]);

        // If correct, reveal the answer and move to next
        if (isCorrect) {
            const newRevealed = [...revealedAnswers, correctAnswer];
            setRevealedAnswers(newRevealed);

            // Check if we need more answers for this problem
            if (currentAnswerIndex < currentPart.answersNeeded - 1) {
                setCurrentAnswerIndex(currentAnswerIndex + 1);
            } else {
                // Move to next problem
                if (currentProblemIndex >= problems.length - 1) {
                    setIsComplete(true);
                } else {
                    setCurrentProblemIndex(currentProblemIndex + 1);
                    setCurrentAnswerIndex(0);
                    setRevealedAnswers([]);
                }
            }
        } else {
            // Wrong answer - move to next problem anyway
            if (currentProblemIndex >= problems.length - 1) {
                setIsComplete(true);
            } else {
                setCurrentProblemIndex(currentProblemIndex + 1);
                setCurrentAnswerIndex(0);
                setRevealedAnswers([]);
            }
        }
    }, [problems, currentProblemIndex, currentAnswerIndex, revealedAnswers, currentPart]);

    const handleRestart = useCallback(() => {
        setIsAssessing(false);
        setProblems([]);
        setCurrentProblemIndex(0);
        setCurrentAnswerIndex(0);
        setRevealedAnswers([]);
        setResults([]);
        setIsComplete(false);
    }, []);

    // Results screen
    if (isComplete) {
        const correctCount = results.filter(r => r.correct).length;
        const totalAnswers = results.length;
        const percentage = Math.round((correctCount / totalAnswers) * 100);

        return (
            <div className="setup-container" style={{ maxWidth: '700px' }}>
                <div className="card">
                    <div className="card-header text-center">
                        <h2>Number Sequence Complete!</h2>
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
                            <span className="stat-value">{totalAnswers - correctCount}</span>
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
        const problem = problems[currentProblemIndex];
        const correctAnswer = problem.answers[currentAnswerIndex];
        const choices = getChoices(correctAnswer);

        // Build the display sequence with revealed answers
        const displaySequence = [...problem.sequence, ...revealedAnswers];

        return (
            <div className="sight-words-assessment">
                <div className="sight-words-header">
                    <span className="level-label">Number Sequence - {currentPart.label}</span>
                    <span className="progress-indicator">{currentProblemIndex + 1} / {problems.length}</span>
                </div>

                <p className="quantity-prompt">What comes next?</p>

                <div className="sequence-display">
                    <div className="sequence-numbers">
                        {displaySequence.map((num, idx) => (
                            <span key={idx} className="sequence-num">{num}</span>
                        ))}
                        <span className="sequence-num mystery">?</span>
                    </div>
                </div>

                <div className="quantity-choices">
                    {choices.map((choice, idx) => (
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
                    <h2>Number Sequence</h2>
                    <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                        Count what comes next
                    </p>
                </div>

                <div className="setup-section">
                    <label className="setup-label">Select Part</label>
                    <div className="toggle-group">
                        {PARTS.map((part) => (
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
                        <li>8 counting sequences</li>
                        <li>See 3 numbers in order</li>
                        <li>{currentPart.desc}</li>
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
