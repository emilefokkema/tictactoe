import { PointerEventTargetImpl } from "./pointer-event-target-impl";
import { GestureFactoryImpl } from "./gesture-factory-impl";
import { CustomPointerEventTarget, PointerEventTargetLike, CustomPointerEventDispatcher, Gesture } from "./types";


class CustomPointerEventProducer {
    private gesture: Gesture;
    public constructor(
        rootTarget: CustomPointerEventDispatcher
    ){
        const gestureFactory = new GestureFactoryImpl(rootTarget, (oldValue, newValueFn) => this.replaceGesture(oldValue, newValueFn))
        this.gesture = gestureFactory.createNoop();
    }

    public handlePointerDown(event: PointerEvent): void {
        this.gesture.handlePointerDown(event);
    }

    public handlePointerMove(event: PointerEvent): void {
        this.gesture.handlePointerMove(event);
    }

    public handlePointerUp(event: PointerEvent): void {
        this.gesture.handlePointerUp(event);
    }

    private replaceGesture(oldValue: Gesture, newValueFn: () => Gesture): void {
        if(oldValue !== this.gesture){
            return;
        }
        this.gesture = newValueFn();
    }
}

export function createPointerEvents(
    pointerEvents: PointerEventTargetLike
): CustomPointerEventTarget {
    const rootTarget = new PointerEventTargetImpl(undefined, undefined);
    const eventProducer = new CustomPointerEventProducer(rootTarget);
    pointerEvents.addEventListener('pointerdown', (ev) => {
        eventProducer.handlePointerDown(ev);
    });
    pointerEvents.addEventListener('pointerup', (ev) => {
        eventProducer.handlePointerUp(ev);
    });
    pointerEvents.addEventListener('pointermove', (ev) => {
        eventProducer.handlePointerMove(ev)
    });
    return rootTarget;
}