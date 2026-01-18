import React, { useState, useEffect, useRef, useCallback } from 'react';
import { generateLetterArray } from '../../utils/letterUtils';

/**
 * LetterAnalysis - 26-box grid for letter writing with kindergarten paper lines
 * No silhouettes - just guide lines for proper letter formation
 */
export default function LetterAnalysis() {
    const [caseMode, setCaseMode] = useState('upper');
    const [isAssessing, setIsAssessing] = useState(false);
    const [letters, setLetters] = useState([]);
    const [letterStrokes, setLetterStrokes] = useState({});
    const [letterScores, setLetterScores] = useState({});
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

    useEffect(() => {
        if (isAssessing) {
            // Initialize all canvases
            letters.forEach((letter, index) => {
                const canvas = canvasRefs.current[index];
                if (canvas) {
                    canvas.width = BOX_SIZE;
                    canvas.height = BOX_SIZE;
                    drawPaperLines(canvas);
                }
            });
        }
    }, [isAssessing, letters]);

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
        const letterArray = generateLetterArray(caseMode);
        setLetters(letterArray);
        setLetterStrokes({});
        setLetterScores({});
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

        // Save strokes for this letter
        if (currentStrokes.current.length > 0 && currentStrokes.current[0].length > 0) {
            setLetterStrokes(prev => ({
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
            setLetterStrokes(prev => {
                const updated = { ...prev };
                delete updated[index];
                return updated;
            });
            setLetterScores(prev => {
                const updated = { ...prev };
                delete updated[index];
                return updated;
            });
        }
    };

    const analyzeAll = () => {
        const scores = {};

        letters.forEach((letter, index) => {
            const strokes = letterStrokes[index] || [];
            scores[index] = analyzeHandwriting(strokes, BOX_SIZE, letter.display);
        });

        setLetterScores(scores);
        setIsComplete(true);
    };

    const analyzeHandwriting = (strokeData, height, letter) => {
        if (!strokeData || strokeData.length === 0) {
            return { score: 0, grade: 'Not Written', feedback: 'Letter not written' };
        }

        const allPoints = strokeData.flat();
        if (allPoints.length < 5) {
            return { score: 20, grade: 'Keep Trying', feedback: 'Try writing the complete letter' };
        }

        const yValues = allPoints.map(p => p.y);
        const minY = Math.min(...yValues);
        const maxY = Math.max(...yValues);

        const topLine = height * LINE_POSITIONS.topLine;
        const midLine = height * LINE_POSITIONS.midLine;
        const baseLine = height * LINE_POSITIONS.baseLine;
        const tolerance = height * 0.20;

        // Determine if tall letter
        const tallLetters = ['b', 'd', 'f', 'h', 'k', 'l', 't', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        const isTallLetter = tallLetters.includes(letter);
        const expectedTopLine = isTallLetter ? topLine : midLine;

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
        setLetters([]);
        setLetterStrokes({});
        setLetterScores({});
        setIsComplete(false);
    };

    // Results screen
    if (isComplete) {
        const writtenLetters = Object.keys(letterScores).filter(k => letterScores[k].score > 0);
        const avgScore = writtenLetters.length > 0
            ? Math.round(writtenLetters.reduce((sum, k) => sum + letterScores[k].score, 0) / writtenLetters.length)
            : 0;
        const needsPractice = letters
            .map((l, i) => ({ ...l, index: i, score: letterScores[i]?.score || 0 }))
            .filter(l => l.score < 70 && l.score > 0)
            .sort((a, b) => a.score - b.score);

        return (
            <div className="setup-container" style={{ maxWidth: '800px' }}>
                <div className="card">
                    <div className="card-header text-center">
                        <h2>Analysis Complete!</h2>
                        <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                            {writtenLetters.length} of 26 letters written
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

                    <h4 className="mb-md">All Letters</h4>
                    <div className="results-grid mb-xl">
                        {letters.map((letter, index) => {
                            const score = letterScores[index]?.score || 0;
                            return (
                                <div
                                    key={index}
                                    className={`result-cell ${score === 0 ? '' : score >= 70 ? 'correct' : 'incorrect'}`}
                                    style={{
                                        fontFamily: "'Kalam', cursive",
                                        opacity: score === 0 ? 0.4 : 1
                                    }}
                                    title={`${letter.display}: ${score}%`}
                                >
                                    {letter.display}
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
                    <h2>Write the Alphabet</h2>
                    <p>Write each letter in its box. Letters should sit on the red line.</p>
                </div>

                <div className="letter-boxes-grid">
                    {letters.map((letter, index) => (
                        <div key={index} className="letter-box-wrapper">
                            <div className="letter-label">{letter.display}</div>
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
                                title="Clear this letter"
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
                        ✨ Analyze All Letters
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
                    <h2>Letter Analysis</h2>
                    <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                        Write all 26 letters on kindergarten paper
                    </p>
                </div>

                <div className="setup-section">
                    <label className="setup-label">Letter Case</label>
                    <div className="toggle-group">
                        <button
                            className={`toggle-btn ${caseMode === 'upper' ? 'active' : ''}`}
                            onClick={() => setCaseMode('upper')}
                        >
                            UPPERCASE
                        </button>
                        <button
                            className={`toggle-btn ${caseMode === 'lower' ? 'active' : ''}`}
                            onClick={() => setCaseMode('lower')}
                        >
                            lowercase
                        </button>
                    </div>
                </div>

                <div className="info-box">
                    <h4>✏️ How it works</h4>
                    <ul>
                        <li>Write each letter in its own box</li>
                        <li>Use the guide lines for proper size</li>
                        <li>Click "Analyze" to see which letters need practice</li>
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
