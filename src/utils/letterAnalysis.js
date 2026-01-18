/**
 * Analyzes a student's letter tracing by comparing it to the ideal letter shape
 * Uses canvas pixel comparison to determine accuracy
 */

/**
 * Generate a reference image of the ideal letter
 * @param {string} letter - The letter to generate
 * @param {number} size - Canvas size
 * @returns {ImageData} - The reference letter as image data
 */
export function generateReferenceLetter(letter, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Fill with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Draw the letter as a thick stroke (the "target zone")
    ctx.font = `bold ${size * 0.7}px 'Comic Sans MS', cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Use a thick stroke to create the target zone
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = size * 0.08; // Tolerance zone width
    ctx.strokeText(letter, size / 2, size / 2);

    // Also fill to capture the center
    ctx.fillStyle = '#000000';
    ctx.fillText(letter, size / 2, size / 2);

    return ctx.getImageData(0, 0, size, size);
}

/**
 * Extract the drawn strokes from the tracing canvas
 * @param {HTMLCanvasElement} canvas - The student's canvas
 * @param {string} strokeColor - The color used for drawing (hex)
 * @returns {ImageData} - The drawn strokes as image data
 */
export function extractDrawnStrokes(canvas, strokeColor = '#4A90D9') {
    const ctx = canvas.getContext('2d');
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Analyze how well the student's strokes match the reference letter
 * @param {ImageData} reference - The ideal letter shape
 * @param {ImageData} drawn - What the student drew
 * @returns {Object} - Analysis results
 */
export function analyzeLetterAccuracy(reference, drawn) {
    const size = reference.width;
    const refData = reference.data;
    const drawnData = drawn.data;

    let targetPixels = 0;      // Pixels in the reference letter
    let coveredPixels = 0;     // Target pixels that were traced
    let outsideStrokes = 0;    // Strokes outside the target zone
    let totalDrawnPixels = 0;  // Total pixels drawn by student

    // Color detection thresholds
    const isBlack = (r, g, b) => r < 50 && g < 50 && b < 50;
    const isBlue = (r, g, b) => b > 150 && b > r && b > g;
    const isWhite = (r, g, b) => r > 240 && g > 240 && b > 240;
    const isGray = (r, g, b) => r > 180 && r < 250 && g > 180 && b > 180;

    for (let i = 0; i < refData.length; i += 4) {
        const refR = refData[i];
        const refG = refData[i + 1];
        const refB = refData[i + 2];

        const drawnR = drawnData[i];
        const drawnG = drawnData[i + 1];
        const drawnB = drawnData[i + 2];

        const isTargetPixel = isBlack(refR, refG, refB);
        const isDrawnPixel = isBlue(drawnR, drawnG, drawnB);

        if (isTargetPixel) {
            targetPixels++;
            if (isDrawnPixel) {
                coveredPixels++;
            }
        }

        if (isDrawnPixel) {
            totalDrawnPixels++;
            // Check if drawn outside the target zone and not on the gray guide
            if (!isTargetPixel && !isGray(refR, refG, refB)) {
                outsideStrokes++;
            }
        }
    }

    // Calculate metrics
    const coverage = targetPixels > 0 ? (coveredPixels / targetPixels) * 100 : 0;
    const precision = totalDrawnPixels > 0 ? ((totalDrawnPixels - outsideStrokes) / totalDrawnPixels) * 100 : 0;

    // Combined score (weighted average)
    const score = Math.round((coverage * 0.6 + precision * 0.4));

    // Determine grade
    let grade;
    if (score >= 85) grade = 'Excellent';
    else if (score >= 70) grade = 'Good';
    else if (score >= 50) grade = 'Needs Practice';
    else grade = 'Keep Trying';

    return {
        coverage: Math.round(coverage),
        precision: Math.round(precision),
        score,
        grade,
        targetPixels,
        coveredPixels,
        outsideStrokes,
        totalDrawnPixels
    };
}

/**
 * Get visual feedback on which areas need improvement
 * @param {ImageData} reference - The ideal letter
 * @param {ImageData} drawn - Student's drawing
 * @returns {Object} - Areas that need work (top, bottom, left, right quadrants)
 */
export function getWeakAreas(reference, drawn) {
    const size = reference.width;
    const halfSize = size / 2;

    const quadrants = {
        topLeft: { target: 0, covered: 0 },
        topRight: { target: 0, covered: 0 },
        bottomLeft: { target: 0, covered: 0 },
        bottomRight: { target: 0, covered: 0 }
    };

    const refData = reference.data;
    const drawnData = drawn.data;

    const isBlack = (r, g, b) => r < 50 && g < 50 && b < 50;
    const isBlue = (r, g, b) => b > 150 && b > r && b > g;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const i = (y * size + x) * 4;

            const refR = refData[i];
            const refG = refData[i + 1];
            const refB = refData[i + 2];

            const drawnR = drawnData[i];
            const drawnG = drawnData[i + 1];
            const drawnB = drawnData[i + 2];

            const isTarget = isBlack(refR, refG, refB);
            const isDrawn = isBlue(drawnR, drawnG, drawnB);

            if (isTarget) {
                const quadrant =
                    y < halfSize ? (x < halfSize ? 'topLeft' : 'topRight')
                        : (x < halfSize ? 'bottomLeft' : 'bottomRight');

                quadrants[quadrant].target++;
                if (isDrawn) {
                    quadrants[quadrant].covered++;
                }
            }
        }
    }

    // Calculate coverage for each quadrant
    const results = {};
    const weakAreas = [];

    for (const [name, data] of Object.entries(quadrants)) {
        const coverage = data.target > 0 ? (data.covered / data.target) * 100 : 100;
        results[name] = Math.round(coverage);

        if (coverage < 50 && data.target > 100) {
            weakAreas.push(name.replace(/([A-Z])/g, ' $1').toLowerCase().trim());
        }
    }

    return { quadrants: results, weakAreas };
}
