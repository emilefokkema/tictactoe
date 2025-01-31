import { CustomPointerEventDispatcher, Gesture, GestureReplaceFn } from "./types";

export class AfterClick implements Gesture {
    private timeout: ReturnType<typeof setTimeout>;
    public constructor(
        private readonly replaceGesture: GestureReplaceFn,
        private readonly rootTarget: CustomPointerEventDispatcher,
        private readonly target: CustomPointerEventDispatcher,
    ){
        this.timeout = setTimeout(() => replaceGesture((factory) => factory.createNoop()), 500)
    }

    public handlePointerDown(event: PointerEvent): void{
        clearTimeout(this.timeout);
        const target = this.rootTarget.findTarget(event.offsetX, event.offsetY);
        if(!target){
            return;
        }
        if(target !== this.target){
            const { cancelClickAllowed } = target.dispatchPointerDown(event);
            if(event.pointerType === 'mouse' && cancelClickAllowed){
                event.preventDefault();
            }
            this.replaceGesture((factory) => factory.createPointerDown(target, {
                pointerId: event.pointerId,
                cancelClickAllowed
            }))
        }else{
            const { cancelDoubleClickAllowed } = target.dispatchPointerDown(event);
            if(event.pointerType === 'mouse' && cancelDoubleClickAllowed){
                event.preventDefault();
            }
            this.replaceGesture((factory) => factory.createPointerDownAgain(target, {
                pointerId: event.pointerId,
                cancelDoubleClickAllowed
            }))
        }
    }

    public handlePointerMove(): void {
        
    }

    public handlePointerUp(): void {
        
    }
}