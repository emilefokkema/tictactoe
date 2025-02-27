export interface ScreenMeasurements {
    width: number
    height: number
}

export interface Measurements{
    x: number
    y: number
    size: number
}

export function measurementsInclude(measurements: Measurements, x: number, y: number){
    const {x: left, y: top, size } = measurements;
    return x > left && x < left + size && y > top && y < top + size;
}

export function getInitialMeasurements(totalWidth: number, totalHeight: number): {grid1: Measurements, grid2: Measurements}{
    const size = 2 * Math.min(totalWidth, totalHeight) / 3;
    
    const x = (totalWidth - size) / 2;
    const y = (totalHeight - size) / 2;
    const mirrorD = 2 * Math.max(totalHeight, totalWidth);
    const gridBottomRightX = x + size;
    const gridBottomRightY = y + size;
    const cX = mirrorD - gridBottomRightY;
    const cY = mirrorD - gridBottomRightX;
    
    return {
        grid1: {
            x,
            y,
            size
        },
        grid2: {
            x: cX,
            y: cY,
            size
        }
    }
}

export function getMarkLineWidth(cellSize: number): number{
    return cellSize / (7 * Math.sqrt(2));
}