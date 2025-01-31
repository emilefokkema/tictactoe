import { PointerEventTargetLike, PointerEventType } from '../src/scripts/pointer-events/types'

export type MockEvent = Pick<GlobalEventHandlersEventMap[PointerEventType], 'pointerId' | 'offsetX' | 'offsetY' | 'pointerType'> & {
    type: PointerEventType
}
export interface PointerEventsMock extends PointerEventTargetLike{
    dispatchEvent(event: MockEvent): void
}

export function mockPointerEvents(): PointerEventsMock {
    const listeners: {[key in PointerEventType]: ((ev: GlobalEventHandlersEventMap[key]) => void)[]} = {
        pointerdown: [],
        pointermove: [],
        pointerup: []
    };

    return {
        addEventListener(type, listener){
            listeners[type].push(listener);
        },
        removeEventListener(){},
        dispatchEvent
    };

    function dispatchEvent(event: MockEvent): void{
        const ev = {
            preventDefault(){},
            ...event
        } as GlobalEventHandlersEventMap[PointerEventType];
        for(const listener of listeners[event.type].slice()){
            listener(ev);
        }
    }
}