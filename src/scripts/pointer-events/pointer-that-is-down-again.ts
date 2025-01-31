import { CustomPointerDownAgainEventProperties, CustomPointerEventDispatcher, Gesture, GestureReplaceFn } from "./types";

export class PointerThatIsDownAgain implements Gesture{
    public constructor(
        private readonly replaceGesture: GestureReplaceFn,
        private readonly target: CustomPointerEventDispatcher,
        private readonly props: CustomPointerDownAgainEventProperties
    ){}

    public handlePointerDown(event: PointerEvent): void {
        if(!this.props.cancelDoubleClickAllowed || event.pointerId === this.props.pointerId){
            return;
        }
        this.target.dispatchDoubleClickCancel();
        this.replaceGesture((factory) => factory.createNoop())
    }

    public handlePointerMove(event: PointerEvent): void {
        if(!this.props.cancelDoubleClickAllowed || event.pointerId !== this.props.pointerId){
            return;
        }
        this.target.dispatchDoubleClickCancel();
        this.replaceGesture((factory) => factory.createNoop())
    }

    public handlePointerUp(event: PointerEvent): void {
        if(event.pointerId !== this.props.pointerId){
            return;
        }
        this.target.dispatchDoubleClick();
        this.replaceGesture((factory) => factory.createNoop())
    }
}