import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * NumberAnalysis - 21-box grid for number writing (0-20) with kindergarten paper lines
 * Auto-analyzes handwriting quality for numbers
 */
export default function NumberAnalysis() {
    const [isAssessing, setIsAssessing] = useState(false);
    const [numbers, setNumbers] = useState([]);
    const [numberStrokes, setNumberStrokes] = useState({});
    const [numberScores, setNumberScores] = useState({});
    const [isComplete, setIsComplete] = useState(false);
    const [activeBox, setActiveBox] = useState(null);

    const canvasRefs = useRef({});
    const isDrawing = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });
    const currentStrokes = useRef([]);

    // Line positions (percentage of box height)
    const LINE_POSITIONS = {
        topLine: 0.15,
        midLine: 0.5,
        baseLine: 0.85
    };

    const BOX_SIZE = 80;

    // Generate numbers 0-20
    const generateNumberArray = () => {
        return Array.from({ length: 21 }, (_, i) => ({
            value: i,
            display: String(i)
        }));
    };

    useEffect(() => {
        if (isAssessing) {
            // Initialize all canvases
            numbers.forEach((num, index) => {
                const canvas = canvasRefs.current[index];
                if (canvas) {
                    canvas.width = BOX_SIZE;
                    canvas.height = BOX_SIZE;
                    drawPaperLines(canvas);
                }
            });
        }
    }, [isAssessing, numbers]);

    const drawPaperLines = (canvas) => {
        const ctx = canvas.getContext('2d');
        const size = BOX_SIZE;

        ctx.clearRect(0, 0, size, size);

        // Cream background
        ctx.fillStyle = '#FFFEF5';
        ctx.fillRect(0, 0, size, size);

        // Blue top line
        ctx.strokeStyle = '#4A90D9';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, size * LINE_POSITIONS.topLine);
        ctx.lineTo(size, size * LINE_POSITIONS.topLine);
        ctx.stroke();

        // Dotted blue midline
        ctx.strokeStyle = '#7AB5F0';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(0, size * LINE_POSITIONS.midLine);
        ctx.lineTo(size, size * LINE_POSITIONS.midLine);
        ctx.stroke();
        ctx.setLineDash([]);

        // Red baseline
        ctx.strokeStyle = '#E57373';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, size * LINE_POSITIONS.baseLine);
        ctx.lineTo(size, size * LINE_POSITIONS.baseLine);
        ctx.stroke();
    };

    const handleStart = () => {
        const numberArray = generateNumberArray();
        setNumbers(numberArray);
        setNumberStrokes({});
        setNumberScores({});
        setIsComplete(false);
        setIsAssessing(true);
    };

    const getPos = (e, canvas) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        if (e.touches) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY
            };
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const startDrawing = (e, index) => {
        e.preventDefault();
        const canvas = canvasRefs.current[index];
        if (!canvas) return;

        isDrawing.current = true;
        setActiveBox(index);
        const pos = getPos(e, canvas);
        lastPos.current = pos;
        currentStrokes.current = [[pos]];
    };

    const draw = (e, index) => {
        if (!isDrawing.current || activeBox !== index) return;
        e.preventDefault();

        const canvas = canvasRefs.current[index];
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const pos = getPos(e, canvas);

        // Add to current stroke
        if (currentStrokes.current.length > 0) {
            currentStrokes.current[currentStrokes.current.length - 1].push(pos);
        }

        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        lastPos.current = pos;
    };

    const stopDrawing = (index) => {
        if (!isDrawing.current) return;
        isDrawing.current = false;

        // Save strokes for this number
        if (currentStrokes.current.length > 0 && currentStrokes.current[0].length > 0) {
            setNumberStrokes(prev => ({
                ...prev,
                [index]: [...(prev[index] || []), ...currentStrokes.current]
            }));
        }
        currentStrokes.current = [];
    };

    const clearBox = (index) => {
        const canvas = canvasRefs.current[index];
        if (canvas) {
            drawPaperLines(canvas);
            setNumberStrokes(prev => {
                const updated = { ...prev };
                delete updated[index];
                return updated;
            });
            setNumberScores(prev => {
                const updated = { ...prev };
                delete updated[index];
                return updated;
            });
        }
    };

    const analyzeAll = () => {
        const scores = {};

        numbers.forEach((num, index) => {
            const strokes = numberStrokes[index] || [];
            scores[index] = analyzeHandwriting(strokes, BOX_SIZE, num.display);
        });

        setNumberScores(scores);
        setIsComplete(true);
    };

    const analyzeHandwriting = (strokeData, height, number) => {
        if (!strokeData || strokeData.length === 0) {
            return { score: 0, grade: 'Not Written', feedback: 'Number not written' };
        }

        const allPoints = strokeData.flat();
        if (allPoints.length < 5) {
            return { score: 20, grade: 'Keep Trying', feedback: 'Try writing the complete number' };
        }

        const yValues = allPoints.map(p => p.y);
        const minY = Math.min(...yValues);
        const maxY = Math.max(...yValues);

        const topLine = height * LINE_POSITIONS.topLine;
        const baseLine = height * LINE_POSITIONS.baseLine;
        const tolerance = height * 0.20;

        // All numbers should be tall (top to baseline)
        const expectedTopLine = topLine;

        // Score calculations
        const baselineDistance = Math.abs(maxY - baseLine);
        const baselineScore = baselineDistance <= tolerance
            ? 100 - (baselineDistance / tolerance) * 30
            : Math.max(30, 70 - (baselineDistance / height) * 100);

        const topDistance = Math.abs(minY - expectedTopLine);
        const topScore = topDistance <= tolerance
            ? 100 - (topDistance / tolerance) * 30
            : Math.max(30, 70 - (topDistance / height) * 100);

        const expectedHeight = baseLine - expectedTopLine;
        const actualHeight = maxY - minY;
        const heightRatio = expectedHeight > 0 ? actualHeight / expectedHeight : 0;
        const heightScore = heightRatio >= 0.5 && heightRatio <= 1.5
            ? 100 - Math.abs(1 - heightRatio) * 60
            : Math.max(20, 50 - Math.abs(1 - heightRatio) * 30);

        const score = Math.round(Math.max(0, Math.min(100,
            baselineScore * 0.35 + topScore * 0.35 + heightScore * 0.30
        )));

        let grade;
        if (score >= 85) grade = 'Excellent';
        else if (score >= 70) grade = 'Good';
        else if (score >= 50) grade = 'Needs Practice';
        else grade = 'Keep Trying';

        return { score, grade };
    };

    const handleRestart = () => {
        setIsAssessing(false);
        setNumbers([]);
        setNumberStrokes({});
        setNumberScores({});
        setIsComplete(false);
    };

    // Results screen
    if (isComplete) {
        const writtenNumbers = Object.keys(numberScores).filter(k => numberScores[k].score > 0);
        const avgScore = writtenNumbers.length > 0
            ? Math.round(writtenNumbers.reduce((sum, k) => sum + numberScores[k].score, 0) / writtenNumbers.length)
            : 0;
        const needsPractice = numbers
            .map((n, i) => ({ ...n, index: i, score: numberScores[i]?.score || 0 }))
            .filter(n => n.score < 70 && n.score > 0)
            .sort((a, b) => a.score - b.score);

        return (
            <div className="setup-container" style={{ maxWidth: '800px' }}>
                <div className="card">
                    <div className="card-header text-center">
                        <h2>Analysis Complete!</h2>
                        <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                            {writtenNumbers.length} of 21 numbers written
                        </p>
                    </div>

                    <div className="stats-row">
                        <div className="stat-card correct">
                            <div className="stat-value">{avgScore}%</div>
                            <div className="stat-label">Average Score</div>
                        </div>
                        <div className="stat-card incorrect">
                            <div className="stat-value">{needsPractice.length}</div>
                            <div className="stat-label">Need Practice</div>
                        </div>
                    </div>

                    {needsPractice.length > 0 && (
                        <div className="mb-xl">
                            <h4 className="mb-md">🎯 Focus Areas</h4>
                            <div className="results-grid">
                                {needsPractice.slice(0, 10).map((result) => (
                                    <div key={result.index} className="result-cell incorrect">
                                        <div style={{ fontFamily: "'Kalam', cursive" }}>{result.display}</div>
                                        <small style={{ fontSize: '0.7rem', opacity: 0.9 }}>{result.score}%</small>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <h4 className="mb-md">All Numbers</h4>
                    <div className="results-grid mb-xl">
                        {numbers.map((num, index) => {
                            const score = numberScores[index]?.score || 0;
                            return (
                                <div
                                    key={index}
                                    className={`result-cell ${score === 0 ? '' : score >= 70 ? 'correct' : 'incorrect'}`}
                                    style={{
                                        fontFamily: "'Kalam', cursive",
                                        opacity: score === 0 ? 0.4 : 1
                                    }}
                                    title={`${num.display}: ${score}%`}
                                >
                                    {num.display}
                                </div>
                            );
                        })}
                    </div>

                    <div className="text-center">
                        <button className="btn btn-primary btn-large" onClick={handleRestart}>
                            Start New Assessment
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Writing grid view
    if (isAssessing) {
        return (
            <div className="letter-grid-view">
                <div className="grid-header">
                    <h2>Write Numbers 0-20</h2>
                    <p>Write each number in its box. Numbers should sit on the red line.</p>
                </div>

                <div className="letter-boxes-grid">
                    {numbers.map((num, index) => (
                        <div key={index} className="letter-box-wrapper">
                            <div className="letter-label">{num.display}</div>
                            <canvas
                                ref={el => canvasRefs.current[index] = el}
                                className={`letter-box-canvas ${activeBox === index ? 'active' : ''}`}
                                onMouseDown={(e) => startDrawing(e, index)}
                                onMouseMove={(e) => draw(e, index)}
                                onMouseUp={() => stopDrawing(index)}
                                onMouseLeave={() => stopDrawing(index)}
                                onTouchStart={(e) => startDrawing(e, index)}
                                onTouchMove={(e) => draw(e, index)}
                                onTouchEnd={() => stopDrawing(index)}
                            />
                            <button
                                className="box-clear-btn"
                                onClick={() => clearBox(index)}
                                title="Clear this number"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>

                <div className="line-legend">
                    <span><span style={{ color: '#4A90D9' }}>—</span> Top Line</span>
                    <span><span style={{ color: '#7AB5F0' }}>- - -</span> Middle</span>
                    <span><span style={{ color: '#E57373' }}>—</span> Base Line</span>
                </div>

                <div className="grid-actions">
                    <button className="btn btn-outline" onClick={handleRestart}>
                        Cancel
                    </button>
                    <button className="btn btn-accent btn-large" onClick={analyzeAll}>
                        ✨ Analyze All Numbers
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
                    <h2>Number Analysis</h2>
                    <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                        Write numbers 0-20 on kindergarten paper
                    </p>
                </div>

                <div className="info-box">
                    <h4>✏️ How it works</h4>
                    <ul>
                        <li>Write each number in its own box</li>
                        <li>Use the guide lines for proper size</li>
                        <li>Click "Analyze" to see which numbers need practice</li>
                    </ul>
                </div>

                <div className="text-center mb-lg" style={{ marginTop: '2rem' }}>
                    <button className="btn btn-accent btn-large" onClick={handleStart}>
                        Start Writing
                    </button>
                </div>
            </div>
        </div>
    );
}
