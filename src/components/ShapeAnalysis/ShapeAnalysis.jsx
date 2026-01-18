import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * ShapeAnalysis - Shape drawing assessment component
 * Students draw shapes on a canvas, proctor scores with arrow keys
 */
export default function ShapeAnalysis() {
    const [isAssessing, setIsAssessing] = useState(false);
    const [shapes, setShapes] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [results, setResults] = useState([]);
    const [isComplete, setIsComplete] = useState(false);

    const canvasRef = useRef(null);
    const isDrawingRef = useRef(false);

    const SHAPES = [
        { name: 'Circle', instructions: 'Draw a circle' },
        { name: 'Square', instructions: 'Draw a square' },
        { name: 'Triangle', instructions: 'Draw a triangle' },
        { name: 'Rectangle', instructions: 'Draw a rectangle' },
        { name: 'Hexagon', instructions: 'Draw a hexagon (6 sides)' }
    ];

    // Use refs to track latest values for keyboard handler
    const stateRef = useRef({ isAssessing, isComplete, currentIndex, shapes });
    useEffect(() => {
        stateRef.current = { isAssessing, isComplete, currentIndex, shapes };
    }, [isAssessing, isComplete, currentIndex, shapes]);

    const handleStart = useCallback(() => {
        const shuffled = [...SHAPES].sort(() => Math.random() - 0.5);
        setShapes(shuffled);
        setCurrentIndex(0);
        setResults([]);
        setIsComplete(false);
        setIsAssessing(true);
    }, []);

    const handleRestart = useCallback(() => {
        setIsAssessing(false);
        setShapes([]);
        setCurrentIndex(0);
        setResults([]);
        setIsComplete(false);
    }, []);

    // Clear canvas
    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }, []);

    // Drawing functionality
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#4A90E2';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const getPos = (e) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        };

        const startDrawing = (e) => {
            e.preventDefault();
            isDrawingRef.current = true;
            const pos = getPos(e);
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        };

        const draw = (e) => {
            if (!isDrawingRef.current) return;
            e.preventDefault();
            const pos = getPos(e);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        };

        const stopDrawing = () => {
            isDrawingRef.current = false;
        };

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);
        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('touchmove', draw);
        canvas.addEventListener('touchend', stopDrawing);

        return () => {
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mouseleave', stopDrawing);
            canvas.removeEventListener('touchstart', startDrawing);
            canvas.removeEventListener('touchmove', draw);
            canvas.removeEventListener('touchend', stopDrawing);
        };
    }, [isAssessing, currentIndex]);

    // Clear canvas when moving to next shape
    useEffect(() => {
        if (isAssessing) {
            clearCanvas();
        }
    }, [currentIndex, isAssessing, clearCanvas]);

    // Keyboard handler for scoring
    useEffect(() => {
        const handleKeyDown = (e) => {
            const { isAssessing, isComplete, currentIndex, shapes } = stateRef.current;

            if (!isAssessing || isComplete || currentIndex >= shapes.length) return;

            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();

                const currentShape = shapes[currentIndex];
                const isCorrect = e.key === 'ArrowRight';

                const result = {
                    shape: currentShape.name,
                    correct: isCorrect,
                    index: currentIndex
                };

                setResults(prev => [...prev, result]);

                if (currentIndex === shapes.length - 1) {
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
        const incorrectShapes = results.filter(r => !r.correct).map(r => r.shape);

        return (
            <div className="setup-container">
                <div className="card">
                    <div className="card-header text-center">
                        <h2>Shape Analysis Complete!</h2>
                    </div>

                    <div className="sight-words-summary">
                        <div className="summary-stat">
                            <span className="stat-value">{correctCount}</span>
                            <span className="stat-label">Correct</span>
                        </div>
                        <div className="summary-stat">
                            <span className="stat-value">{incorrectCount}</span>
                            <span className="stat-label">Incorrect</span>
                        </div>
                        <div className="summary-stat">
                            <span className="stat-value">{percentage}%</span>
                            <span className="stat-label">Score</span>
                        </div>
                    </div>

                    {incorrectShapes.length > 0 && (
                        <div className="sight-words-results">
                            <h4>Needs Practice</h4>
                            <div className="word-grid">
                                {incorrectShapes.map((shape, idx) => (
                                    <span key={idx} className="word-item incorrect">{shape}</span>
                                ))}
                            </div>
                        </div>
                    )}

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
    if (isAssessing && shapes.length > 0) {
        const currentShape = shapes[currentIndex];

        return (
            <div className="sight-words-assessment">
                <div className="sight-words-header">
                    <span className="level-label">Shape Analysis</span>
                    <span className="progress-indicator">{currentIndex + 1} / {shapes.length}</span>
                </div>

                <p className="quantity-prompt">{currentShape.instructions}</p>

                <div className="tracing-area">
                    <canvas
                        ref={canvasRef}
                        width={400}
                        height={400}
                        className="tracing-canvas"
                    />
                </div>

                <div className="scoring-controls">
                    <div className="scoring-key">
                        <span className="key-box">←</span>
                        <span className="key-label incorrect">Needs Work</span>
                    </div>
                    <div className="scoring-key">
                        <span className="key-box">→</span>
                        <span className="key-label correct">Good Form</span>
                    </div>
                    <button
                        className="btn btn-secondary"
                        onClick={clearCanvas}
                        style={{ marginLeft: '1.5rem' }}
                    >
                        Clear
                    </button>
                </div>
            </div>
        );
    }

    // Setup screen
    return (
        <div className="setup-container">
            <div className="card">
                <div className="card-header">
                    <h2>Shape Analysis</h2>
                    <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                        Draw basic shapes
                    </p>
                </div>

                <div className="info-box">
                    <h4>📋 How it works</h4>
                    <ul>
                        <li>Draw each shape on the canvas</li>
                        <li>Proctor scores with arrow keys</li>
                        <li>→ for correct, ← for incorrect</li>
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
