
export class whiteBoard {
    radius: number;
    color: string = "black";
    scale: number = 1.0;
    prevScale: number = 1.0;

    story: [{position: {clientX: number, clientY: number}, active: boolean, radius: number, color: string}];

    constructor(
        radius: number, 
        story: [{position: {clientX: number, clientY: number}, active: boolean, radius: number, color: string}] = [{position: {clientX: 0, clientY: 0}, active: false, radius: 0, color: this.color}],
        color: string = "black",
        scale: number = 1.0,
        prevScale: number = this.prevScale
    ) {
        this.radius = radius;
        this.story = story;
        this.color = color;
        this.scale = scale;
        this.prevScale = prevScale;
    }

    drawDotLine(ctx: CanvasRenderingContext2D, e: {clientX: number, clientY: number}, active: boolean, cameraPosition: {X: number, Y: number}) {
        if(!active){
            ctx.beginPath();

            if(this.story[this.story.length-1].active)
                this.story.push({position: {clientX: 0, clientY: 0}, active: false, radius: 0, color: this.color});
            return;
        }

        this.story.push(
            {position: {
                clientX: e.clientX * 1 / this.scale + parseInt(cameraPosition.X.toFixed(0)),
                clientY: e.clientY * 1 / this.scale + parseInt(cameraPosition.Y.toFixed(0))
            }, 
            active: active,
            radius: this.radius,
            color: this.color
            }
        );
        
        ctx.lineTo(e.clientX * 1 / this.scale, e.clientY * 1 / this.scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(e.clientX * 1 / this.scale, e.clientY * 1 / this.scale, this.radius, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(e.clientX * 1 / this.scale, e.clientY * 1 / this.scale);
    }

    drawDotLineMoving(ctx: CanvasRenderingContext2D, e: {clientX: number, clientY: number}, active: boolean, radius: number) {
        if(!active){
            ctx.beginPath();
            return;
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
            color: this.color
        }
        );

        ctx.beginPath();
        ctx.arc(e.clientX, e.clientY, this.radius, 0, Math.PI*2);
        ctx.fill();
    }

    drawStory(ctx: CanvasRenderingContext2D, cameraPosition: {X: number, Y: number}) {

        this.story.forEach(el => {
            
            if(!this.isInside(cameraPosition, el.position)) {
                this.drawDotLineMoving(ctx, {clientX: 0, clientY: 0}, false, el.radius);
                return;
            }

            ctx.strokeStyle = el.color;
            ctx.fillStyle = el.color;
            ctx.lineWidth = el.radius*2;
            this.drawDotLineMoving(
                ctx, 
                {clientX: el.position.clientX  - parseInt(cameraPosition.X.toFixed(0)), clientY: el.position.clientY - parseInt(cameraPosition.Y.toFixed(0))}, 
                el.active,
                el.radius
            )
        });
    }

    isInside(cameraPosition: {X: number, Y: number}, el: {clientX: number, clientY: number}): boolean {
        return ((cameraPosition.X - 300 <= el.clientX && cameraPosition.X + 300 + window.innerWidth * 1 / this.scale >= el.clientX) &&
        (cameraPosition.Y - 300 <= el.clientY && cameraPosition.Y + 300 + window.innerHeight * 1 / this.scale >= el.clientY));
    }
}