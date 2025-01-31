import { EventDispatcher } from "../events/event-dispatcher";
import { Measurements, measurementsInclude } from "../measurements";
import { CustomPointerEventDispatcher, CustomPointerEventMap, CustomPointerEventTarget, PointerDownEventResult } from "./types";

export class PointerEventTargetImpl implements CustomPointerEventDispatcher {
    private readonly children: PointerEventTargetImpl[] = [];
    private readonly eventDispatcher: EventDispatcher<CustomPointerEventMap>;

    public constructor(
        private readonly area: Measurements | undefined,
        private readonly parent: PointerEventTargetImpl | undefined
    ){
        this.eventDispatcher = new EventDispatcher({
            pointerdown: [],
            clickcancel: [],
            dblclickcancel: [],
            dblclick: [],
            click: []
        })
    }

    private removeChild(child: PointerEventTargetImpl): void{
        const index = this.children.indexOf(child);
        if(index === -1){
            return;
        }
        this.children.splice(index, 1)
    }
    public dispatchPointerDown(event: PointerEvent): PointerDownEventResult {
        let cancelClickAllowed = false;
        let cancelDoubleClickAllowed = false;
        const customEvent: CustomPointerEventMap['pointerdown'] =  {
            type: 'pointerdown',
            allowCancelClick(){
                cancelClickAllowed = true;
            },
            allowCancelDoubleClick(){
                cancelDoubleClickAllowed = true;
            }
        }
        this.eventDispatcher.dispatchEvent('pointerdown', customEvent);
        return { cancelClickAllowed, cancelDoubleClickAllowed };
    }
    public dispatchClickCancel(): void {
        const event: CustomPointerEventMap['clickcancel'] =  {
            type: 'clickcancel'
        }
        this.eventDispatcher.dispatchEvent('clickcancel', event);
    }
    public dispatchDoubleClickCancel(): void {
        const event: CustomPointerEventMap['dblclickcancel'] =  {
            type: 'dblclickcancel'
        }
        this.eventDispatcher.dispatchEvent('dblclickcancel', event);
    }
    public dispatchClick(): void {
        const event: CustomPointerEventMap['click'] =  {
            type: 'click'
        }
        this.eventDispatcher.dispatchEvent('click', event)
    }
    public dispatchDoubleClick(): void {
        const event: CustomPointerEventMap['dblclick'] =  {
            type: 'dblclick'
        }
        this.eventDispatcher.dispatchEvent('dblclick', event)
    }
    public addEventListener<TType extends keyof CustomPointerEventMap>(
        type: TType,
        listener: (ev: CustomPointerEventMap[TType]) => void): void {
            this.eventDispatcher.addEventListener(type, listener);
    }
    public removeEventListener<TType extends keyof CustomPointerEventMap>(
        type: TType,
        listener: (ev: CustomPointerEventMap[TType]) => void): void {
           this.eventDispatcher.removeEventListener(type, listener);
    }
    public addChildForArea(area: Measurements): CustomPointerEventTarget{
        const child = new PointerEventTargetImpl(area, this);
        this.children.push(child);
        return child;
    }
    public findTarget(x: number, y: number): CustomPointerEventDispatcher | undefined {
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
    public destroy(){
        this.children.splice(0)
        if(this.parent){
            this.parent.removeChild(this)
        }
    }
}