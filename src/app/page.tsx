"use client"
import Canvas from "@/components/Canvas";
import { whiteBoard } from "@/drawings/drawings";
import { useState } from "react";

export default function Home() {

  const [wb, setWb] = useState(new whiteBoard(5));
  const [color, setColor] = useState("black");

  return (
    <div className="h-full">

      <div className="h-full w-40 pl-2 py-2 relative z-10">
        <div className="bg-black/80 backdrop-blur-xl h-full w-full rounded-md flex flex-col gap-5 py-5">

          <div className="text-white w-full flex flex-col items-center select-none">
            Dimensione
            <div className="flex items-center justify-center gap-2">
              <div className="border border-white px-2 py-px flex items-center justify-center rounded-md cursor-pointer" onClick={() => setWb(new whiteBoard(wb.radius-2, wb.story, color))}>-</div>
              {wb.radius}
              <div className="border border-white px-2 py-px flex items-center justify-center rounded-md cursor-pointer" onClick={() => {setWb(new whiteBoard(wb.radius+2, wb.story, color))}}>+</div>
            </div>
          </div>

          <div className="text-white w-full flex flex-col items-center select-none">
            Colore
            <div className="flex items-center justify-center gap-2 h-6">
              <div onClick={() => {setColor("black"); setWb(new whiteBoard(wb.radius, wb.story, "black"))}} className={`bg-black border border-white cursor-pointer w-5 h-5 rounded-full ${color == "black" ? "scale-105" : ""} transition-all duration-300 ease-in-out`} />
              <div onClick={() => {setColor("white"); setWb(new whiteBoard(wb.radius, wb.story, "white"))}} className={`bg-white border border-white cursor-pointer w-5 h-5 rounded-full ${color == "white" ? "scale-105" : ""} transition-all duration-300 ease-in-out`} />
              <div onClick={() => {setColor("red"); setWb(new whiteBoard(wb.radius, wb.story, "red"))}} className={`bg-red-600 border border-white cursor-pointer w-5 h-5 rounded-full ${color == "red" ? "scale-105" : ""} transition-all duration-300 ease-in-out`} />
              <div onClick={() => {setColor("blue"); setWb(new whiteBoard(wb.radius, wb.story, "blue"))}} className={`bg-blue-600 border border-white cursor-pointer w-5 h-5 rounded-full ${color == "blue" ? "scale-105" : ""} transition-all duration-300 ease-in-out`} />
            </div>
          </div>


        </div>
      </div>

      <Canvas draw={(ctx: CanvasRenderingContext2D, e: {clientX: number; clientY: number;}, active: boolean, cameraPosition: {X: number, Y: number}) => wb.drawDotLine(ctx, e, active, cameraPosition)} whiteboard={wb} className={"absolute top-0 left-0 touch-none"} linewidth={wb.radius*2} color={color}/>
    </div>
  );
}
