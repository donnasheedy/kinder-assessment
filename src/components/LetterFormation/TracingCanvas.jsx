import React from 'react';

/**
 * TracingCanvas - Canvas component for letter tracing
 * Displays a guide letter and allows freehand drawing over it
 */
export default function TracingCanvas({
    letter,
    canvasRef,
    onClear,
    strokeColor = '#4A90D9',
    strokeWidth = 8
}) {
    const containerRef = React.useRef(null);
    const isDrawing = React.useRef(false);
    const lastPos = React.useRef({ x: 0, y: 0 });

    // Initialize canvas
    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const container = containerRef.current;

        // Set canvas size
        const size = Math.min(container.clientWidth, 500);
        canvas.width = size;
        canvas.height = size;

        // Draw guide letter
        drawGuideLetter(ctx, letter, size);
    }, [letter, canvasRef]);

    const drawGuideLetter = (ctx, letter, size) => {
        ctx.clearRect(0, 0, size, size);

        // Background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);

        // Guide letter (light gray, dashed style)
        ctx.font = `bold ${size * 0.7}px 'Comic Sans MS', cursive`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#E2E8F0';
        ctx.fillText(letter, size / 2, size / 2);

        // Outline for tracing guidance
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.strokeText(letter, size / 2, size / 2);
        ctx.setLineDash([]);
    };

    const getPos = (e) => {
        const canvas = canvasRef.current;
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

    const startDrawing = (e) => {
        e.preventDefault();
        isDrawing.current = true;
        lastPos.current = getPos(e);
    };

    const draw = (e) => {
        if (!isDrawing.current) return;
        e.preventDefault();

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const pos = getPos(e);

        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        lastPos.current = pos;
    };

    const stopDrawing = () => {
        isDrawing.current = false;
    };

    const handleClear = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        drawGuideLetter(ctx, letter, canvas.width);
        if (onClear) onClear();
    };

    return (
        <div className="tracing-canvas-container" ref={containerRef}>
            <canvas
                ref={canvasRef}
                className="tracing-canvas"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />
            <button className="btn btn-outline clear-btn" onClick={handleClear}>
                Clear
            </button>
        </div>
    );
}
