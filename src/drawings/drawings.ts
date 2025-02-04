
export class whiteBoard {
    radius: number;
    color: string;
    lastsColors: string[];
    bgColor: string;
    lastBgColors: string[];
    ereaser: boolean;
    scale: number;
    story: storyType;
    save: boolean;

    updater: (wb: whiteBoard) => void;

    constructor(
        radius: number, 
        updater: (wb: whiteBoard) => void,
        story: storyType = [{position: {clientX: 0, clientY: 0}, active: false, radius: 0, color: "black", ereaser: false}],
        color: string = "#000000",
        lastsColors: string[] = ["#000000", "#ffffff", "#0000ff", "#ff0000", "#00ff00"],
        lastBgColors: string[] = ["#000000", "#ffffff", "#f4c69a", "#fff0c6", "#fff9a5"],
        scale: number = 1.0,
        ereaser: boolean = false,
        bgColor: string = "#fff0c6",
        save: boolean = false,
    ) {
        this.radius = radius;
        this.story = story;
        this.color = color;
        this.scale = scale;
        this.ereaser = ereaser;
        this.bgColor = bgColor;
        this.lastsColors = lastsColors;
        this.lastBgColors = lastBgColors;

        this.updater = updater
        this.save = save
    }

    newRadius(radius: number) {
        if(radius < 1)
            return new whiteBoard(this.radius, this.updater, this.story, this.color, this.lastsColors, this.lastBgColors,  this.scale, this.ereaser, this.bgColor);
        return new whiteBoard(radius, this.updater, this.story, this.color, this.lastsColors, this.lastBgColors,  this.scale, this.ereaser, this.bgColor)
    }

    newColor(color: string) {
        return new whiteBoard(this.radius, this.updater, this.story, color, this.lastsColors, this.lastBgColors, this.scale, this.ereaser, this.bgColor)
    }

    newScale(scale: number) {
        return new whiteBoard(this.radius, this.updater, this.story, this.color, this.lastsColors, this.lastBgColors, scale, this.ereaser, this.bgColor)
    }

    newEreaser(ereaser: boolean) {
        return new whiteBoard(this.radius, this.updater, this.story, this.color, this.lastsColors, this.lastBgColors, this.scale, ereaser, this.bgColor)
    }

    newBgColor(bgColor: string) {
        return new whiteBoard(this.radius, this.updater, this.story, this.color, this.lastsColors, this.lastBgColors, this.scale, this.ereaser, bgColor)
    }

    newSave(save: boolean) {
        return new whiteBoard(this.radius, this.updater, this.story, this.color, this.lastsColors, this.lastBgColors, this.scale, this.ereaser, this.bgColor, save)
    }

    drawDotLine(ctx: CanvasRenderingContext2D, e: {clientX: number, clientY: number}, active: boolean, cameraPosition: {X: number, Y: number}) {
        if(!active){
            ctx.beginPath();

            if(this.story[this.story.length-1].active)
                this.story.push({position: {clientX: 0, clientY: 0}, active: false, radius: 0, color: this.color, ereaser: this.ereaser});
            return;
        }

        this.story.push(
            {position: {
                clientX: e.clientX * 1 / this.scale + parseInt(cameraPosition.X.toFixed(0)),
                clientY: e.clientY * 1 / this.scale + parseInt(cameraPosition.Y.toFixed(0))
            }, 
            active: active,
            radius: this.radius,
            color: this.color,
            ereaser: this.ereaser
            }
        );

        if(this.ereaser) {
            ctx.fillStyle = this.bgColor;
            ctx.strokeStyle = this.bgColor;
        }
        
        ctx.lineTo(e.clientX * 1 / this.scale, e.clientY * 1 / this.scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(e.clientX * 1 / this.scale, e.clientY * 1 / this.scale, this.radius, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(e.clientX * 1 / this.scale, e.clientY * 1 / this.scale);

        if(!this.lastsColors.includes(this.color)) {
            this.lastsColors.shift();
            this.lastsColors.push(this.color);
            this.updater(new whiteBoard(this.radius, this.updater, this.story, this.color, this.lastsColors, this.lastBgColors, this.scale, this.ereaser, this.bgColor))
        }
    }

    drawDotLineMoving(ctx: CanvasRenderingContext2D, e: {clientX: number, clientY: number}, active: boolean, radius: number, ereaser: boolean) {
        if(!active){
            ctx.beginPath();
            return;
        }
        
        if(ereaser) {
            ctx.fillStyle = this.bgColor;
            ctx.strokeStyle = this.bgColor;
        }

        ctx.lineTo(e.clientX, e.clientY);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(e.clientX, e.clientY, radius, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(e.clientX, e.clientY);
    }

    drawDot(ctx: CanvasRenderingContext2D, e: {clientX: number, clientY: number}, active: boolean, cameraPosition: {X: number, Y: number}) {
        if(!active)
            return;
        
        this.story.push(
            {position: 
                {clientX: e.clientX + parseInt(cameraPosition.X.toFixed(0)), 
                clientY: e.clientY + parseInt(cameraPosition.Y.toFixed(0))
            }, 
            active: active,
            radius: this.radius,
            color: this.color,
            ereaser: this.ereaser
        }
        );

        ctx.beginPath();
        ctx.arc(e.clientX, e.clientY, this.radius, 0, Math.PI*2);
        ctx.fill();
    }

    drawStory(ctx: CanvasRenderingContext2D, cameraPosition: {X: number, Y: number}) {

        this.story.forEach(el => {
            
            if(!this.isInside(cameraPosition, el.position)) {
                this.drawDotLineMoving(ctx, {clientX: 0, clientY: 0}, false, el.radius, el.ereaser);
                return;
            }

            ctx.strokeStyle = el.color;
            ctx.fillStyle = el.color;
            ctx.lineWidth = el.radius*2;
            this.drawDotLineMoving(
                ctx, 
                {clientX: el.position.clientX  - parseInt(cameraPosition.X.toFixed(0)), clientY: el.position.clientY - parseInt(cameraPosition.Y.toFixed(0))}, 
                el.active,
                el.radius,
                el.ereaser
            )
        });
    }

    isInside(cameraPosition: {X: number, Y: number}, el: {clientX: number, clientY: number}): boolean {
        return ((cameraPosition.X - 300 <= el.clientX && cameraPosition.X + 300 + window.innerWidth * 1 / this.scale >= el.clientX) &&
        (cameraPosition.Y - 300 <= el.clientY && cameraPosition.Y + 300 + window.innerHeight * 1 / this.scale >= el.clientY));
    }
}

type storyType = [{position: {clientX: number, clientY: number}, active: boolean, radius: number, color: string, ereaser: boolean}]
