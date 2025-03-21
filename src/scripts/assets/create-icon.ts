import { createSvgDrawing } from "./create-svg-drawing";
import { GridImpl } from '../shared/drawing/grid'
import type { Theme } from '../shared/drawing'

export function createIcon(): string {
    const theme: Theme = {
        color: '#000',
        backgroundColor: 'rgba(0, 0, 0, 0)'
    };
    const drawing = createSvgDrawing(36, 36);
    const grid = GridImpl.create({
        x: 0,
        y: 0,
        width: 36,
        height: 36
    }, theme)
    grid.draw(drawing);
    drawing.prepend(`<style>@media(prefers-color-scheme: dark){line{stroke: #fff;}}</style>`)
    return drawing.getResult();
}