import React, { useState, useCallback, useRef } from 'react';
import TracingCanvas from '../LetterFormation/TracingCanvas';

/**
 * NumberFormation - Number tracing practice component (0-20)
 * Students trace numbers on a canvas, navigate with Next/Back buttons
 */
export default function NumberFormation() {
    // Setup state
    const [shuffleEnabled, setShuffleEnabled] = useState(false);

    // Practice state
    const [isAssessing, setIsAssessing] = useState(false);
    const [numbers, setNumbers] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const canvasRef = useRef(null);

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
        setIsAssessing(true);
    }, [shuffleEnabled]);

    const handleBack = useCallback(() => {
        setIsAssessing(false);
        setNumbers([]);
        setCurrentIndex(0);
    }, []);

    const handleNext = useCallback(() => {
        if (currentIndex < numbers.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    }, [currentIndex, numbers.length]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    }, [currentIndex]);

    // Practice view
    if (isAssessing && numbers.length > 0) {
        const isFirst = currentIndex === 0;
        const isLast = currentIndex === numbers.length - 1;

        return (
            <div className="tracing-view">
                <div className="tracing-header">
                    <span className="tracing-progress">
                        Number {currentIndex + 1} of {numbers.length}
                    </span>
                </div>
                <TracingCanvas
                    letter={numbers[currentIndex]?.display || '0'}
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
                    <h2>Number Formation</h2>
                    <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                        Trace numbers 0-20 on the canvas
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

                <div className="info-box">
                    <h4>📋 How it works</h4>
                    <ul>
                        <li>Trace over the number guide</li>
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
