import type { InfiniteCanvasRenderingContext2D } from "ef-infinite-canvas"

export interface Renderer {
    rerender(): void
    setRenderable(renderable: Renderable): void
}

export interface Renderable {
    draw(ctx: InfiniteCanvasRenderingContext2D): void
}