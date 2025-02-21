import { Point } from "../point"
import { Renderable } from "../renderer/types";
import { Theme } from "../themes";
import { Three } from "../three"
import { Themeable } from "../ui/themeable";

export function isMark(content: Renderable): content is Mark {
    return (content as Mark).getWinStart !== undefined;
}
export interface Mark extends Renderable, Themeable<Theme> {
    getWinStart(three: Three): Point
    getWinEnd(three: Three): Point
}