import { useRef, useEffect } from 'react';

const useCanvas = (
    draw: (context: CanvasRenderingContext2D) => void, 
    lineWidth: number, 
    cameraPosition: {X: number, Y: number},
    drawStory: (context: CanvasRenderingContext2D) => void,
    color: string
    ) => {

    const canvasRef = useRef(null);
    const cameraPos = useRef(cameraPosition);

    useEffect(() => {

        const canvas = canvasRef.current;
        const context: CanvasRenderingContext2D = canvas.getContext("2d");
        context.fillStyle = color;
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        let animationFrameId: number;

        if(cameraPos.current != cameraPosition ) {
            cameraPos.current = cameraPosition;
            context.clearRect(0, 0, window.innerWidth, window.innerHeight);
            console.log("different");

            const render = () => {
                drawStory(context);
                animationFrameId = window.requestAnimationFrame(render);
            }
            render();
    
            return () => {
                window.cancelAnimationFrame(animationFrameId);
            }
        }


        const render = () => {
            draw(context);
            animationFrameId = window.requestAnimationFrame(render);
        }
        render();

        return () => {
            window.cancelAnimationFrame(animationFrameId);
        }
    }, [draw, cameraPos, cameraPosition, drawStory, lineWidth, color]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context.canvas.height = window.innerHeight;
        context.canvas.width = window.innerWidth;
        context.lineWidth = lineWidth;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return canvasRef;
}

export default useCanvas;