import { CustomPointerEventMap, CustomPointerEventTarget, EventTargetLike } from "../events/types";
import { getMarkLineWidth } from "../measurements";
import { Theme } from "../themes";
import { Drawable } from "../ui/drawable";
import { Grid, GridCell } from "../ui/grid";
import { Winner } from "../winner";
import { GridBorder } from "./grid-border";
import { GridBorderPart } from "./grid-border-part";
import { GridBuilder } from "./grid-builder";
import { GridCellBorder } from "./grid-cell-border";
import { isMark } from "./mark";
import { O } from "./o";
import { GridCellMeasurements } from "./types";
import { Win } from "./win";
import { X } from "./x";

class GridCellImpl implements GridCell {
    private theme: Theme;
    public content: Drawable | undefined;
    private eventTarget: CustomPointerEventTarget | undefined;
    public constructor(
        private readonly measurements: GridCellMeasurements,
        private readonly borders: GridCellBorder[],
        private readonly gridEventTarget: CustomPointerEventTarget,
        private gridTheme: Theme
    ){
        this.theme = gridTheme;
    }
    private ensureOwnEventTarget(): CustomPointerEventTarget {
        return this.eventTarget || (this.eventTarget = this.gridEventTarget.addChildForArea(this.measurements));
    }
    private drawBackground(ctx: CanvasRenderingContext2D): void {
        if(this.theme === this.gridTheme){
            return;
        }
        const {x, y, size, background: {extendLeft, extendRight, extendTop, extendBottom }} = this.measurements;
        ctx.fillStyle = this.theme.backgroundColor;
        ctx.fillRect(
            x - extendLeft,
            y - extendTop,
            size + extendLeft + extendRight,
            size + extendTop + extendBottom
        );
    }
    public setTheme(theme: Theme): void {
        this.theme = theme;
        this.borders.forEach(b => b.setTheme(theme))
    }
    public setGridTheme(theme: Theme){
        this.gridTheme = theme;
    }
    public addEventListener<TType extends keyof CustomPointerEventMap>(type: TType, handler: (ev: CustomPointerEventMap[TType]) => void): void {
        this.ensureOwnEventTarget().addEventListener(type, handler);
    }
    public removeEventListener<TType extends keyof CustomPointerEventMap>(type: TType, handler: (ev: CustomPointerEventMap[TType]) => void): void {
        this.eventTarget?.removeEventListener(type, handler);
    }
    public displayX(): void {
        this.content = new X(this.measurements, this.theme);
    }
    public displayO(): void {
        this.content = new O(this.measurements, this.theme);
    }
    public displayGrid(): Grid {
        const newGrid = new GridImpl(
            this.measurements,
            this.ensureOwnEventTarget(),
            this.theme,
            this
        );
        this.content = newGrid;
        return newGrid;
    }
    public clear(): void {
        const content = this.content;
        if(content instanceof GridImpl){
            content.destroy();
        }
        this.content = undefined;
        this.theme = this.gridTheme;
    }
    public destroy(): void {
        this.eventTarget?.destroy();
    }
    public draw(ctx: CanvasRenderingContext2D): void {
        this.drawBackground(ctx);
        this.content?.draw(ctx);
    }
}
export class GridImpl implements Grid, Drawable {
    private overlayContent: Drawable | undefined;
    private readonly cellImpls: [GridCellImpl, GridCellImpl, GridCellImpl, GridCellImpl, GridCellImpl, GridCellImpl, GridCellImpl, GridCellImpl, GridCellImpl];
    private readonly leftVerticalBorder: GridBorder;
    private readonly rightVerticalBorder: GridBorder;
    private readonly topHorizontalBorder: GridBorder;
    private readonly bottomHorizontalBorder: GridBorder;
    private readonly lineWidth: number;
    public readonly cellSize: number;
    public get cells(){
        return this.cellImpls;
    }
    public constructor(
        measurements: GridCellMeasurements,
        eventTarget: CustomPointerEventTarget,
        private theme: Theme,
        private readonly cell: GridCellImpl | undefined
    ){
        const builder = new GridBuilder(measurements);
        this.leftVerticalBorder = new GridBorder(builder.getLeftVertical(), theme);
        this.rightVerticalBorder = new GridBorder(builder.getRightVertical(), theme);
        this.topHorizontalBorder = new GridBorder(builder.getTopHorizontal(), theme);
        this.bottomHorizontalBorder = new GridBorder(builder.getBottomHorizontal(), theme);
        const cellMeasurements = [...builder.getCellMeasurements()];
        this.cellImpls = [
            new GridCellImpl(
                cellMeasurements[0],
                [
                    new GridCellBorder(this.leftVerticalBorder, GridBorderPart.BeginningRight),
                    new GridCellBorder(this.topHorizontalBorder, GridBorderPart.BeginningLeft),
                ],
                eventTarget,
                theme
            ),
            new GridCellImpl(
                cellMeasurements[1],
                [
                    new GridCellBorder(this.leftVerticalBorder, GridBorderPart.BeginningLeft),
                    new GridCellBorder(this.rightVerticalBorder, GridBorderPart.BeginningRight),
                    new GridCellBorder(this.topHorizontalBorder, GridBorderPart.MiddleLeft),
                ],
                eventTarget,
                theme
            ),
            new GridCellImpl(
                cellMeasurements[2],
                [
                    new GridCellBorder(this.rightVerticalBorder, GridBorderPart.BeginningLeft),
                    new GridCellBorder(this.topHorizontalBorder, GridBorderPart.EndLeft),
                ],
                eventTarget,
                theme
            ),
            new GridCellImpl(
                cellMeasurements[3],
                [
                    new GridCellBorder(this.topHorizontalBorder, GridBorderPart.BeginningRight),
                    new GridCellBorder(this.leftVerticalBorder, GridBorderPart.MiddleRight),
                    new GridCellBorder(this.bottomHorizontalBorder, GridBorderPart.BeginningLeft),
                ],
                eventTarget,
                theme
            ),
            new GridCellImpl(
                cellMeasurements[4],
                [
                    new GridCellBorder(this.topHorizontalBorder, GridBorderPart.MiddleRight),
                    new GridCellBorder(this.leftVerticalBorder, GridBorderPart.MiddleLeft),
                    new GridCellBorder(this.rightVerticalBorder, GridBorderPart.MiddleRight),
                    new GridCellBorder(this.bottomHorizontalBorder, GridBorderPart.MiddleLeft),
                ],
                eventTarget,
                theme
            ),
            new GridCellImpl(
                cellMeasurements[5],
                [
                    new GridCellBorder(this.topHorizontalBorder, GridBorderPart.EndRight),
                    new GridCellBorder(this.rightVerticalBorder, GridBorderPart.MiddleLeft),
                    new GridCellBorder(this.bottomHorizontalBorder, GridBorderPart.EndLeft),
                ],
                eventTarget,
                theme
            ),
            new GridCellImpl(
                cellMeasurements[6],
                [
                    new GridCellBorder(this.leftVerticalBorder, GridBorderPart.EndRight),
                    new GridCellBorder(this.bottomHorizontalBorder, GridBorderPart.BeginningRight),
                ],
                eventTarget,
                theme
            ),
           new GridCellImpl(
                cellMeasurements[7],
                [
                    new GridCellBorder(this.leftVerticalBorder, GridBorderPart.EndLeft),
                    new GridCellBorder(this.rightVerticalBorder, GridBorderPart.EndRight),
                    new GridCellBorder(this.bottomHorizontalBorder, GridBorderPart.MiddleRight),
                ],
                eventTarget,
                theme
            ),
            new GridCellImpl(
                cellMeasurements[8],
                [
                    new GridCellBorder(this.rightVerticalBorder, GridBorderPart.EndLeft),
                    new GridCellBorder(this.bottomHorizontalBorder, GridBorderPart.EndRight),
                ],
                eventTarget,
                theme
            ),
        ];
        this.lineWidth = builder.lineWidth;
        this.cellSize = builder.cellSize;
    }

