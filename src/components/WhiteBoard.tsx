"use client"
import React, { useState } from 'react'
import Canvas from './Canvas';
import { whiteBoard } from '@/drawings/drawings';
import { HexColorPicker } from 'react-colorful';

export default function WhiteBoard() {

    function handleWb(wb: whiteBoard) {
        setWb(wb)
    }
    
    const [wb, setWb] = useState(new whiteBoard(3, handleWb));
    const [colorVisible, setColorVisible] = useState(false);
 
    return (
        <>

        <div className="h-full w-44 pl-2 py-2 relative z-10">
            <div className="bg-black/80 backdrop-blur-xl h-full w-full rounded-md flex flex-col gap-5 py-4 px-3">

            <div className="text-white w-full flex flex-col items-center select-none">
                Dimensione
                <div className="flex items-center justify-center gap-2">
                <div className="border border-white px-2 py-px flex items-center justify-center rounded-md cursor-pointer hover:bg-neutral-600 transition-all duration-300" onClick={() => setWb(wb.newRadius(wb.radius-2))}>-</div>
                {wb.radius}
                <div className="border border-white px-2 py-px flex items-center justify-center rounded-md cursor-pointer hover:bg-neutral-600 transition-all duration-300" onClick={() => {setWb(wb.newRadius(wb.radius+2))}}>+</div>
                </div>
            </div>

            <div className="text-white w-full flex flex-col items-center select-none">
                Colore
                <div className={`absolute left-[175px] ${colorVisible? "" : "hidden"}`}>
                    <HexColorPicker className='' color={wb.color} onChange={(e) => setWb(wb.newColor(e))} />
                </div>
                
                <div className="flex items-center justify-center gap-2 h-6">
                    {wb.lastsColors.map((el: string) => 
                        <div key={el} style={{backgroundColor: el}} onClick={() => setWb(wb.newColor(el))} className={`border border-neutral-800 cursor-pointer w-5 h-5 rounded ${wb.color == el ? "border-2 border-neutral-400" : ""} hover:scale-105 transition-all duration-300 ease-in-out`} />
                    )}
                </div>

                <div onClick={() => setColorVisible(!colorVisible)} className='cursor-pointer text-sm bg-neutral-600 px-4 py-1 mt-1 rounded-md hover:bg-neutral-500 transition-all duration-300'>{colorVisible? "Chiudi" : "Altri"}</div>
            </div>

            <div className="text-white w-full flex flex-col items-center select-none">
                Sfondo
                <div className="flex items-center justify-center gap-2 h-6">
                    {wb.lastBgColors.map((el) => 
                        <div key={el} style={{backgroundColor: el}} onClick={() => setWb(wb.newBgColor(el))} className={`bg-black border border-neutral-800 cursor-pointer w-5 h-5 rounded ${wb.bgColor == el ? "border-2 border-neutral-400" : ""} hover:scale-105 transition-all duration-300 ease-in-out`} />
                    )}
                </div>
            </div>


            <div className="text-white w-full flex flex-col items-center select-none">
                Zoom
                <div className="flex items-center justify-center gap-2">
                <div className="border border-white px-2 py-px flex items-center justify-center rounded-md cursor-pointer hover:bg-neutral-600 transition-all duration-300" onClick={() => setWb(wb.newScale(wb.scale*0.8))}>-</div>
                {(wb.scale * 100).toFixed(0)}%
                <div className="border border-white px-2 py-px flex items-center justify-center rounded-md cursor-pointer hover:bg-neutral-600 transition-all duration-300" onClick={() => setWb(wb.newScale(wb.scale*1.25))}>+</div>
                </div>
            </div>

            <div className="text-white w-full flex flex-col items-center select-none">
                Gomma
                <div onClick={() => setWb(wb.newEreaser(!wb.ereaser))} className={`flex items-center justify-center gap-2 text-black px-3 rounded-md cursor-pointer transition-all duration-300 ${wb.ereaser? "bg-green-600/50 hover:bg-green-600/60 text-white" : "bg-orange-100 hover:bg-orange-200"}`}>
                {wb.ereaser? "Attivo" : "Non Attivo"}
                </div>
            </div>

            <div className='md:hidden visible text-red-600 text-center text-xs w-full'>
                <div>⚠️⚠️</div>
                Apri da Computer
                <div>⚠️⚠️</div>
            </div>

            <div className="text-white w-full flex flex-col items-center select-none mt-auto mb-0">
                <div onClick={() => setWb(wb.newSave(true))} className={`w-full flex items-center justify-center gap-2 bg-white text-black px-3 rounded-md cursor-pointer hover:bg-neutral-300 transition-all duration-300 `}>
                    Scarica
                </div>
            </div>


            </div>
        </div>

        <Canvas draw={(ctx: CanvasRenderingContext2D, e: {clientX: number; clientY: number;}, active: boolean, cameraPosition: {X: number, Y: number}) => wb.drawDotLine(ctx, e, active, cameraPosition)} whiteboard={wb} className={`absolute top-0 left-0 touch-none w-full`} />
        </>
    )
}
