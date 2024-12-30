import { Measurements, measurementsInclude } from "../measurements";
import { CustomPointerEventMap, CustomPointerEventTarget, PointerEventTargetLike } from "./types";

class EventTargetImpl implements CustomPointerEventTarget {
    private readonly children: EventTargetImpl[] = [];
    private readonly listeners: {[key in keyof CustomPointerEventMap]: ((ev: CustomPointerEventMap[key]) => void)[]} = {
        pointerdown: [],
        pointercancel: [],
        pointerup: []
    };
    public constructor(
        private readonly area: Measurements | undefined,
        private readonly parent: EventTargetImpl | undefined
    ){}
    public dispatchEvent<TType extends keyof CustomPointerEventMap>(type: TType, event: CustomPointerEventMap[TType]): void{
        for(const listener of this.listeners[type].slice()){
            listener(event);
        }
    }
    public addEventListener<TType extends keyof CustomPointerEventMap>(
        type: TType,
        listener: (ev: CustomPointerEventMap[TType]) => void): void {
            this.listeners[type].push(listener);
    }
    public addChildForArea(area: Measurements): CustomPointerEventTarget{
        const child = new EventTargetImpl(area, this);
        this.children.push(child);
        return child;
    }
    public findTarget(x: number, y: number): EventTargetImpl | undefined {
        if(this.area && !measurementsInclude(this.area, x, y)){
            return undefined;
        }
        for(const child of this.children){
            const targetInChild = child.findTarget(x, y);
            if(targetInChild){
                return targetInChild;
            }
        }
        return this;
    }
    public removeChild(child: EventTargetImpl): void{
        const index = this.children.indexOf(child);
        if(index === -1){
            return;
        }
        this.children.splice(index, 1)
    }
    public destroy(){
        this.children.splice(0)
        if(this.parent){
            this.parent.removeChild(this)
        }
    }
}

class ActivePointer {
    public cancelAllowed = false;
    public constructor(
        public pointerId: number,
        private readonly target: EventTargetImpl
    ){

    }
    public dispatchPointerDownEvent(): void{
        let cancelAllowed = false;
        const event: CustomPointerEventMap['pointerdown'] =  {
            type: 'pointerdown',
            allowCancel(){
                cancelAllowed = true;
            }
        }
        this.target.dispatchEvent('pointerdown', event)
        if(cancelAllowed){
            this.cancelAllowed = true;
        }
    }
    public dispatchPointerCancelEvent(): void {
        const event: CustomPointerEventMap['pointercancel'] =  {
            type: 'pointercancel'
        }
        this.target.dispatchEvent('pointercancel', event)
    }
    public dispatchPointerUpEvent(): void {
        const event: CustomPointerEventMap['pointerup'] =  {
            type: 'pointerup'
        }
        this.target.dispatchEvent('pointerup', event)
    }
}

interface Gesture {
    handlePointerDown(event: PointerEvent): void
    handlePointerMove(event: PointerEvent): void
    handlePointerUp(event: PointerEvent): void
}

class PointerThatIsDown  implements Gesture {
    public constructor(
        private readonly rootTarget: EventTargetImpl,
        private readonly replaceGesture: (oldValue: Gesture, newValue: Gesture) => void,
        private readonly target: EventTargetImpl,
        private readonly x: number,
        private readonly y: number,
        private readonly pointerId: number,
        private readonly cancelAllowed: boolean
    ){

    }

    public handlePointerDown(event: PointerEvent): void {
        
    }

    public handlePointerMove(): void {
        
    }

    public handlePointerUp(): void {
        
    }
}

class NoopGesture implements Gesture {
    public constructor(
        private readonly rootTarget: EventTargetImpl,
        private readonly replaceGesture: (oldValue: Gesture, newValue: Gesture) => void
    ){

    }

    public handlePointerDown(event: PointerEvent): void {
        const target = this.rootTarget.findTarget(event.offsetX, event.offsetY);
        if(!target){
            return;
        }
        let cancelAllowed = false;
        const customEvent: CustomPointerEventMap['pointerdown'] =  {
            type: 'pointerdown',
            allowCancel(){
                cancelAllowed = true;
            }
        }
        target.dispatchEvent('pointerdown', customEvent);
        if(event.pointerType === 'mouse' && cancelAllowed){
            event.preventDefault();
        }
        this.replaceGesture(this, new PointerThatIsDown(
            this.rootTarget,
            this.replaceGesture,
            target,
            event.offsetX,
            event.offsetY,
            event.pointerId,
            cancelAllowed
        ))
    }

    public handlePointerMove(): void {
        
    }

    public handlePointerUp(): void {
        
    }
}

class CustomPointerEventProducer {
    private gesture: Gesture;
    public constructor(
        rootTarget: EventTargetImpl
    ){
        this.gesture = new NoopGesture(rootTarget, (oldValue, newValue) => this.replaceGesture(oldValue, newValue))
    }

    public handlePointerDown(event: PointerEvent): void {
        
    }

    private replaceGesture(oldValue: Gesture, newValue: Gesture): void {
        if(oldValue !== this.gesture){
            return;
        }
        this.gesture = newValue;
    }
}

export function createPointerEvents(
    pointerEvents: PointerEventTargetLike
): CustomPointerEventTarget {
    let activePointer: ActivePointer | undefined;
    const rootTarget = new EventTargetImpl(undefined, undefined);
    const eventProducer = new CustomPointerEventProducer(rootTarget);
    pointerEvents.addEventListener('pointerdown', (ev) => {
        if(activePointer === undefined){
            const target = rootTarget.findTarget(ev.offsetX, ev.offsetY);
            if(!target){
                return;
            }
            const newActivePointer = new ActivePointer(
                ev.pointerId,
                target
            );
            newActivePointer.dispatchPointerDownEvent();
            activePointer = newActivePointer;
            if(ev.pointerType === 'mouse' && activePointer.cancelAllowed){
                ev.preventDefault();
            }
        }else if(ev.pointerId !== activePointer.pointerId && activePointer.cancelAllowed){
            activePointer.dispatchPointerCancelEvent();
            activePointer = undefined;
        }
    });
    pointerEvents.addEventListener('pointerup', (ev) => {
        if(activePointer && ev.pointerId === activePointer.pointerId){
            activePointer.dispatchPointerUpEvent();
            activePointer = undefined;
        }
    });
    pointerEvents.addEventListener('pointermove', (ev) => {
        if(activePointer && ev.pointerId === activePointer.pointerId && activePointer.cancelAllowed){
            activePointer.dispatchPointerCancelEvent();
            activePointer = undefined;
        }
    });
    return rootTarget;
}