import { InfiniteCanvasRenderingContext2D } from 'ef-infinite-canvas';
import { Renderable, Renderer } from '../src/scripts/renderer/types'

export interface RendererMock extends Renderer{
    render(): void
}

export function mockRenderer(ctx: InfiniteCanvasRenderingContext2D): RendererMock{
    let renderable: Renderable | undefined;
    return {
        rerender(){},
        setRenderable(value: Renderable): void{
            renderable = value;
        },
        render(){
            if(!renderable){
                return;
            }
            renderable.draw(ctx);
        }
    };
}