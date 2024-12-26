import { Renderable, Renderer } from '../src/scripts/renderer/types'

export interface RendererMock extends Renderer{
    render(): void
}

export function mockRenderer(ctx: CanvasRenderingContext2D): RendererMock{
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