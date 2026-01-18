import React, { useState, useCallback, useRef, useEffect } from 'react';

/**
 * ShapeFormation - Shape tracing practice with silhouette guides
 * Students trace over shape outlines, navigate with Next/Back buttons
 */
export default function ShapeFormation() {
    const [isAssessing, setIsAssessing] = useState(false);
    const [shapes, setShapes] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const canvasRef = useRef(null);
    const isDrawingRef = useRef(false);

    const SHAPES = [
        {
            name: 'Circle', draw: (ctx, w, h) => {
                ctx.beginPath();
                ctx.arc(w / 2, h / 2, 120, 0, Math.PI * 2);
                ctx.stroke();
            }
        },
        {
            name: 'Square', draw: (ctx, w, h) => {
                const size = 200;
                ctx.strokeRect((w - size) / 2, (h - size) / 2, size, size);
            }
        },
        {
            name: 'Triangle', draw: (ctx, w, h) => {
                ctx.beginPath();
                ctx.moveTo(w / 2, h / 2 - 100);
                ctx.lineTo(w / 2 + 120, h / 2 + 100);
                ctx.lineTo(w / 2 - 120, h / 2 + 100);
                ctx.closePath();
                ctx.stroke();
            }
        },
        {
            name: 'Rectangle', draw: (ctx, w, h) => {
                ctx.strokeRect((w - 240) / 2, (h - 140) / 2, 240, 140);
            }
        },
        {
            name: 'Hexagon', draw: (ctx, w, h) => {
                const cx = w / 2, cy = h / 2, r = 100;
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (i * Math.PI / 3) - Math.PI / 2;
                    const x = cx + r * Math.cos(angle);
                    const y = cy + r * Math.sin(angle);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.stroke();
            }
        }
    ];

    const handleStart = useCallback(() => {
        setShapes([...SHAPES]);
        setCurrentIndex(0);
        setIsAssessing(true);
    }, []);

    const handleBack = useCallback(() => {
        setIsAssessing(false);
        setShapes([]);
        setCurrentIndex(0);
    }, []);

    const handleNext = useCallback(() => {
        if (currentIndex < shapes.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    }, [currentIndex, shapes.length]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    }, [currentIndex]);

    // Draw the shape silhouette
    const drawSilhouette = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !shapes[currentIndex]) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the outline in light gray dashed lines
        ctx.strokeStyle = '#D0D0D0';
        ctx.lineWidth = 8;
        ctx.setLineDash([15, 10]);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        shapes[currentIndex].draw(ctx, canvas.width, canvas.height);

        // Reset for user drawing
        ctx.setLineDash([]);
    }, [shapes, currentIndex]);

    // Drawing functionality
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !isAssessing) return;

        drawSilhouette();

        const ctx = canvas.getContext('2d');

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
            ctx.strokeStyle = '#4A90E2';
            ctx.lineWidth = 4;
            ctx.setLineDash([]);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
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
    }, [isAssessing, currentIndex, drawSilhouette]);

    // Redraw silhouette when changing shapes
    useEffect(() => {
        if (isAssessing) {
            drawSilhouette();
        }
    }, [currentIndex, isAssessing, drawSilhouette]);

    // Clear and redraw
    const clearCanvas = useCallback(() => {
        drawSilhouette();
    }, [drawSilhouette]);

    // Practice view
    if (isAssessing && shapes.length > 0) {
        const currentShape = shapes[currentIndex];
        const isFirst = currentIndex === 0;
        const isLast = currentIndex === shapes.length - 1;

        return (
            <div className="sight-words-assessment">
                <div className="sight-words-header">
                    <span className="level-label">Shape Formation</span>
                    <span className="progress-indicator">{currentIndex + 1} / {shapes.length}</span>
                </div>

                <p className="quantity-prompt">Trace the {currentShape.name}</p>

                <div className="tracing-area">
                    <canvas
                        ref={canvasRef}
                        width={400}
                        height={400}
                        className="tracing-canvas"
                    />
                </div>

                <div className="practice-controls">
                    <button
                        className="btn btn-secondary"
                        onClick={handlePrev}
                        disabled={isFirst}
                    >
                        ← Back
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={clearCanvas}
                    >
                        Clear
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
                    <h2>Shape Formation</h2>
                    <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                        Trace shape silhouettes
                    </p>
                </div>

                <div className="info-box">
                    <h4>📋 How it works</h4>
                    <ul>
                        <li>Trace over the dashed shape outline</li>
                        <li>Use Next and Back to navigate</li>
                        <li>Practice as many times as you want</li>
                    </ul>
                </div>

                <div className="text-center" style={{ marginTop: '2rem' }}>
                    <button className="btn btn-primary btn-large" onClick={handleStart}>
                        Start Practice
                    </button>
                </div>
            </div>
        </div>
    );
}