    private drawBorders(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.theme.color;
        this.leftVerticalBorder.draw(ctx);
        this.rightVerticalBorder.draw(ctx);
        this.topHorizontalBorder.draw(ctx);
        this.bottomHorizontalBorder.draw(ctx);
        ctx.restore();
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        this.cellImpls.forEach(c => c.draw(ctx));
        this.overlayContent?.draw(ctx);
        this.drawBorders(ctx);
    }

    public setTheme(theme: Theme): void{
        this.theme = theme;
        this.leftVerticalBorder.setTheme(theme);
        this.rightVerticalBorder.setTheme(theme);
        this.topHorizontalBorder.setTheme(theme);
        this.bottomHorizontalBorder.setTheme(theme);
        this.cellImpls.forEach(c => c.setGridTheme(theme))
        this.cellImpls.forEach(c => c.setTheme(theme))
        this.cell?.setTheme(theme);
    }

    public destroy(): void {
        this.cellImpls.forEach(c => c.destroy());
    }

    public displayWinner(winner: Winner | undefined): void {
        if(!winner){
            this.overlayContent = undefined;
            return;
        }
        const winnerStartContent = this.cellImpls[winner.three.positions[0]].content;
        const winnerEndContent = this.cellImpls[winner.three.positions[2]].content;
        if(!winnerStartContent || !isMark(winnerStartContent) || !winnerEndContent || !isMark(winnerEndContent)){
            return;
        }
        const win = new Win(
            this.theme,
            winnerStartContent.getWinStart(winner.three),
            winnerEndContent.getWinEnd(winner.three),
            getMarkLineWidth(this.cellSize)
        )
        this.overlayContent = win;
    }
}