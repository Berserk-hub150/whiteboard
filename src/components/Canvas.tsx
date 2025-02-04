"use client"
import useCanvas from '@/hooks/useCanvas';
import { useState } from 'react';
import { useWheel } from '@use-gesture/react';
import { whiteBoard } from '@/drawings/drawings';

const Canvas = (props: { draw: (ctx: CanvasRenderingContext2D, e: { clientX: number, clientY: number }, active: boolean, cameraPosition: {X: number, Y: number}) => void; className: string, style: string, whiteboard: whiteBoard}) => {

    const bind = useWheel((e) => ( 
        setCameraPosition({X: cameraPosition.X + (e.direction[0] * e.velocity[0] * 10 * 1 / props.whiteboard.scale), Y: cameraPosition.Y + (e.direction[1] * e.velocity[1] * 10 * 1 / props.whiteboard.scale) })));

    const [cameraPosition, setCameraPosition] = useState({X: 0, Y: 0});
    const [mousePosition, setMousePosition] = useState<{clientX: number, clientY: number}>({clientX: 0, clientY: 0});
    const [drawOn, setDrawOn] = useState(false);
    const [dragging, setDragging] = useState(false);

    const { draw }: {
        draw: (ctx: CanvasRenderingContext2D, e: { clientX: number, clientY: number }, active: boolean, cameraPosition: {X: number, Y: number}) => void,
    } = props;
    
    const canvasRef = useCanvas((ctx: CanvasRenderingContext2D) => draw(ctx, mousePosition, drawOn, cameraPosition), props.whiteboard.radius*2, cameraPosition, (ctx: CanvasRenderingContext2D) => props.whiteboard.drawStory(ctx, cameraPosition), props.whiteboard);

    function handleMouseDown(e: {button: number}) {

        switch (e.button) {
            case 0:
                setDrawOn(true);
                break;
        
            case 2:
                setDragging(true);
            default:
                break;
        }
        
    }

    function handleMouseMove(e: {clientX: number, clientY: number, movementX: number, movementY: number}) {
        setMousePosition(e);
        if(dragging)
            setCameraPosition({X: cameraPosition.X - e.movementX, Y: cameraPosition.Y - e.movementY})
    }

    function disengage() {
        setDrawOn(false);
        setDragging(false);
    }

    return <canvas ref={canvasRef} style={{backgroundColor: props.style}} className={props.className} onContextMenu={(e) => {e.preventDefault()}} onMouseDown={(e) => handleMouseDown(e)} onMouseUp={disengage} onMouseMoveCapture={(e) => {handleMouseMove(e); console.log(e)}} {...bind()}></canvas>
}

export default Canvas;
