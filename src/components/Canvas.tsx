"use client"
import useCanvas from '@/hooks/useCanvas';
import { useState } from 'react';
import { useWheel } from '@use-gesture/react';
import { whiteBoard } from '@/drawings/drawings';

const Canvas = (props: { linewidth: number; draw: (ctx: CanvasRenderingContext2D, e: { clientX: number, clientY: number }, active: boolean, cameraPosition: {X: number, Y: number}) => void; className: string, whiteboard: whiteBoard, color: string}) => {

    const bind = useWheel((e) => (
        console.log(cameraPosition), 
        setCameraPosition({X: cameraPosition.X + (e.direction[0] * e.velocity[0] * 10), Y: cameraPosition.Y + (e.direction[1] * e.velocity[1] * 10)})));

    const [cameraPosition, setCameraPosition] = useState({X: 0, Y: 0});
    const [mousePosition, setMousePosition] = useState<{clientX: number, clientY: number}>({clientX: 0, clientY: 0});
    const [drawOn, setDrawOn] = useState(false);

    const { draw }: {
        draw: (ctx: CanvasRenderingContext2D, e: { clientX: number, clientY: number }, active: boolean, cameraPosition: {X: number, Y: number}) => void,
    } = props;
    
    const canvasRef = useCanvas((ctx: CanvasRenderingContext2D) => draw(ctx, mousePosition, drawOn, cameraPosition), props.linewidth, cameraPosition, (ctx: CanvasRenderingContext2D) => props.whiteboard.drawStory(ctx, cameraPosition), props.color);

    function engage() {
        setDrawOn(true);
    }

    function disengage() {
        setDrawOn(false);
    }

    return <canvas ref={canvasRef} className={props.className} onMouseDown={engage} onMouseUp={disengage} onMouseMoveCapture={(e: {clientX: number, clientY: number}) => setMousePosition(e)} {...bind()}></canvas>
}

export default Canvas;
