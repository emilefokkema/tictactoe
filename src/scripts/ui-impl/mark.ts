import { Point } from "../point"
import { Renderable } from "../renderer/types";
import { Three } from "../three"
import { Drawable } from "./drawable";

export function isMark(content: Renderable): content is Mark {
    return (content as Mark).getWinStart !== undefined;
}
export interface Mark extends Drawable {
    getWinStart(three: Three): Point
    getWinEnd(three: Three): Point
}