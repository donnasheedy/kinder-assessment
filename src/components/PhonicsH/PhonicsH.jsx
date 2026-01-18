import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PHONICS_H_PARTS } from '../../data/phonicsHData';

/**
 * PhonicsH - Phonics Assessment Module
 * Multiple interaction types: button selection, proctor-style
 */
export default function PhonicsH() {
    const [isAssessing, setIsAssessing] = useState(false);
    const [currentPartIndex, setCurrentPartIndex] = useState(0);
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [isInExample, setIsInExample] = useState(true);
    const [exampleIndex, setExampleIndex] = useState(0);
    const [partResults, setPartResults] = useState({});
    const [isComplete, setIsComplete] = useState(false);
    const [showExampleFeedback, setShowExampleFeedback] = useState(false);

    // Refs for keyboard handler
    const isAssessingRef = useRef(false);
    const isCompleteRef = useRef(false);
    const isInExampleRef = useRef(true);
    const currentPartIndexRef = useRef(0);
    const currentItemIndexRef = useRef(0);

    useEffect(() => {
        isAssessingRef.current = isAssessing;
        isCompleteRef.current = isComplete;
        isInExampleRef.current = isInExample;
        currentPartIndexRef.current = currentPartIndex;
        currentItemIndexRef.current = currentItemIndex;
    }, [isAssessing, isComplete, isInExample, currentPartIndex, currentItemIndex]);

    const currentPart = PHONICS_H_PARTS[currentPartIndex];
    const totalParts = PHONICS_H_PARTS.length;

    const handleStart = useCallback(() => {
        setCurrentPartIndex(0);
        currentPartIndexRef.current = 0;
        setCurrentItemIndex(0);
        currentItemIndexRef.current = 0;
        setIsInExample(true);
        isInExampleRef.current = true;
        setExampleIndex(0);
        setPartResults({});
        setIsComplete(false);
        isCompleteRef.current = false;
        setShowExampleFeedback(false);
        setIsAssessing(true);
        isAssessingRef.current = true;
    }, []);

    const moveToNextItem = useCallback(() => {
        const pIdx = currentPartIndexRef.current;
        const iIdx = currentItemIndexRef.current;
        const part = PHONICS_H_PARTS[pIdx];

        if (iIdx >= part.items.length - 1) {
            // Part complete, move to next part
            if (pIdx >= PHONICS_H_PARTS.length - 1) {
                setIsComplete(true);
                isCompleteRef.current = true;
            } else {
                setCurrentPartIndex(pIdx + 1);
                currentPartIndexRef.current = pIdx + 1;
                setCurrentItemIndex(0);
                currentItemIndexRef.current = 0;
                setIsInExample(true);
                isInExampleRef.current = true;
                setExampleIndex(0);
                setShowExampleFeedback(false);
            }
        } else {
            setCurrentItemIndex(iIdx + 1);
            currentItemIndexRef.current = iIdx + 1;
        }
    }, []);

    const recordResult = useCallback((isCorrect) => {
        if (!isAssessingRef.current || isCompleteRef.current) return;
        if (isInExampleRef.current) return; // Don't record examples

        const pIdx = currentPartIndexRef.current;
        const iIdx = currentItemIndexRef.current;
        const part = PHONICS_H_PARTS[pIdx];
        const item = part.items[iIdx];

        setPartResults(prev => {
            const updated = { ...prev };
            if (!updated[part.id]) {
                updated[part.id] = { correct: 0, incorrect: 0, items: [] };
            }
            // Guard against duplicates
            if (updated[part.id].items.length > iIdx) return prev;

            updated[part.id].items.push({ item, correct: isCorrect });
            if (isCorrect) {
                updated[part.id].correct++;
            } else {
                updated[part.id].incorrect++;
            }
            return updated;
        });

        moveToNextItem();
    }, [moveToNextItem]);

    const handleExampleNext = useCallback(() => {
        const part = PHONICS_H_PARTS[currentPartIndexRef.current];
        if (exampleIndex >= part.examples.length - 1) {
            // Done with examples, start assessment
            setIsInExample(false);
            isInExampleRef.current = false;
            setShowExampleFeedback(false);
        } else {
            setExampleIndex(prev => prev + 1);
            setShowExampleFeedback(false);
        }
    }, [exampleIndex]);

    const handleExampleResponse = useCallback((response) => {
        setShowExampleFeedback(true);
    }, []);

    // Keyboard handler for proctor-style parts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isAssessingRef.current || isCompleteRef.current) return;

            const part = PHONICS_H_PARTS[currentPartIndexRef.current];
            if (part.type !== 'proctor') return;

            if (isInExampleRef.current) {
                // During examples, any key continues
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === ' ') {
                    e.preventDefault();
                    handleExampleNext();
                }
                return;
            }

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
    }, [recordResult, handleExampleNext]);

    const handleRestart = useCallback(() => {
        setIsAssessing(false);
        isAssessingRef.current = false;
        setCurrentPartIndex(0);
        setCurrentItemIndex(0);
        setIsInExample(true);
        setExampleIndex(0);
        setPartResults({});
        setIsComplete(false);
        setShowExampleFeedback(false);
    }, []);

    // Results screen
    if (isComplete) {
        return (
            <div className="setup-container" style={{ maxWidth: '800px' }}>
                <div className="card">
                    <div className="card-header text-center">
                        <h2>Phonics-H Complete!</h2>
                    </div>

                    <div className="phonics-results">
                        {PHONICS_H_PARTS.map((part) => {
                            const result = partResults[part.id];
                            if (!result) return null;

                            const total = result.correct + result.incorrect;
                            const percentage = Math.round((result.correct / total) * 100);

                            return (
                                <div key={part.id} className="phonics-part-result">
                                    <div className="part-header">
                                        <span className="part-number">Part {part.id}</span>
                                        <span className="part-name">{part.name}</span>
                                    </div>
                                    <div className="part-score">
                                        <span className="score-fraction">{result.correct}/{total}</span>
                                        <span className={`score-percentage ${percentage >= 80 ? 'good' : percentage >= 60 ? 'okay' : 'poor'}`}>
                                            {percentage}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
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
    if (isAssessing && currentPart) {
        const currentExample = isInExample ? currentPart.examples[exampleIndex] : null;
        const currentItem = !isInExample ? currentPart.items[currentItemIndex] : null;

        return (
            <div className="phonics-assessment">
                <div className="phonics-header">
                    <div className="part-indicator">
                        <span className="part-label">Part {currentPart.id} of {totalParts}</span>
                        <span className="part-title">{currentPart.name}</span>
                    </div>
                    {!isInExample && (
                        <div className="progress-indicator">
                            <span>{currentItemIndex + 1} / {currentPart.items.length}</span>
                        </div>
                    )}
                    {isInExample && (
                        <div className="example-badge">Example {exampleIndex + 1}</div>
                    )}
                </div>

                <div className="phonics-content">
                    {/* Part 1: Rhyming Words */}
                    {currentPart.type === 'rhyme-match' && (
                        <div className="rhyme-match-view">
                            {isInExample ? (
                                <>
                                    <div className="word-pair">
                                        <span className="rhyme-word">{currentExample.words[0]}</span>
                                        <span className="word-separator">&</span>
                                        <span className="rhyme-word">{currentExample.words[1]}</span>
                                    </div>
                                    <p className="instruction">Do these words rhyme?</p>
                                    {!showExampleFeedback ? (
                                        <div className="rhyme-buttons">
                                            <button className="rhyme-btn no" onClick={() => handleExampleResponse(false)}>
                                                ✗
                                            </button>
                                            <button className="rhyme-btn yes" onClick={() => handleExampleResponse(true)}>
                                                ✓
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="example-feedback">
                                            <p className={currentExample.rhymes ? 'correct' : 'incorrect'}>
                                                {currentExample.explanation}
                                            </p>
                                            <button className="btn btn-primary" onClick={handleExampleNext}>
                                                Continue
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="word-pair">
                                        <span className="rhyme-word">{currentItem.words[0]}</span>
                                        <span className="word-separator">&</span>
                                        <span className="rhyme-word">{currentItem.words[1]}</span>
                                    </div>
                                    <p className="instruction">Do these words rhyme?</p>
                                    <div className="rhyme-buttons">
                                        <button className="rhyme-btn no" onClick={() => recordResult(!currentItem.rhymes)}>
                                            ✗
                                        </button>
                                        <button className="rhyme-btn yes" onClick={() => recordResult(currentItem.rhymes)}>
                                            ✓
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Part 2: Rhyme Production (Proctor Style) */}
                    {currentPart.type === 'proctor' && (
                        <div className="proctor-view">
                            {isInExample ? (
                                <>
                                    <div className="prompt-word">{currentExample.word}</div>
                                    <p className="instruction">Can the student say a word that rhymes?</p>
                                    <p className="sample-rhymes">
                                        Sample rhymes: {currentExample.sampleRhymes.join(', ')}
                                    </p>
                                    <button className="btn btn-primary" onClick={handleExampleNext}>
                                        Start Assessment
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="prompt-word">{currentItem.word}</div>
                                    <p className="instruction">Can the student say a word that rhymes?</p>
                                    <div className="proctor-controls">
                                        <div className="control-hint incorrect">
                                            <span className="key">←</span>
                                            <span>No/Incorrect</span>
                                        </div>
                                        <div className="control-hint correct">
                                            <span className="key">→</span>
                                            <span>Yes/Correct</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Part 3 & 4: Sound Selection */}
                    {currentPart.type === 'sound-select' && (
                        <div className="sound-select-view">
                            {isInExample ? (
                                <>
                                    <div className="prompt-word">{currentExample.word}</div>
                                    <p className="instruction">{currentPart.description}</p>
                                    <div className="example-feedback show">
                                        <p>{currentExample.explanation}</p>
                                        <button className="btn btn-primary" onClick={handleExampleNext}>
                                            Start Assessment
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="prompt-word">{currentItem.word}</div>
                                    <p className="instruction">{currentPart.description}</p>
                                    <div className="sound-choices">
                                        {currentItem.choices.map((choice, idx) => (
                                            <button
                                                key={idx}
                                                className="sound-btn"
                                                onClick={() => recordResult(choice === currentItem.answer)}
                                            >
                                                {choice}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Part 5: Word Selection (Remove Beginning Sound) */}
                    {currentPart.type === 'word-select' && (
                        <div className="word-select-view">
                            {isInExample ? (
                                <>
                                    <div className="prompt-word">{currentExample.word}</div>
                                    <p className="instruction">
                                        Take away the "{currentExample.remove}" sound
                                    </p>
                                    <div className="example-feedback show">
                                        <p>{currentExample.explanation}</p>
                                        <button className="btn btn-primary" onClick={handleExampleNext}>
                                            {exampleIndex < currentPart.examples.length - 1 ? 'Next Example' : 'Start Assessment'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="prompt-word">{currentItem.word}</div>
                                    <p className="instruction">
                                        Take away the "{currentItem.remove}" sound. What's left?
                                    </p>
                                    <div className="word-choices">
                                        {currentItem.choices.map((choice, idx) => (
                                            <button
                                                key={idx}
                                                className="word-btn"
                                                onClick={() => recordResult(choice === currentItem.answer)}
                                            >
                                                {choice}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
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
                    <h2>Phonics-H</h2>
                    <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                        Phonemic Awareness Assessment - {totalParts} Parts
                    </p>
                </div>

                <div className="phonics-parts-preview">
                    {PHONICS_H_PARTS.map((part) => (
                        <div key={part.id} className="part-preview">
                            <span className="part-num">{part.id}</span>
                            <div className="part-info">
                                <span className="part-title">{part.name}</span>
                                <span className="part-count">{part.items.length} items</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="info-box">
                    <h4>📋 How it works</h4>
                    <ul>
                        <li>Each part starts with examples, then assessment</li>
                        <li>Some parts: student clicks ✓ or ✗ buttons</li>
                        <li>Some parts: proctor uses arrow keys</li>
                        <li>Some parts: student selects from sound/word choices</li>
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
