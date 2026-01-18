import React, { useState, useEffect, useCallback } from 'react';
import StudentView from './StudentView';
import ProctorControls from './ProctorControls';
import ResultsSummary from './ResultsSummary';
import { generateLetterArray, shuffleArray } from '../../utils/letterUtils';

/**
 * LetterSounds - Main assessment component
 * Manages state, keyboard input, and view transitions
 */
export default function LetterSounds() {
    // Setup state
    const [caseMode, setCaseMode] = useState('upper'); // 'upper' | 'lower' | 'mixed'
    const [shuffleEnabled, setShuffleEnabled] = useState(false);

    // Assessment state
    const [isAssessing, setIsAssessing] = useState(false);
    const [letters, setLetters] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [results, setResults] = useState([]);
    const [isComplete, setIsComplete] = useState(false);

    /**
     * Start the assessment
     */
    const handleStart = useCallback(() => {
        let letterArray = generateLetterArray(caseMode);

        if (shuffleEnabled) {
            letterArray = shuffleArray(letterArray);
        }

        setLetters(letterArray);
        setCurrentIndex(0);
        setResults([]);
        setIsComplete(false);
        setIsAssessing(true);
    }, [caseMode, shuffleEnabled]);

    /**
     * Record result and advance to next letter
     */
    const recordResult = useCallback((isCorrect) => {
        if (!isAssessing || isComplete || currentIndex >= letters.length) return;

        const currentLetter = letters[currentIndex];
        const result = {
            letter: currentLetter.letter,
            display: currentLetter.display,
            displayCase: currentLetter.displayCase,
            correct: isCorrect,
            index: currentIndex
        };

        setResults(prev => [...prev, result]);

        // Check if this was the last letter
        if (currentIndex === letters.length - 1) {
            setIsComplete(true);
        } else {
            setCurrentIndex(prev => prev + 1);
        }
    }, [isAssessing, isComplete, currentIndex, letters]);

    /**
     * Reset to setup screen
     */
    const handleRestart = useCallback(() => {
        setIsAssessing(false);
        setLetters([]);
        setCurrentIndex(0);
        setResults([]);
        setIsComplete(false);
    }, []);

    /**
     * Keyboard event handler
     */
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isAssessing || isComplete) return;

            switch (e.key) {
                case 'ArrowRight':
                    e.preventDefault();
                    recordResult(true); // Correct
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    recordResult(false); // Incorrect
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isAssessing, isComplete, recordResult]);

    // Determine current view
    if (isComplete) {
        return (
            <ResultsSummary
                results={results}
                onRestart={handleRestart}
                caseMode={caseMode}
            />
        );
    }

    if (isAssessing) {
        return (
            <StudentView
                letter={letters[currentIndex]?.display || ''}
                isComplete={isComplete}
            />
        );
    }

    return (
        <ProctorControls
            caseMode={caseMode}
            setCaseMode={setCaseMode}
            shuffleEnabled={shuffleEnabled}
            setShuffleEnabled={setShuffleEnabled}
            onStart={handleStart}
            isAssessing={isAssessing}
        />
    );
}
