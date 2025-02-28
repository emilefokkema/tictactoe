import { vi } from 'vitest'

export class MockBroadcastChannel implements BroadcastChannel {
    public name: string = 'test'
    public messageHandler: (e: MessageEvent) => void = () => {};
    public messageMock = vi.fn();
    public set onmessage(value: (e: MessageEvent) => void){
        this.messageHandler = value;
    }
    public get onmessage(): (e: MessageEvent) => void {
        return this.messageHandler;
    }
    public onmessageerror = () => {}
    public close(){}
    public addEventListener<K extends keyof BroadcastChannelEventMap>(type: K, listener: (ev: BroadcastChannelEventMap[K]) => void): void {
        if(type === 'message'){
            this.messageHandler = listener;
        }
    }
    public removeEventListener(): void {
        
    }
    public postMessage(message: any): void {
        this.messageMock(message);
    }
    public dispatchEvent(): boolean {
        return false;
    }
}