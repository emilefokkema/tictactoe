import type { CustomPointerEventDispatcher, Gesture, GestureReplaceFn } from "./types";

export class NoopGesture implements Gesture {
    public constructor(
        private readonly rootTarget: CustomPointerEventDispatcher,
        private readonly replaceGesture: GestureReplaceFn
    ){

    }

    public handlePointerDown(event: PointerEvent): void {
        const target = this.rootTarget.findTarget(event.offsetX, event.offsetY);
        if(!target){
            return;
        }
        const { cancelClickAllowed } = target.dispatchPointerDown(event);
        if(event.pointerType === 'mouse' && cancelClickAllowed){
            event.preventDefault();
        }
        this.replaceGesture((factory) => {
            return factory.createPointerDown(target, {
                pointerId: event.pointerId,
                cancelClickAllowed
            })
        })
    }

    public handlePointerMove(): void {
        
    }

    public handlePointerUp(): void {
        
    }
}