import type { EventTargetLike } from "./types";

export class EventDispatcher<TMap> implements EventTargetLike<TMap> {
    public constructor(
        private readonly listeners: {[key in keyof TMap]: ((ev: TMap[key]) => void)[]}
    ){}

    public dispatchEvent<TType extends keyof TMap>(type: TType, event: TMap[TType]): void{
        for(const listener of this.listeners[type].slice()){
            listener(event);
        }
    }
    public addEventListener<TType extends keyof TMap>(
        type: TType,
        listener: (ev: TMap[TType]) => void): void {
            this.listeners[type].push(listener);
    }
    public removeEventListener<TType extends keyof TMap>(
        type: TType,
        listener: (ev: TMap[TType]) => void): void {
            const listeners = this.listeners[type];
            const index = listeners.indexOf(listener);
            if(index === -1){
                return;
            }
            listeners.splice(index, 1);
    }
}