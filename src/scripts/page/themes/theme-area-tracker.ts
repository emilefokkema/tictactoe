import type { InfiniteCanvas } from "ef-infinite-canvas";
import type { EventTargetLike } from "../events/types";
import type { ScreenMeasurements } from "../measurements";
import { EventDispatcher } from "../events/event-dispatcher";

export interface ThemeAreaTrackerEventMap {
    change: {primary: boolean}
}

export interface ThemeAreaTracker extends EventTargetLike<ThemeAreaTrackerEventMap> {
    primary: boolean
}

interface Point {
    x: number
    y: number
}

export function createThemeAreaTracker(
    {width, height}: ScreenMeasurements,
    infCanvas: InfiniteCanvas
): ThemeAreaTracker {
    const eventDispatcher: EventDispatcher<ThemeAreaTrackerEventMap> = new EventDispatcher({
        change: []
    });
    const doubleSquareSize = 2 * Math.max(width, height);
    const allPoints: Point[] = [
        {x: 0, y: 0},
        {x: width, y: 0},
        {x: width, y: height},
        {x: 0, y: height}
    ];
    let currentlyPrimary = true;
    infCanvas.addEventListener('transformationend', ({transformation: {a, b, c, d, e, f}}) => {
        let allInPrimary = true;
        let oneInPrimary = false;
        let allInSecondary = true;
        let oneInSecondary = false;
        for(const {x, y} of allPoints){
            const transformed = {
                x: a * x + c * y + e,
                y: b * x + d * y + f
            };
            const inPrimary = isInPrimaryArea(transformed);
            if(inPrimary && oneInSecondary || !inPrimary && oneInPrimary){
                return;
            }
            allInPrimary = allInPrimary && inPrimary;
            allInSecondary = allInSecondary && !inPrimary;
            oneInPrimary = oneInPrimary || inPrimary;
            oneInSecondary = oneInSecondary || !inPrimary;
        }
        if(allInPrimary && !currentlyPrimary){
            currentlyPrimary = true;
            eventDispatcher.dispatchEvent('change', {primary: true});
            return;
        }
        if(allInSecondary && currentlyPrimary){
            currentlyPrimary = false;
            eventDispatcher.dispatchEvent('change', {primary: false});
            return;
        }
    })
    return {
        get primary(){return currentlyPrimary;},
        addEventListener(type, listener){
            eventDispatcher.addEventListener(type, listener);
        },
        removeEventListener(type, listener){
            eventDispatcher.removeEventListener(type, listener);
        }
    };
    function isInPrimaryArea(point: Point): boolean {
        return point.x + point.y < doubleSquareSize;
    }
}

