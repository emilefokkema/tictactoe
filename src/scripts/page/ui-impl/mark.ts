import type { Point } from "../point"
import type { Renderable } from "../renderer/types";
import type { Three } from "@shared/three"
import type { Drawable } from "./drawable";

export function isMark(content: Renderable): content is Mark {
    return (content as Mark).getWinStart !== undefined;
}
export interface Mark extends Drawable {
    getWinStart(three: Three): Point
    getWinEnd(three: Three): Point
}