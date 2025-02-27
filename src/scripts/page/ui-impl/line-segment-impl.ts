import { Point } from "../point";
import { Theme } from "../themes/themes";
import { BorderDirection, LineSegment, LineSegmentMeasurements } from "./types";

function getStartAndEnd({
    direction,
    position,
    start,
    end
}: LineSegmentMeasurements): {start: Point, end: Point}{
    if(direction === BorderDirection.Vertical){
        return {
            start: {
                x: position,
                y: start
            },
            end: {
                x: position,
                y: end
            }
        }
    }
    return {
        start: {
            x: start,
            y: position
        },
        end: {
            x: end,
            y: position
        }
    }
}

class ThemedLineSegment implements LineSegment{
    public constructor(
        private readonly lineSegment: LineSegment,
        private readonly lineWidth: number,
        private readonly theme: Theme){}
    
    public draw(ctx: CanvasRenderingContext2D): void{
        ctx.save();
        ctx.strokeStyle = this.theme.color;
        this.lineSegment.draw(ctx);
        ctx.restore();
    }

    public themed(theme: Theme): LineSegment {
        return this.lineSegment.themed(theme);
    }
}
export class LineSegmentImpl implements LineSegment{
    private readonly start: Point;
    private readonly end: Point
    public constructor(
        private readonly measurements: LineSegmentMeasurements
    ){
        const {start, end} = getStartAndEnd(measurements)
        this.start = start;
        this.end = end;
    }

    public themed(theme: Theme): LineSegment {
        return new ThemedLineSegment(this, this.measurements.lineWidth, theme);
    }

    public draw(ctx: CanvasRenderingContext2D): void{
        ctx.beginPath();
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.end.x, this.end.y);
        ctx.stroke();
    }
}