import React from 'react';

/**
 * ProctorControls - Setup panel for the proctor before starting assessment
 */
export default function ProctorControls({
    caseMode,
    setCaseMode,
    shuffleEnabled,
    setShuffleEnabled,
    onStart,
    isAssessing
}) {
    if (isAssessing) {
        return null;
    }

    return (
        <div className="setup-container">
            <div className="card">
                <div className="card-header">
                    <h2>Letter Sounds Assessment</h2>
                </div>

                {/* Case Mode Toggle */}
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
                        <button
                            className={`toggle-btn ${caseMode === 'mixed' ? 'active' : ''}`}
                            onClick={() => setCaseMode('mixed')}
                        >
                            MixEd
                        </button>
                    </div>
                </div>

                {/* Shuffle Toggle */}
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

                {/* Keyboard Hints */}
                <div className="keyboard-hint">
                    <div className="key-hint">
                        <span className="key">←</span>
                        <span>Incorrect</span>
                    </div>
                    <div className="key-hint">
                        <span className="key">→</span>
                        <span>Correct</span>
                    </div>
                </div>

                {/* Start Button */}
                <div className="text-center mb-lg" style={{ marginTop: '2rem' }}>
                    <button className="btn btn-primary btn-large" onClick={onStart}>
                        Begin Assessment
                    </button>
                </div>
            </div>
        </div>
    );
}
