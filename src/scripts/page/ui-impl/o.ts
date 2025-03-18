import { getMarkLineWidth, type Measurements } from "../measurements";
import type { Point } from "./point";
import type { Theme } from "../themes";
import { type Three, isInColumn, isInRow, isMainDiagonal } from "@shared/three";
import type { Mark } from "./mark";

export class O implements Mark {
    private readonly lineWidth: number;
    public constructor(
        private readonly measurements: Measurements,
        private theme: Theme
    ){
        this.lineWidth = getMarkLineWidth(measurements.width);
    }

    private getStraightWinDistanceFromEdge(): number{
        return this.measurements.width / 8 - this.lineWidth / 4;
    }

    private getDiagonalWinDistanceFromEdge(): number{
        const { width: size } = this.measurements;
        return size / 4 - (size / 8 + this.lineWidth / 4) / Math.sqrt(2)
    }

    public setTheme(theme: Theme): void {
        this.theme = theme;
    }

    public draw(ctx: CanvasRenderingContext2D): void{
        const {x, y, width: size} = this.measurements;
        ctx.save();
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.theme.color;
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 4, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
    }

    public getWinStart(three: Three): Point{
        const {x, y, width: size} = this.measurements;
        if(isInRow(three)){
            return {x: x + this.getStraightWinDistanceFromEdge(), y: y + size / 2}
        }
        if(isInColumn(three)){
            return {x: x + size / 2, y: y + this.getStraightWinDistanceFromEdge()}
        }
        const diagDist = this.getDiagonalWinDistanceFromEdge();
        if(isMainDiagonal(three)){
            return {x: x + diagDist, y: y + diagDist}
        }
        return {x: x + size - diagDist, y: y + diagDist }
    }

    public getWinEnd(three: Three): Point{
        const {x, y, width: size} = this.measurements;
        if(isInRow(three)){
            return {x: x + size - this.getStraightWinDistanceFromEdge(), y: y + size / 2}
        }
        if(isInColumn(three)){
            return {x: x + size / 2, y: y + size - this.getStraightWinDistanceFromEdge()}
        }
        const diagDist = this.getDiagonalWinDistanceFromEdge();
        if(isMainDiagonal(three)){
            return {x: x + size - diagDist, y: y + size - diagDist }
        }
        return {x: x + diagDist, y: y + size - diagDist }
    }
}