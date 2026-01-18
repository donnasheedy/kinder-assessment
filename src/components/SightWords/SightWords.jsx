import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SIGHT_WORDS_LEVELS, CONSECUTIVE_MISS_LIMIT } from '../../data/sightWordsData';

/**
 * SightWords - Flashcard-style sight word assessment
 * Stops when student misses 3 words in a row
 */
export default function SightWords() {
    const [isAssessing, setIsAssessing] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [results, setResults] = useState([]);
    const [isComplete, setIsComplete] = useState(false);
    const [stoppedEarly, setStoppedEarly] = useState(false);
    const [consecutiveMisses, setConsecutiveMisses] = useState(0);

    const words = SIGHT_WORDS_LEVELS.K.words;
    const currentWord = words[currentIndex];

    // Refs for keyboard handler
    const currentIndexRef = useRef(0);
    const isAssessingRef = useRef(false);
    const isCompleteRef = useRef(false);
    const consecutiveMissesRef = useRef(0);

    useEffect(() => {
        currentIndexRef.current = currentIndex;
        isAssessingRef.current = isAssessing;
        isCompleteRef.current = isComplete;
        consecutiveMissesRef.current = consecutiveMisses;
    }, [currentIndex, isAssessing, isComplete, consecutiveMisses]);

    const handleStart = useCallback(() => {
        setCurrentIndex(0);
        currentIndexRef.current = 0;
        setResults([]);
        setIsComplete(false);
        isCompleteRef.current = false;
        setStoppedEarly(false);
        setConsecutiveMisses(0);
        consecutiveMissesRef.current = 0;
        setIsAssessing(true);
        isAssessingRef.current = true;
    }, []);

    const recordResult = useCallback((isCorrect) => {
        if (!isAssessingRef.current || isCompleteRef.current) return;

        const idx = currentIndexRef.current;
        const word = words[idx];

        // Update results
        setResults(prev => {
            // Guard against duplicates
            if (prev.length > idx) return prev;
            return [...prev, { word, correct: isCorrect }];
        });

        // Track consecutive misses
        let newConsecutiveMisses = consecutiveMissesRef.current;
        if (isCorrect) {
            newConsecutiveMisses = 0;
        } else {
            newConsecutiveMisses++;
        }
        setConsecutiveMisses(newConsecutiveMisses);
        consecutiveMissesRef.current = newConsecutiveMisses;

        // Check if we should stop (3 in a row missed)
        if (newConsecutiveMisses >= CONSECUTIVE_MISS_LIMIT) {
            setStoppedEarly(true);
            setIsComplete(true);
            isCompleteRef.current = true;
            return;
        }

        // Check if we've reached the end
        if (idx >= words.length - 1) {
            setIsComplete(true);
            isCompleteRef.current = true;
        } else {
            setCurrentIndex(idx + 1);
            currentIndexRef.current = idx + 1;
        }
    }, [words]);

    // Keyboard handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isAssessingRef.current || isCompleteRef.current) return;

            if (e.key === 'ArrowRight') {
                e.preventDefault();
                recordResult(true);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                recordResult(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [recordResult]);

    const handleRestart = useCallback(() => {
        setIsAssessing(false);
        isAssessingRef.current = false;
        setCurrentIndex(0);
        currentIndexRef.current = 0;
        setResults([]);
        setIsComplete(false);
        isCompleteRef.current = false;
        setStoppedEarly(false);
        setConsecutiveMisses(0);
        consecutiveMissesRef.current = 0;
    }, []);

    // Results screen
    if (isComplete) {
        const correctCount = results.filter(r => r.correct).length;
        const totalTested = results.length;
        const percentage = Math.round((correctCount / totalTested) * 100);

        return (
            <div className="setup-container" style={{ maxWidth: '700px' }}>
                <div className="card">
                    <div className="card-header text-center">
                        <h2>{stoppedEarly ? 'Assessment Stopped' : 'Sight Words Complete!'}</h2>
                        {stoppedEarly && (
                            <p style={{ color: 'var(--incorrect)', marginTop: '0.5rem' }}>
                                Stopped after 3 consecutive misses
                            </p>
                        )}
                    </div>

                    <div className="sight-words-summary">
                        <div className="summary-stat">
                            <span className="stat-value">{correctCount}</span>
                            <span className="stat-label">Correct</span>
                        </div>
                        <div className="summary-stat">
                            <span className="stat-value">{totalTested - correctCount}</span>
                            <span className="stat-label">Missed</span>
                        </div>
                        <div className="summary-stat">
                            <span className="stat-value">{percentage}%</span>
                            <span className="stat-label">Score</span>
                        </div>
                    </div>

                    <div className="sight-words-results">
                        <h4>Words Tested</h4>
                        <div className="words-grid">
                            {results.map((result, idx) => (
                                <span
                                    key={idx}
                                    className={`word-pill ${result.correct ? 'correct' : 'incorrect'}`}
                                >
                                    {result.word}
                                </span>
                            ))}
                        </div>

                        {totalTested < words.length && (
                            <div className="words-not-tested">
                                <h4>Not Tested ({words.length - totalTested} words)</h4>
                                <div className="words-grid faded">
                                    {words.slice(totalTested).map((word, idx) => (
                                        <span key={idx} className="word-pill not-tested">{word}</span>
                                    ))}
                                </div>
                            </div>
                        )}
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
    if (isAssessing) {
        return (
            <div className="sight-words-assessment">
                <div className="sight-words-header">
                    <span className="level-label">Level K Sight Words</span>
                    <span className="progress-indicator">{currentIndex + 1} / {words.length}</span>
                </div>

                <div className="sight-word-display">
                    <div className="sight-word-card">
                        {currentWord}
                    </div>
                </div>

                <div className="sight-words-controls">
                    <div className="control-hint incorrect">
                        <span className="key">←</span>
                        <span>Missed</span>
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
                    <h2>Sight Words</h2>
                    <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                        Level K - {words.length} words
                    </p>
                </div>

                <div className="info-box">
                    <h4>📋 How it works</h4>
                    <ul>
                        <li>Show each word to the student one at a time</li>
                        <li>Press <strong>→ (Right Arrow)</strong> if read correctly</li>
                        <li>Press <strong>← (Left Arrow)</strong> if missed</li>
                        <li>Test stops if student misses 3 words in a row</li>
                    </ul>
                </div>

                <div className="word-preview">
                    <h4>Words to test:</h4>
                    <div className="words-grid preview">
                        {words.map((word, idx) => (
                            <span key={idx} className="word-pill preview">{word}</span>
                        ))}
                    </div>
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
