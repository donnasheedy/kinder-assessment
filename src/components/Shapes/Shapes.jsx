import React, { useState, useCallback, useMemo } from 'react';

/**
 * Shapes - Shape identification and description assessment
 * Part 1: 2D Shapes (square, circle, triangle, rectangle, hexagon)
 * Part 2: 3D Shapes (cube, cone, cylinder, sphere)
 * Part 3: Analyze & Compare shapes
 */
export default function Shapes() {
    const [selectedPart, setSelectedPart] = useState(1);
    const [isAssessing, setIsAssessing] = useState(false);
    const [problems, setProblems] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [results, setResults] = useState([]);
    const [isComplete, setIsComplete] = useState(false);

    const PARTS = [
        { num: 1, label: 'Part 1: 2D Shapes', desc: 'Identify flat shapes' },
        { num: 2, label: 'Part 2: 3D Shapes', desc: 'Identify solid shapes' },
        { num: 3, label: 'Part 3: Compare', desc: 'Compare and analyze shapes' }
    ];

    const SHAPES_2D = useMemo(() => [
        { name: 'Circle', svg: <circle cx="50" cy="50" r="40" fill="#4A90E2" />, sides: 0 },
        { name: 'Triangle', svg: <polygon points="50,10 90,90 10,90" fill="#50C878" />, sides: 3 },
        { name: 'Square', svg: <rect x="15" y="15" width="70" height="70" fill="#FF6B6B" />, sides: 4 },
        { name: 'Rectangle', svg: <rect x="10" y="25" width="80" height="50" fill="#FFB347" />, sides: 4 },
        { name: 'Hexagon', svg: <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="#9B59B6" />, sides: 6 }
    ], []);

    const SHAPES_3D = useMemo(() => [
        { name: 'Sphere', emoji: '🔵', desc: 'round like a ball' },
        { name: 'Cube', emoji: '🧊', desc: '6 square faces' },
        { name: 'Cone', emoji: '🎉', desc: 'point at top, circle at bottom' },
        { name: 'Cylinder', emoji: '🥫', desc: 'circles on top and bottom' }
    ], []);

    const currentPart = PARTS[selectedPart - 1];

    // Generate problems based on selected part
    const generateProblems = useCallback(() => {
        const probs = [];

        if (selectedPart === 1) {
            // Part 1: Identify 2D shapes - show shape, pick name
            const shuffled = [...SHAPES_2D].sort(() => Math.random() - 0.5);
            for (const shape of shuffled) {
                const otherNames = SHAPES_2D.filter(s => s.name !== shape.name)
                    .map(s => s.name)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 2);
                const choices = [shape.name, ...otherNames].sort(() => Math.random() - 0.5);

                probs.push({
                    type: 'identify-2d',
                    shape,
                    answer: shape.name,
                    choices
                });
            }
        } else if (selectedPart === 2) {
            // Part 2: Identify 3D shapes - show emoji/description, pick name
            const shuffled = [...SHAPES_3D].sort(() => Math.random() - 0.5);
            for (const shape of shuffled) {
                const otherNames = SHAPES_3D.filter(s => s.name !== shape.name)
                    .map(s => s.name)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 2);
                const choices = [shape.name, ...otherNames].sort(() => Math.random() - 0.5);

                probs.push({
                    type: 'identify-3d',
                    shape,
                    answer: shape.name,
                    choices
                });
            }
        } else {
            // Part 3: Compare shapes - which has more/less sides, same shape different size
            const comparisons = [
                { q: 'Which shape has MORE sides?', a: 'Hexagon', b: 'Triangle', answer: 'Hexagon' },
                { q: 'Which shape has FEWER sides?', a: 'Square', b: 'Hexagon', answer: 'Square' },
                { q: 'Which shape has NO corners?', a: 'Circle', b: 'Square', answer: 'Circle' },
                { q: 'Which shape has 4 equal sides?', a: 'Square', b: 'Rectangle', answer: 'Square' },
                { q: 'Which shape is round?', a: 'Triangle', b: 'Circle', answer: 'Circle' },
                { q: 'Which shape has 3 sides?', a: 'Triangle', b: 'Rectangle', answer: 'Triangle' }
            ];

            for (const comp of comparisons.sort(() => Math.random() - 0.5)) {
                const shapeA = SHAPES_2D.find(s => s.name === comp.a);
                const shapeB = SHAPES_2D.find(s => s.name === comp.b);
                probs.push({
                    type: 'compare',
                    question: comp.q,
                    shapeA,
                    shapeB,
                    answer: comp.answer,
                    choices: [comp.a, comp.b]
                });
            }
        }

        return probs;
    }, [selectedPart, SHAPES_2D, SHAPES_3D]);

    const handleStart = useCallback(() => {
        const probs = generateProblems();
        setProblems(probs);
        setCurrentIndex(0);
        setResults([]);
        setIsComplete(false);
        setIsAssessing(true);
    }, [generateProblems]);

    const handleAnswer = useCallback((selectedAnswer) => {
        const problem = problems[currentIndex];
        const isCorrect = selectedAnswer === problem.answer;

        setResults(prev => [...prev, {
            ...problem,
            selected: selectedAnswer,
            correct: isCorrect
        }]);

        if (currentIndex >= problems.length - 1) {
            setIsComplete(true);
        } else {
            setCurrentIndex(prev => prev + 1);
        }
    }, [problems, currentIndex]);

    const handleRestart = useCallback(() => {
        setIsAssessing(false);
        setProblems([]);
        setCurrentIndex(0);
        setResults([]);
        setIsComplete(false);
    }, []);

    // Render SVG shape
    const renderShape = (shape, size = 100) => (
        <svg width={size} height={size} viewBox="0 0 100 100">
            {shape.svg}
        </svg>
    );

    // Results screen
    if (isComplete) {
        const correctCount = results.filter(r => r.correct).length;
        const percentage = Math.round((correctCount / results.length) * 100);

        return (
            <div className="setup-container" style={{ maxWidth: '700px' }}>
                <div className="card">
                    <div className="card-header text-center">
                        <h2>Shapes Complete!</h2>
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
                            <span className="stat-value">{results.length - correctCount}</span>
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
        const problem = problems[currentIndex];

        return (
            <div className="sight-words-assessment">
                <div className="sight-words-header">
                    <span className="level-label">Shapes - {currentPart.label}</span>
                    <span className="progress-indicator">{currentIndex + 1} / {problems.length}</span>
                </div>

                {problem.type === 'identify-2d' && (
                    <>
                        <p className="quantity-prompt">What shape is this?</p>
                        <div className="shape-display">
                            {renderShape(problem.shape, 150)}
                        </div>
                        <div className="shape-choices">
                            {problem.choices.map((choice, idx) => (
                                <button
                                    key={idx}
                                    className="shape-choice-btn"
                                    onClick={() => handleAnswer(choice)}
                                >
                                    {choice}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {problem.type === 'identify-3d' && (
                    <>
                        <p className="quantity-prompt">What 3D shape is this?</p>
                        <div className="shape-display">
                            <span className="shape-3d-emoji">{problem.shape.emoji}</span>
                            <p className="shape-hint">{problem.shape.desc}</p>
                        </div>
                        <div className="shape-choices">
                            {problem.choices.map((choice, idx) => (
                                <button
                                    key={idx}
                                    className="shape-choice-btn"
                                    onClick={() => handleAnswer(choice)}
                                >
                                    {choice}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {problem.type === 'compare' && (
                    <>
                        <p className="quantity-prompt">{problem.question}</p>
                        <div className="compare-clickable">
                            <button
                                className="shape-compare-btn"
                                onClick={() => handleAnswer(problem.shapeA.name)}
                            >
                                {renderShape(problem.shapeA, 120)}
                                <span className="shape-name">{problem.shapeA.name}</span>
                            </button>
                            <span className="compare-or">or</span>
                            <button
                                className="shape-compare-btn"
                                onClick={() => handleAnswer(problem.shapeB.name)}
                            >
                                {renderShape(problem.shapeB, 120)}
                                <span className="shape-name">{problem.shapeB.name}</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Setup screen
    return (
        <div className="setup-container">
            <div className="card">
                <div className="card-header">
                    <h2>Shapes</h2>
                    <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                        Identify and compare shapes
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
                        <li>{currentPart.desc}</li>
                        <li>Click the correct answer</li>
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
