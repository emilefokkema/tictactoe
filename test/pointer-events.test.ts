import { describe, it, expect, vi, beforeAll, Mock, afterEach } from 'vitest'
import { mockPointerEvents, PointerEventsMock } from './mock-pointer-events';
import { CustomPointerEventTarget } from '../src/scripts/pointer-events/types';
import { createPointerEvents } from '../src/scripts/pointer-events/create-pointer-events';

vi.useFakeTimers();

function hasAllowCancelClick(ev: unknown): ev is {allowCancelClick(): void}{
    return (ev as {allowCancelClick(): void}).allowCancelClick !== undefined;
}

function hasAllowCancelDoubleClick(ev: unknown): ev is {allowCancelDoubleClick(): void}{
    return (ev as {allowCancelDoubleClick(): void}).allowCancelDoubleClick !== undefined;
}

function allowCancelClickIfPossible(event: unknown): void {
    if(hasAllowCancelClick(event)){
        event.allowCancelClick();
    }
}

function allowCancelDoubleClickIfPossible(event: unknown): void {
    if(hasAllowCancelDoubleClick(event)){
        event.allowCancelDoubleClick();
    }
}

describe('pointer events', () => {
    let pointerEvents: PointerEventsMock;
    let rootEventTarget: CustomPointerEventTarget;
    let rootEventListenerMock: Mock;

    beforeAll(() => {
        pointerEvents = mockPointerEvents();
        rootEventTarget = createPointerEvents(pointerEvents);
        rootEventListenerMock = vi.fn().mockImplementation(allowCancelClickIfPossible);
        rootEventTarget.addEventListener('pointerdown', rootEventListenerMock);
        rootEventTarget.addEventListener('clickcancel', rootEventListenerMock)
    })

    afterEach(() => {
        vi.clearAllMocks();
    })

    it('should call listener on root', () => {
        pointerEvents.dispatchEvent({
            type: 'pointerdown',
            offsetX: 100,
            offsetY: 100,
            pointerId: 0,
            pointerType: 'mouse'
        })
        expect(rootEventListenerMock).toHaveBeenCalledWith({
            type: 'pointerdown',
            allowCancelClick: expect.anything(),
            allowCancelDoubleClick: expect.anything()
        })
    })

    it('should cancel in case of another pointer', () => {
        pointerEvents.dispatchEvent({
            type: 'pointerdown',
            offsetX: 200,
            offsetY: 100,
            pointerId: 1,
            pointerType: 'mouse'
        })
        expect(rootEventListenerMock).toHaveBeenCalledWith({
            type: 'clickcancel'
        })
    })

    describe('with children with areas', () => {
        let area1EventTarget: CustomPointerEventTarget;
        let area1EventListenerMock: Mock;

        let area1Child1EventTarget: CustomPointerEventTarget;
        let area1Child1EventListenerMock: Mock;

        let area1Child2EventTarget: CustomPointerEventTarget;
        let area1Child2EventListenerMock: Mock;

        let area2EventTarget: CustomPointerEventTarget;
        let area2EventListenerMock: Mock;

        let area2Child1EventTarget: CustomPointerEventTarget;
        let area2Child1EventListenerMock: Mock;

        let area2Child2EventTarget: CustomPointerEventTarget;
        let area2Child2EventListenerMock: Mock;

        beforeAll(() => {
            area1EventTarget = rootEventTarget.addChildForArea({x: 0, y: 0, size: 10});
            area1EventListenerMock = vi.fn().mockImplementation(allowCancelClickIfPossible);
            area1EventTarget.addEventListener('pointerdown', area1EventListenerMock)
            area1EventTarget.addEventListener('clickcancel', area1EventListenerMock)

            area1Child1EventTarget = area1EventTarget.addChildForArea({x: 2, y: 4, size: 2});
            area1Child1EventListenerMock = vi.fn().mockImplementation(allowCancelDoubleClickIfPossible);
            area1Child1EventTarget.addEventListener('pointerdown', area1Child1EventListenerMock);
            area1Child1EventTarget.addEventListener('click', area1Child1EventListenerMock);
            area1Child1EventTarget.addEventListener('dblclick', area1Child1EventListenerMock)
            area1Child1EventTarget.addEventListener('dblclickcancel', area1Child1EventListenerMock)

            area1Child2EventTarget = area1EventTarget.addChildForArea({x: 6, y: 4, size: 2});
            area1Child2EventListenerMock = vi.fn();
            area1Child2EventTarget.addEventListener('pointerdown', area1Child2EventListenerMock);

            
            area2EventTarget = rootEventTarget.addChildForArea({x: 12, y: 0, size: 10});
            area2EventListenerMock = vi.fn();
            area2EventTarget.addEventListener('pointerdown', area2EventListenerMock);


            area2Child1EventTarget = area2EventTarget.addChildForArea({x: 14, y: 4, size: 2});
            area2Child1EventListenerMock = vi.fn();
            area2Child1EventTarget.addEventListener('pointerdown', area2Child1EventListenerMock);


            area2Child2EventTarget = area2EventTarget.addChildForArea({x: 18, y: 4, size: 2});
            area2Child2EventListenerMock = vi.fn();
            area2Child2EventTarget.addEventListener('pointerdown', area2Child2EventListenerMock);
            area2Child2EventTarget.addEventListener('click', area2Child2EventListenerMock);
        })

        it('should call listener on child', () => {
            pointerEvents.dispatchEvent({
                type: 'pointerdown',
                offsetX: 3,
                offsetY: 5,
                pointerId: 0,
                pointerType: 'mouse'
            })
            expect(area1Child1EventListenerMock).toHaveBeenCalledWith({
                type: 'pointerdown',
                allowCancelClick: expect.anything(),
                allowCancelDoubleClick: expect.anything()
            })

            pointerEvents.dispatchEvent({
                type: 'pointerup',
                offsetX: 3,
                offsetY: 5,
                pointerId: 0,
                pointerType: 'mouse'
            })
            expect(area1Child1EventListenerMock).toHaveBeenCalledWith({
                type: 'click'
            })

            pointerEvents.dispatchEvent({
                type: 'pointerdown',
                offsetX: 19,
                offsetY: 5,
                pointerId: 0,
                pointerType: 'mouse'
            })
            expect(area2Child2EventListenerMock).toHaveBeenCalledWith({
                type: 'pointerdown',
                allowCancelClick: expect.anything(),
                allowCancelDoubleClick: expect.anything()
            })

            pointerEvents.dispatchEvent({
                type: 'pointerup',
                offsetX: 19,
                offsetY: 5,
                pointerId: 0,
                pointerType: 'mouse'
            })
            expect(area2Child2EventListenerMock).toHaveBeenCalledWith({
                type: 'click'
            })


            pointerEvents.dispatchEvent({
                type: 'pointerdown',
                offsetX: 1,
                offsetY: 1,
                pointerId: 0,
                pointerType: 'mouse'
            })
            expect(area1EventListenerMock).toHaveBeenCalledWith({
                type: 'pointerdown',
                allowCancelClick: expect.anything(),
                allowCancelDoubleClick: expect.anything()
            })
        })

        it('should cancel in case of move', () => {
            pointerEvents.dispatchEvent({
                type: 'pointermove',
                offsetX: 10,
                offsetY: 1,
                pointerId: 0,
                pointerType: 'mouse'
            })
            expect(area1EventListenerMock).toHaveBeenCalledWith({
                type: 'clickcancel'
            })
        })

        it('should dispatch two clicks', () => {
            pointerEvents.dispatchEvent({
                type: 'pointerdown',
                offsetX: 3,
                offsetY: 5,
                pointerId: 0,
                pointerType: 'mouse'
            })
            pointerEvents.dispatchEvent({
                type: 'pointerup',
                offsetX: 3,
                offsetY: 5,
                pointerId: 0,
                pointerType: 'mouse'
            })
            expect(area1Child1EventListenerMock).toHaveBeenCalledWith({
                type: 'click'
            })
            vi.advanceTimersByTime(1000);
            area1Child1EventListenerMock.mockClear();
            pointerEvents.dispatchEvent({
                type: 'pointerdown',
                offsetX: 3,
                offsetY: 5,
                pointerId: 0,
                pointerType: 'mouse'
            })
            pointerEvents.dispatchEvent({
                type: 'pointerup',
                offsetX: 3,
                offsetY: 5,
                pointerId: 0,
                pointerType: 'mouse'
            })
            expect(area1Child1EventListenerMock).toHaveBeenCalledWith({
                type: 'click'
            })
        })

        it('should dispatch dblclick', () => {
            vi.advanceTimersByTime(1000);
            pointerEvents.dispatchEvent({
                type: 'pointerdown',
                offsetX: 3,
                offsetY: 5,
                pointerId: 0,
                pointerType: 'mouse'
            })
            pointerEvents.dispatchEvent({
                type: 'pointerup',
                offsetX: 3,
                offsetY: 5,
                pointerId: 0,
                pointerType: 'mouse'
            })
            vi.advanceTimersByTime(300);
            pointerEvents.dispatchEvent({
                type: 'pointerdown',
                offsetX: 3,
                offsetY: 5,
                pointerId: 0,
                pointerType: 'mouse'
            })
            pointerEvents.dispatchEvent({
                type: 'pointerup',
                offsetX: 3,
                offsetY: 5,
                pointerId: 0,
                pointerType: 'mouse'
            })
            expect(area1Child1EventListenerMock).toHaveBeenCalledWith({
                type: 'dblclick'
            })
        })

        it('should cancel dblclick', () => {
            pointerEvents.dispatchEvent({
                type: 'pointerdown',
                offsetX: 3,
                offsetY: 5,
                pointerId: 0,
                pointerType: 'mouse'
            })
            pointerEvents.dispatchEvent({
                type: 'pointerup',
                offsetX: 3,
                offsetY: 5,
                pointerId: 0,
                pointerType: 'mouse'
            })
            vi.advanceTimersByTime(300);
            pointerEvents.dispatchEvent({
                type: 'pointerdown',
                offsetX: 3,
                offsetY: 5,
                pointerId: 0,
                pointerType: 'mouse'
            })
            pointerEvents.dispatchEvent({
                type: 'pointermove',
                offsetX: 30,
                offsetY: 5,
                pointerId: 0,
                pointerType: 'mouse'
            })
            expect(area1Child1EventListenerMock).toHaveBeenCalledWith({
                type: 'dblclickcancel'
            })
        })

        describe('when child is destroyed', () => {

            beforeAll(() => {
                area1Child1EventTarget.destroy();
            })

            it('should call listener on parent', () => {
                pointerEvents.dispatchEvent({
                    type: 'pointerdown',
                    offsetX: 3,
                    offsetY: 5,
                    pointerId: 0,
                    pointerType: 'mouse'
                })
                expect(area1EventListenerMock).toHaveBeenCalledWith({
                    type: 'pointerdown',
                    allowCancelClick: expect.anything(),
                    allowCancelDoubleClick: expect.anything()
                })
            })
        })
    })
})