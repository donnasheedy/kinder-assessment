import React from 'react';

/**
 * StudentView - Clean display component showing only the letter stimulus
 * No buttons, scores, or progress indicators visible to the student
 */
export default function StudentView({ letter, isComplete }) {
    if (isComplete) {
        return null;
    }

    return (
        <div className="student-view">
            <span className="letter-display" key={letter}>
                {letter}
            </span>
        </div>
    );
}
