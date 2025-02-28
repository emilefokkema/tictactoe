import { BorderDirection, type GridBorderMeasurements, type GridCellMeasurements } from "./types";

export class GridBuilder {
    private readonly vertical1: number
    private readonly vertical2: number
    private readonly horizontal1: number
    private readonly horizontal2: number
    public readonly lineWidth: number;
    public readonly cellSize: number;
    public constructor(
        private readonly measurements: GridCellMeasurements
    ){
        const { size, x, y } = measurements;
        const lineWidth = this.lineWidth = size / 100;
        const cellSize = this.cellSize = (size - 2 * lineWidth) / 3;
        const right = x + size;
        const bottom = y + size;
        this.vertical1 = x + cellSize + lineWidth / 2;
        this.vertical2 = right - cellSize - lineWidth / 2;
        this.horizontal1 = y + cellSize + lineWidth / 2;
        this.horizontal2 = bottom - cellSize - lineWidth / 2;
    }
    public *getCellMeasurements(): Iterable<GridCellMeasurements>{
        const {x, y, size: parentSize} = this.measurements;
        const size = (parentSize - 2 * this.lineWidth) / 3;
        const halfLineWidth = this.lineWidth / 2;
        const columnXes = [x, this.vertical1 + halfLineWidth, this.vertical2 + halfLineWidth];
        const rowYs = [y, this.horizontal1 + halfLineWidth, this.horizontal2 + halfLineWidth];
        for(let rowIndex = 0; rowIndex < 3; rowIndex++){
            const extendTop = rowIndex === 0 ? this.measurements.background.extendTop : halfLineWidth;
            const extendBottom = rowIndex === 2 ? this.measurements.background.extendBottom : halfLineWidth;
            for(let columnIndex = 0; columnIndex < 3; columnIndex++){
                const extendLeft = columnIndex === 0 ? this.measurements.background.extendLeft : halfLineWidth;
                const extendRight = columnIndex === 2 ? this.measurements.background.extendRight : halfLineWidth;
                yield {
                    x: columnXes[columnIndex],
                    y: rowYs[rowIndex],
                    size,
                    background: {
                        extendLeft,
                        extendRight,
                        extendTop,
                        extendBottom
                    }
                }
            }
        }
    }
    public getLeftVertical(): GridBorderMeasurements {
        return {
            lineSegment: {
                direction: BorderDirection.Vertical,
                position: this.vertical1,
                start: this.measurements.y - this.measurements.background.extendTop,
                end: this.measurements.y + this.measurements.size + this.measurements.background.extendBottom,
                lineWidth: this.lineWidth
            },
            intersection1: this.horizontal1,
            intersection2: this.horizontal2,
            lineWidth: this.lineWidth
        }
    }
    public getRightVertical(): GridBorderMeasurements {
        return {
            lineSegment: {
                direction: BorderDirection.Vertical,
                position: this.vertical2,
                start: this.measurements.y - this.measurements.background.extendTop,
                end: this.measurements.y + this.measurements.size + this.measurements.background.extendBottom,
                lineWidth: this.lineWidth
            },
            intersection1: this.horizontal1,
            intersection2: this.horizontal2,
            lineWidth: this.lineWidth
        };
    }
    public getTopHorizontal(): GridBorderMeasurements{
        return {
            lineSegment: {
                direction: BorderDirection.Horizontal,
                position: this.horizontal1,
                start: this.measurements.x - this.measurements.background.extendLeft,
                end: this.measurements.x + this.measurements.size + this.measurements.background.extendRight,
                lineWidth: this.lineWidth
            },
            intersection1: this.vertical1,
            intersection2: this.vertical2,
            lineWidth: this.lineWidth
        }
    }
    public getBottomHorizontal(): GridBorderMeasurements{
        return {
            lineSegment:{
                direction: BorderDirection.Horizontal,
                position: this.horizontal2,
                start: this.measurements.x - this.measurements.background.extendLeft,
                end: this.measurements.x + this.measurements.size + this.measurements.background.extendRight,
                lineWidth: this.lineWidth
            },
            intersection1: this.vertical1,
            intersection2: this.vertical2,
            lineWidth: this.lineWidth
        }
    }
}