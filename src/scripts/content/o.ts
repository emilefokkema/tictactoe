import { isInColumn, isInRow, isMainDiagonal, Three } from "../three";
import { Point } from "../point";
import { Mark } from "./mark";
import { MarkImpl } from "./mark-impl";

export class O extends MarkImpl implements Mark{

    private getStraightWinDistanceFromEdge(): number{
        return this.measurements.size / 8 - this.lineWidth / 4;
    }

    private getDiagonalWinDistanceFromEdge(): number{
        const { size } = this.measurements;
        return size / 4 - (size / 8 + this.lineWidth / 4) / Math.sqrt(2)
    }

    public getWinStart(three: Three): Point{
        const {x, y, size} = this.measurements;
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
        const {x, y, size} = this.measurements;
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

    protected drawMark(ctx: CanvasRenderingContext2D): void{
        const {x, y, size} = this.measurements;
        ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 4, 0, 2 * Math.PI);
        ctx.stroke();
    }
}