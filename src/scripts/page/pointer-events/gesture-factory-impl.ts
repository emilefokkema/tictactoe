import type { TransformationRepresentation } from "ef-infinite-canvas";
import { AfterClick } from "./after-click";
import { NoopGesture } from "./noop-gesture";
import { PointerThatIsDown } from "./pointer-that-is-down";
import { PointerThatIsDownAgain } from "./pointer-that-is-down-again";
import type { CustomPointerDownAgainEventProperties, CustomPointerDownEventProperties, CustomPointerEventDispatcher, Gesture, GestureFactory } from "./types";
import { transformPosition } from "./transform-position";

export class GestureFactoryImpl implements GestureFactory {
    public constructor(
        private readonly rootTarget: CustomPointerEventDispatcher,
        private readonly gestureReplacer: (oldValue: Gesture, newValueFn: () => Gesture) => void
    ){}
    public createNoop(): Gesture {
        const result = new NoopGesture(
            this.rootTarget,
            (newGestureFn) => this.gestureReplacer(result, () => newGestureFn(this))
        );
        return result;
    }
    public createPointerDown(target: CustomPointerEventDispatcher, props: CustomPointerDownEventProperties): Gesture {
        const {x: screenOffsetX, y: screenOffsetY} = transformPosition(props.transformation, props.offsetX, props.offsetY);
        const result = new PointerThatIsDown(
            (newGestureFn) => this.gestureReplacer(result, () => newGestureFn(this)),
            target,
            props,
            screenOffsetX,
            screenOffsetY
        );
        return result;
    }
    public createPointerDownAgain(target: CustomPointerEventDispatcher, props: CustomPointerDownAgainEventProperties): Gesture {
        const {x: screenOffsetX, y: screenOffsetY} = transformPosition(props.transformation, props.offsetX, props.offsetY);
        const result = new PointerThatIsDownAgain(
            (newGestureFn) => this.gestureReplacer(result, () => newGestureFn(this)),
            target,
            props,
            screenOffsetX,
            screenOffsetY
        );
        return result;
    }
    public createAfterClick(target: CustomPointerEventDispatcher): Gesture {
        const result = new AfterClick(
            (newGestureFn) => this.gestureReplacer(result, () => newGestureFn(this)),
            this.rootTarget,
            target
        );
        return result;
    }
}