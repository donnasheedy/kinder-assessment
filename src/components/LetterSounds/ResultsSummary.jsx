import React from 'react';
import { summarizeResults } from '../../utils/letterUtils';

/**
 * ResultsSummary - Displays assessment results after completion
 */
export default function ResultsSummary({ results, onRestart, caseMode }) {
    const summary = summarizeResults(results);

    return (
        <div className="setup-container">
            <div className="card">
                <div className="card-header text-center">
                    <h2>Assessment Complete!</h2>
                    <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                        {caseMode === 'upper' ? 'Uppercase' : caseMode === 'lower' ? 'Lowercase' : 'Mixed Case'} Letters
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="stats-row">
                    <div className="stat-card correct">
                        <div className="stat-value">{summary.correctCount}</div>
                        <div className="stat-label">Correct</div>
                    </div>
                    <div className="stat-card incorrect">
                        <div className="stat-value">{summary.incorrectCount}</div>
                        <div className="stat-label">Needs Work</div>
                    </div>
                </div>

                {/* Score Percentage */}
                <div className="text-center mb-xl">
                    <span style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: summary.percentage >= 70 ? 'var(--correct)' : 'var(--incorrect)'
                    }}>
                        {summary.percentage}%
                    </span>
                </div>

                {/* Results Grid */}
                <h4 className="mb-md">Letter by Letter</h4>
                <div className="results-grid mb-xl">
                    {results.map((result, index) => (
                        <div
                            key={index}
                            className={`result-cell ${result.correct ? 'correct' : 'incorrect'}`}
                            title={`${result.display} - ${result.correct ? 'Correct' : 'Incorrect'}`}
                        >
                            {result.display}
                        </div>
                    ))}
                </div>

                {/* Missed Letters Summary */}
                {summary.incorrectCount > 0 && (
                    <div className="mb-xl">
                        <h4 className="mb-md">Letters Needing Practice</h4>
                        <p style={{
                            fontSize: '1.5rem',
                            fontFamily: 'var(--font-display)',
                            color: 'var(--incorrect)',
                            letterSpacing: '0.25em'
                        }}>
                            {summary.incorrectLetters.join('  ')}
                        </p>
                    </div>
                )}

                {/* Restart Button */}
                <div className="text-center">
                    <button className="btn btn-primary btn-large" onClick={onRestart}>
                        Start New Assessment
                    </button>
                </div>
            </div>
        </div>
    );
}
