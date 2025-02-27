import { getMarkLineWidth, Measurements } from "../measurements";
import { Point } from "../point";
import { Theme } from "../themes/themes";
import { isInColumn, isInRow, isMainDiagonal, Three } from "../three";
import { Mark } from "./mark";

export class X implements Mark {
    private readonly lineWidth: number;
    public constructor(
        private readonly measurements: Measurements,
        private theme: Theme
    ){
        this.lineWidth = getMarkLineWidth(measurements.size);
    }

    public setTheme(theme: Theme): void {
        this.theme = theme;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const {x, y, size} = this.measurements;
        ctx.save();
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.theme.color;
        ctx.beginPath();
        ctx.moveTo(x + size / 4, y + size / 4);
        ctx.lineTo(x + 3 * size / 4, y + 3 * size / 4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 3 * size / 4, y + size / 4);
        ctx.lineTo(x + size / 4, y + 3 * size / 4);
        ctx.stroke();
        ctx.restore();
    }

    public getWinStart(three: Three): Point{
        const {x, y, size} = this.measurements;
        if(isInRow(three)){
            return {x: x + size * (1 - 1 / Math.sqrt(2)) / 2, y: y + size / 2}
        }
        if(isInColumn(three)){
            return {x: x + size / 2, y: y + size * (1 - 1 / Math.sqrt(2)) / 2}
        }
        if(isMainDiagonal(three)){
            return {x: x + size / 4, y: y + size / 4}
        }
        return {x: x + 3 * size / 4, y: y + size / 4}
    }

    public getWinEnd(three: Three): Point{
        const {x, y, size} = this.measurements;
        if(isInRow(three)){
            return {x: x + size * (1 + 1 / Math.sqrt(2)) / 2, y: y + size / 2}
        }
        if(isInColumn(three)){
            return {x: x + size / 2, y: y + size * (1 + 1 / Math.sqrt(2)) / 2}
        }
        if(isMainDiagonal(three)){
            return {x: x + 3 * size / 4, y: y + 3 * size / 4}
        }
        return {x: x + size / 4, y: y + 3 * size / 4}
    }
}