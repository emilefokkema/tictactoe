import { CustomPointerDownEventProperties, CustomPointerEventDispatcher, CustomPointerEventMap, Gesture, GestureReplaceFn } from "./types";

export class PointerThatIsDown implements Gesture {
    public constructor(
        private readonly replaceGesture: GestureReplaceFn,
        private readonly target: CustomPointerEventDispatcher,
        private readonly props: CustomPointerDownEventProperties
    ){

    }

    public handlePointerDown(event: PointerEvent): void {
        if(!this.props.cancelClickAllowed || event.pointerId === this.props.pointerId){
            return;
        }
        this.target.dispatchClickCancel();
        this.replaceGesture((factory) => factory.createNoop())
    }

    public handlePointerMove(event: PointerEvent): void {
        if(!this.props.cancelClickAllowed || event.pointerId !== this.props.pointerId){
            return;
        }
        this.target.dispatchClickCancel();
        this.replaceGesture((factory) => factory.createNoop())
    }

    public handlePointerUp(event: PointerEvent): void {
        if(event.pointerId !== this.props.pointerId){
            return;
        }
        this.target.dispatchClick();
        this.replaceGesture((factory) => factory.createAfterClick(this.target))
    }
}