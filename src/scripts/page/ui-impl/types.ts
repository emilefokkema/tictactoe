import type { Measurements } from "../measurements";
import type { Theme } from "../themes"

export enum BorderDirection { Vertical, Horizontal }

export interface LineSegment {
    draw(ctx: CanvasRenderingContext2D): void
    themed(theme: Theme): LineSegment
}

export interface GridBorderMeasurements {
    lineSegment: LineSegmentMeasurements
    intersection1: number
    intersection2: number
    lineWidth: number
}

export interface LineSegmentMeasurements{
    direction: BorderDirection;
    position: number;
    start: number;
    end: number;
    lineWidth: number;
}

export interface GridCellBackgroundMeasurements {
    extendLeft: number
    extendRight: number
    extendTop: number
    extendBottom: number
}

export interface GridCellMeasurements extends Measurements{
    background: GridCellBackgroundMeasurements
}