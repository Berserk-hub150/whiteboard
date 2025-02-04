import { whiteBoard } from '@/drawings/drawings';
import { useRef, useEffect } from 'react';

const useCanvas = (
    draw: (context: CanvasRenderingContext2D) => void, 
    lineWidth: number, 
    cameraPosition: {X: number, Y: number},
    drawStory: (context: CanvasRenderingContext2D) => void,
    wb: whiteBoard
    ) => {

    const canvasRef = useRef(null);
    const cameraPos = useRef(cameraPosition);
    const scalePrev = useRef(wb.scale)
    const bgColorPrev = useRef(wb.bgColor);

    useEffect(() => {
        if(canvasRef.current == null)
            return;
        const canvas: HTMLCanvasElement = canvasRef.current;
        const context: CanvasRenderingContext2D | null = canvas.getContext("2d");
        if(context == null)
            return;
        context.fillStyle = wb.color;
        context.strokeStyle = wb.color;
        context.lineWidth = lineWidth;
        let animationFrameId: number;

        if(cameraPos.current != cameraPosition || scalePrev.current != wb.scale || bgColorPrev.current != wb.bgColor) {
            if(scalePrev.current != wb.scale) {
                if(scalePrev.current < wb.scale)
                    context.scale(1.25, 1.25)
                else 
                    context.scale(0.8, 0.8)
                scalePrev.current = wb.scale
                console.log("different scale");
            }
            cameraPos.current = cameraPosition;
            bgColorPrev.current = wb.bgColor
            context.clearRect(0, 0, window.innerWidth * 1 / wb.scale, window.innerHeight * 1 / wb.scale);
            context.fillStyle = wb.bgColor;
            context.fillRect(0, 0, context.canvas.width * 1 / wb.scale, context.canvas.height * 1 / wb.scale);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draw, cameraPos, cameraPosition, drawStory, lineWidth, wb.color, wb.scale]);

    useEffect(() => {
        if(!wb.save)
            return;

        if(canvasRef.current == null)
            return;
        const canvas: HTMLCanvasElement = canvasRef.current;
        const context: CanvasRenderingContext2D | null = canvas.getContext("2d");
        if(context == null)
            return;

        const data = canvas.toDataURL();

        wb.updater(wb.newSave(false))
        window.open(data, "Frame")

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wb.save])

    useEffect(() => {
        if(canvasRef.current == null)
            return;
        const canvas: HTMLCanvasElement = canvasRef.current;
        const context: CanvasRenderingContext2D | null = canvas.getContext("2d");
        if(context == null)
            return;
        context.canvas.height = window.innerHeight;
        context.canvas.width = window.innerWidth;
        context.lineWidth = lineWidth;
        context.fillStyle = wb.bgColor;
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return canvasRef;
}

export default useCanvas;