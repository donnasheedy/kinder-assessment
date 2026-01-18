import React, { useState, useCallback, useRef } from 'react';
import TracingCanvas from './TracingCanvas';
import { generateLetterArray, shuffleArray } from '../../utils/letterUtils';

/**
 * LetterFormation - Letter tracing practice component
 * Students trace letters on a canvas, navigate with Next/Back buttons
 */
export default function LetterFormation() {
    // Setup state
    const [caseMode, setCaseMode] = useState('upper');
    const [shuffleEnabled, setShuffleEnabled] = useState(false);

    // Practice state
    const [isAssessing, setIsAssessing] = useState(false);
    const [letters, setLetters] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const canvasRef = useRef(null);

    const handleStart = useCallback(() => {
        let letterArray = generateLetterArray(caseMode);
        if (shuffleEnabled) {
            letterArray = shuffleArray(letterArray);
        }
        setLetters(letterArray);
        setCurrentIndex(0);
        setIsAssessing(true);
    }, [caseMode, shuffleEnabled]);

    const handleBack = useCallback(() => {
        setIsAssessing(false);
        setLetters([]);
        setCurrentIndex(0);
    }, []);

    const handleNext = useCallback(() => {
        if (currentIndex < letters.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    }, [currentIndex, letters.length]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    }, [currentIndex]);

    // Practice view
    if (isAssessing && letters.length > 0) {
        const isFirst = currentIndex === 0;
        const isLast = currentIndex === letters.length - 1;

        return (
            <div className="tracing-view">
                <div className="tracing-header">
                    <span className="tracing-progress">
                        Letter {currentIndex + 1} of {letters.length}
                    </span>
                </div>
                <TracingCanvas
                    letter={letters[currentIndex]?.display || 'A'}
                    canvasRef={canvasRef}
                />
                <div className="practice-controls">
                    <button
                        className="btn btn-secondary"
                        onClick={handlePrev}
                        disabled={isFirst}
                    >
                        ← Back
                    </button>
                    {isLast ? (
                        <button
                            className="btn btn-primary"
                            onClick={handleBack}
                        >
                            Done
                        </button>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={handleNext}
                        >
                            Next →
                        </button>
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
                    <h2>Letter Formation</h2>
                    <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                        Trace letters on the canvas
                    </p>
                </div>

                <div className="setup-section">
                    <label className="setup-label">Letter Case</label>
                    <div className="toggle-group">
                        {['upper', 'lower', 'mixed'].map((mode) => (
                            <button
                                key={mode}
                                className={`toggle-btn ${caseMode === mode ? 'active' : ''}`}
                                onClick={() => setCaseMode(mode)}
                            >
                                {mode === 'upper' ? 'Uppercase' : mode === 'lower' ? 'Lowercase' : 'Mixed'}
                            </button>
                        ))}
                    </div>
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
                        <span>Shuffle letter order</span>
                    </label>
                </div>

                <div className="info-box">
                    <h4>📋 How it works</h4>
                    <ul>
                        <li>Trace over the letter guide</li>
                        <li>Use Next and Back to navigate</li>
                        <li>Practice as many times as you want</li>
                    </ul>
                </div>

                <div className="text-center mb-lg" style={{ marginTop: '2rem' }}>
                    <button className="btn btn-primary btn-large" onClick={handleStart}>
                        Start Practice
                    </button>
                </div>
            </div>
        </div>
    );
}
