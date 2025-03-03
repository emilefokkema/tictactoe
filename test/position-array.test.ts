import { describe, it, expect, beforeEach } from 'vitest'
import { PositionArray } from '../src/scripts/shared/state/position-array'

function getPositions(array: PositionArray): number[]{
    const result: number[] = [];
    for(let index = 0; index < 9; index++){
        const valueAtIndex = array.positionAt(index);
        if(valueAtIndex === undefined){
            break;
        }
        result.push(valueAtIndex)
    }
    return result;
}

describe('a position array', () => {
    let array: PositionArray;

    beforeEach(() => {
        array = PositionArray.initial;
    })

    it('should have correct length', () => {
        expect(array.length).toBe(9);
    })

    it.each<[number, number]>([
        [0, 0],
        [4, 4]
    ])('should at index %d return position %d', (index: number, expectedPosition: number) => {
        expect(array.positionAt(index)).toBe(expectedPosition)
    })

    it.each<[number, number]>([
        [0, 0],
        [4, 4]
    ])('should as index of %d return %d', (position: number, expectedIndex: number) => {
        expect(array.indexOf(position)).toBe(expectedIndex)
    })

    describe('when positions 0 1 8 4 and 7 are removed', () => {
        let result: PositionArray;

        beforeEach(() => {
            result = array
                .removeAtIndex(0)
                .removeAtIndex(0)
                .removeAtIndex(6)
                .removeAtIndex(2)
                .removeAtIndex(4)
        })

        it('should have the right positions', () => {
            expect(getPositions(result)).toEqual([2, 3, 5, 6])
        })
    })

    describe('when position 3 is removed', () => {
        let position3Removed: PositionArray;

        beforeEach(() => {
            position3Removed = array.removePosition(3);
        })

        it('should have correct length', () => {
            expect(position3Removed.length).toBe(8);
        })

        it.each<[number, number]>([
            [0, 0],
            [2, 2],
            [3, 4],
            [4, 5],
            [7, 8]
        ])('should at index %d return position %d', (index: number, expectedPosition: number) => {
            expect(position3Removed.positionAt(index)).toBe(expectedPosition)
        })
    });

    describe('when position at index 3 is removed', () => {
        let removedOnIndex3: PositionArray;

        beforeEach(() => {
            removedOnIndex3 = array.removeAtIndex(3);
        })

        it('should have correct length', () => {
            expect(removedOnIndex3.length).toBe(8);
        })

        it.each<[number, number]>([
            [0, 0],
            [2, 2],
            [3, 4],
            [4, 5],
            [7, 8]
        ])('should at index %d return position %d', (index: number, expectedPosition: number) => {
            expect(removedOnIndex3.positionAt(index)).toBe(expectedPosition)
        })

        it.each<[number, number]>([
            [0, 0],
            [2, 2],
            [3, -1],
            [4, 3],
            [5, 4],
            [8, 7]
        ])('should as index of %d return %d', (position: number, expectedIndex: number) => {
            expect(removedOnIndex3.indexOf(position)).toBe(expectedIndex)
        })
    })
})