import type { Point } from "../point";
import type { Theme } from "../themes";
import type { Drawable } from "./drawable";

export class Win implements Drawable {
    public constructor(
        private theme: Theme,
        private readonly start: Point,
        private readonly end: Point,
        private readonly lineWidth: number
    ){

    }

    public setTheme(theme: Theme): void{
        this.theme = theme;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.lineWidth = this.lineWidth;
        ctx.save();
        ctx.strokeStyle = this.theme.color;
        ctx.beginPath();
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.end.x, this.end.y);
        ctx.stroke();
        ctx.restore();
    }
}