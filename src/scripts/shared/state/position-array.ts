const removalNumber = 1 | 1 << 4 | 1 << 8 | 1 << 12 | 1 << 16; // 1 at every place
const valueMask = (1 << 4) - 1; // a list of ones as long as a place (4)

function readValue(values: number, index: number): number | undefined {
    const fourTimesIndex = index * 4;
    const masked = values & valueMask << fourTimesIndex;
    if(masked === 0){
        return undefined;
    }
    return (masked >> fourTimesIndex) - 1;
}

interface IndicesSegment {
    value: number,
    mask: number
}

function removeFromIndicesSegment({value, mask}: IndicesSegment, index: number): IndicesSegment{
    if(index === -1){
        return {
            mask,
            value: value - (removalNumber & mask)
        };
    }
    const fourTimesIndex = index * 4;
    const indexValueMask = valueMask << fourTimesIndex;
    return {
        value: 
            (
                value // from the current value
                & ~indexValueMask // remove at the index
            )
        - // and then remove
            (
                mask // from where there is a value
                & removalNumber // 1 for every index
                    << fourTimesIndex + 4 // but only after the index
            ),
        mask: mask & ~indexValueMask
    }
}

function removeFromPositionSegment(segment: number, index: number): number {
    const fourTimesIndex = index * 4;
    return segment // from the current value
            & // take only
            ((1 << fourTimesIndex) - 1) // everything before the index
        | // and then add
            (
                segment // from the current value
                & // take only
                ~( // everything that is not
                    (1 << fourTimesIndex + 4) - 1 // up to and including the index
                ) // (i.e. everything after the index)
            ) 
            >> 4 // moved up one index-place;
}

function shiftFromPositionSegment(segment: number): {value: number | undefined, segment: number}{
    const firstValue = segment & valueMask;
    if(firstValue === 0){
        return {value: undefined, segment};
    }
    return { 
        value: firstValue - 1,
        segment: (segment & ~valueMask) >> 4
    }
}

function setOnPositionSegment(segment: number, index: number, value: number): number {
    const fourTimesIndex = index * 4;
    return segment // from the current value
        & ~( // take only that which is not
            valueMask << fourTimesIndex // at the index
        )
    | // and then add
    value + 1 // the value (+1 to signify that it is a value and not nothing)
        << fourTimesIndex // moved to the index place
}

class NineIndicesMap {
    private constructor(
        private readonly indices1: IndicesSegment,
        private readonly indices2: IndicesSegment
    ){

    }

    public getIndexOfPosition(position: number): number | undefined {
        const moreThanFive = position - 5;
        if(moreThanFive >= 0){
            return readValue(this.indices2.value, moreThanFive);
        }
        return readValue(this.indices1.value, position);
    }

    public removePosition(position: number): NineIndicesMap {
        const moreThanFive = position - 5;
        if(moreThanFive >= 0){
            return new NineIndicesMap(
                this.indices1,
                removeFromIndicesSegment(this.indices2, moreThanFive)
            );
        }
        
        return new NineIndicesMap(
            removeFromIndicesSegment(this.indices1, position),
            removeFromIndicesSegment(this.indices2, -1)
        );
    }

    public static initial: NineIndicesMap = new NineIndicesMap(
        {
            value: 
                0 + 1 << 0 * 4 |
                1 + 1 << 1 * 4 |
                2 + 1 << 2 * 4 |
                3 + 1 << 3 * 4 |
                4 + 1 << 4 * 4,
            mask: (1 << 20) - 1
        },
        {
            value: 
                5 + 1 << 0 * 4 |
                6 + 1 << 1 * 4 |
                7 + 1 << 2 * 4 |
                8 + 1 << 3 * 4,
            mask: (1 << 16) - 1
        }
    )
}

class NinePositionsMap {
    private constructor(
        private readonly positions1: number,
        private readonly positions2: number
    ){}

    public getPosition(index: number): number | undefined {
        const moreThanFive = index - 5;
        if(moreThanFive >= 0){
            return readValue(this.positions2, moreThanFive);
        }
        return readValue(this.positions1, index);
    }

    public removePosition(index: number): NinePositionsMap{
        const moreThanFive = index - 5;
        if(moreThanFive >= 0){
            return new NinePositionsMap(
                this.positions1,
                removeFromPositionSegment(this.positions2, moreThanFive)
            );
        }
        const {value: firstInPositions2, segment: newPositions2} = shiftFromPositionSegment(this.positions2);
        let newPositions1 = removeFromPositionSegment(this.positions1, index);
        if(firstInPositions2 !== undefined){
            newPositions1 = setOnPositionSegment(newPositions1, 4, firstInPositions2);
        }
        return new NinePositionsMap(
            newPositions1,
            newPositions2
        );
    }

    public static initial: NinePositionsMap = new NinePositionsMap(
        0 + 1 << 0 * 4 |
        1 + 1 << 1 * 4 |
        2 + 1 << 2 * 4 |
        3 + 1 << 3 * 4 |
        4 + 1 << 4 * 4,

        5 + 1 << 0 * 4 |
        6 + 1 << 1 * 4 |
        7 + 1 << 2 * 4 |
        8 + 1 << 3 * 4
    )
}

export class PositionArray {
    public constructor(
        private readonly positions: NinePositionsMap,
        private readonly indices: NineIndicesMap,
        public readonly length: number
    ){

    }

    public positionAt(index: number): number | undefined {
        return this.positions.getPosition(index);
    }

    public indexOf(position: number): number {
        const index = this.indices.getIndexOfPosition(position);
        return index === undefined ? -1 : index;
    }

    public removePosition(position: number): PositionArray {
        const index = this.indices.getIndexOfPosition(position);
        if(index === undefined){
            return this;
        }
        const newIndices = this.indices.removePosition(position);
        const newPositions = this.positions.removePosition(index);
        return new PositionArray(newPositions, newIndices, this.length - 1);
    }

    public removeAtIndex(index: number): PositionArray {
        const position = this.positions.getPosition(index);
        if(position === undefined){
            return this;
        }
        const newPositions = this.positions.removePosition(index);
        const newIndices = this.indices.removePosition(position);
        return new PositionArray(newPositions, newIndices, this.length - 1);
    }
    public static initial: PositionArray = new PositionArray(NinePositionsMap.initial, NineIndicesMap.initial, 9)
}