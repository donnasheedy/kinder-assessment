import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BPST_PARTS, PASSING_THRESHOLD } from '../../data/bpstData';

/**
 * BPSTII - Basic Phonics Skills Test II
 * 8-part progressive phonics assessment
 * Auto-stops if student misses more than 60% in any category
 */
export default function BPSTII() {
    // Assessment state
    const [isAssessing, setIsAssessing] = useState(false);
    const [currentPartIndex, setCurrentPartIndex] = useState(0);
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [partResults, setPartResults] = useState({});
    const [isComplete, setIsComplete] = useState(false);
    const [stoppedEarly, setStoppedEarly] = useState(false);
    const [stoppedAtPart, setStoppedAtPart] = useState(null);

    // Use refs to track the actual indices for keyboard handler
    const currentPartIndexRef = useRef(0);
    const currentItemIndexRef = useRef(0);
    const isAssessingRef = useRef(false);
    const isCompleteRef = useRef(false);

    // Sync refs with state
    useEffect(() => {
        currentPartIndexRef.current = currentPartIndex;
        currentItemIndexRef.current = currentItemIndex;
        isAssessingRef.current = isAssessing;
        isCompleteRef.current = isComplete;
    }, [currentPartIndex, currentItemIndex, isAssessing, isComplete]);

    const currentPart = BPST_PARTS[currentPartIndex];
    const currentItem = currentPart?.items[currentItemIndex];
    const totalPartsCount = BPST_PARTS.length;

    const handleStart = useCallback(() => {
        setCurrentPartIndex(0);
        setCurrentItemIndex(0);
        currentPartIndexRef.current = 0;
        currentItemIndexRef.current = 0;
        setPartResults({});
        setIsComplete(false);
        isCompleteRef.current = false;
        setStoppedEarly(false);
        setStoppedAtPart(null);
        setIsAssessing(true);
        isAssessingRef.current = true;
    }, []);

    const recordResult = useCallback((isCorrect) => {
        if (!isAssessingRef.current || isCompleteRef.current) return;

        const pIdx = currentPartIndexRef.current;
        const iIdx = currentItemIndexRef.current;
        const part = BPST_PARTS[pIdx];
        if (!part) return;

        const partId = part.id;
        const item = part.items[iIdx];
        if (!item) return;

        const isLastItemInPart = iIdx >= part.items.length - 1;
        const isLastPart = pIdx >= BPST_PARTS.length - 1;

        // Immediately update refs to prevent double-processing
        if (isLastItemInPart) {
            if (isLastPart) {
                isCompleteRef.current = true;
            } else {
                currentPartIndexRef.current = pIdx + 1;
                currentItemIndexRef.current = 0;
            }
        } else {
            currentItemIndexRef.current = iIdx + 1;
        }

        // Now update state
        setPartResults(prev => {
            const updatedResults = { ...prev };
            if (!updatedResults[partId]) {
                updatedResults[partId] = { correct: 0, incorrect: 0, items: [] };
            }

            // Check if this specific item was already recorded (guard against duplicates)
            const expectedItems = iIdx + 1;
            if (updatedResults[partId].items.length >= expectedItems) {
                return prev; // Already recorded
            }

            updatedResults[partId].items.push({ item, correct: isCorrect });
            if (isCorrect) {
                updatedResults[partId].correct++;
            } else {
                updatedResults[partId].incorrect++;
            }

            // Check if ALREADY failed (>60% wrong) at ANY point during the part
            const totalItems = part.items.length;
            const incorrectCount = updatedResults[partId].incorrect;
            const maxAllowedWrong = Math.floor(totalItems * 0.6); // 60% of total

            // If incorrect count exceeds 60% of total items, stop immediately
            if (incorrectCount > maxAllowedWrong) {
                setStoppedEarly(true);
                setStoppedAtPart(part);
                setIsComplete(true);
                isCompleteRef.current = true;
                return updatedResults;
            }

            // Handle part completion (if we got here, we passed this part)
            if (isLastItemInPart) {
                if (isLastPart) {
                    setIsComplete(true);
                } else {
                    setCurrentPartIndex(pIdx + 1);
                    setCurrentItemIndex(0);
                }
            } else {
                setCurrentItemIndex(iIdx + 1);
            }

            return updatedResults;
        });
    }, []);

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
        setCurrentPartIndex(0);
        currentPartIndexRef.current = 0;
        setCurrentItemIndex(0);
        currentItemIndexRef.current = 0;
        setPartResults({});
        setIsComplete(false);
        isCompleteRef.current = false;
        setStoppedEarly(false);
        setStoppedAtPart(null);
    }, []);

    // Results screen
    if (isComplete) {
        return (
            <div className="setup-container" style={{ maxWidth: '800px' }}>
                <div className="card">
                    <div className="card-header text-center">
                        <h2>{stoppedEarly ? 'Assessment Stopped' : 'BPST II Complete!'}</h2>
                        {stoppedEarly && (
                            <p style={{ color: 'var(--incorrect)', marginTop: '0.5rem' }}>
                                Stopped at Part {stoppedAtPart?.id}: {stoppedAtPart?.name}
                                <br />
                                <small>Student missed more than 60% of items</small>
                            </p>
                        )}
                    </div>

                    <div className="bpst-results">
                        {BPST_PARTS.map((part) => {
                            const result = partResults[part.id];
                            if (!result) {
                                return (
                                    <div key={part.id} className="bpst-part-result not-tested">
                                        <div className="part-header">
                                            <span className="part-number">Part {part.id}</span>
                                            <span className="part-name">{part.name}</span>
                                        </div>
                                        <div className="part-status">Not Tested</div>
                                    </div>
                                );
                            }

                            const total = result.correct + result.incorrect;
                            const percentage = Math.round((result.correct / total) * 100);
                            const passed = percentage >= (PASSING_THRESHOLD * 100);

                            return (
                                <div key={part.id} className={`bpst-part-result ${passed ? 'passed' : 'failed'}`}>
                                    <div className="part-header">
                                        <span className="part-number">Part {part.id}</span>
                                        <span className="part-name">{part.name}</span>
                                    </div>
                                    <div className="part-score">
                                        <span className="score-fraction">{result.correct}/{total}</span>
                                        <span className={`score-percentage ${passed ? 'good' : 'poor'}`}>
                                            {percentage}%
                                        </span>
                                    </div>
                                    <div className="part-items">
                                        {result.items.map((item, idx) => (
                                            <span
                                                key={idx}
                                                className={`item-pill ${item.correct ? 'correct' : 'incorrect'}`}
                                                title={item.correct ? 'Correct' : 'Needs Work'}
                                            >
                                                {item.item}
                                            </span>
                                        ))}
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

    // Assessment view - CLEAN display for student (no scores shown)
    if (isAssessing && currentPart) {
        const itemsInPart = currentPart.items.length;

        return (
            <div className="bpst-assessment">
                <div className="bpst-header">
                    <div className="part-indicator">
                        <span className="part-label">Part {currentPart.id} of {totalPartsCount}</span>
                        <span className="part-title">{currentPart.name}</span>
                    </div>
                    <div className="progress-indicator">
                        <span>{currentItemIndex + 1} / {itemsInPart}</span>
                    </div>
                </div>

                <div className="bpst-stimulus-container">
                    <div className={`bpst-stimulus ${currentPart.type}`}>
                        {currentItem}
                    </div>
                </div>

                <div className="bpst-controls">
                    <div className="control-hint incorrect">
                        <span className="key">←</span>
                        <span>Needs Work</span>
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
                    <h2>BPST II</h2>
                    <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                        Basic Phonics Skills Test - 8 Parts
                    </p>
                </div>

                <div className="bpst-parts-preview">
                    {BPST_PARTS.map((part) => (
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
                        <li>Show each item to the student one at a time</li>
                        <li>Press <strong>→ (Right Arrow)</strong> if correct</li>
                        <li>Press <strong>← (Left Arrow)</strong> if needs work</li>
                        <li>Test stops if student misses more than 60% in any part</li>
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
