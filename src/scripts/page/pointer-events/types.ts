import { EventTargetLike } from "../events/types"
import { Measurements } from "../measurements"

export interface CustomPointerEvent {
    type: string
}

export interface PointerDownEventResult {
    cancelClickAllowed: boolean
    cancelDoubleClickAllowed: boolean
}

export interface CustomPointerEventMap {
    pointerdown: CustomPointerEvent & {
        type: 'pointerdown',
        allowCancelClick(): void
        allowCancelDoubleClick(): void
    }
    clickcancel: CustomPointerEvent & {type: 'clickcancel'}
    dblclickcancel: CustomPointerEvent & {type: 'dblclickcancel'}
    click: CustomPointerEvent & {type: 'click'}
    dblclick: CustomPointerEvent & {type: 'dblclick'}
}

export interface CustomPointerEventTarget extends EventTargetLike<CustomPointerEventMap> {
    addChildForArea(area: Measurements): CustomPointerEventTarget
    destroy(): void
}

export interface CustomPointerEventDispatcher extends CustomPointerEventTarget {
    findTarget(x: number, y: number): CustomPointerEventDispatcher | undefined
    dispatchPointerDown(event: PointerEvent): PointerDownEventResult
    dispatchClickCancel(): void
    dispatchDoubleClickCancel(): void
    dispatchClick(): void
    dispatchDoubleClick(): void
}

export type PointerEventType = 'pointerdown' | 'pointerup' | 'pointermove'
export type PointerEventMap = Pick<GlobalEventHandlersEventMap, PointerEventType>

export type PointerEventTargetLike = EventTargetLike<PointerEventMap>

export interface Gesture {
    handlePointerDown(event: PointerEvent): void
    handlePointerMove(event: PointerEvent): void
    handlePointerUp(event: PointerEvent): void
}

export interface CustomPointerDownEventProperties {
    pointerId: number
    cancelClickAllowed: boolean
}

export interface CustomPointerDownAgainEventProperties {
    pointerId: number
    cancelDoubleClickAllowed: boolean
}

export interface GestureFactory {
    createNoop(): Gesture
    createPointerDown(
        target: CustomPointerEventDispatcher,
        props: CustomPointerDownEventProperties
    ): Gesture
    createAfterClick(target: CustomPointerEventDispatcher): Gesture
    createPointerDownAgain(target: CustomPointerEventDispatcher, props: CustomPointerDownAgainEventProperties): Gesture
}

export type GestureReplaceFn = (newValueFn: (factory: GestureFactory) => Gesture) => void