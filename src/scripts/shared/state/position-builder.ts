import { PositionArray } from "./position-array";

interface Section {
    length: number
    offset: number
}

const sections: Section[] = [
    { length: 4, offset: 0},
    { length: 4, offset: 4},
    { length: 3, offset: 8},
    { length: 3, offset: 11},
    { length: 3, offset: 14},
    { length: 3, offset: 17},
    { length: 2, offset: 20},
    { length: 2, offset: 22},
    { length: 1, offset: 24}
];

export class PositionBuilder {
    private constructor(
        public positions: number,
        public lastPlayedPosition: number | undefined,
        public atEnd: boolean,
        private readonly vacantPositions: PositionArray,
        private readonly sectionIndex: number,
        private readonly section: Section,
    ){}

    private readPositionIndex(positions: number): number | undefined{
        if(this.atEnd){
            return undefined;
        }
        const masked = (positions >> (this.section.offset)) & ((1 << this.section.length) - 1);
        return masked === 0 ? undefined : Math.min(masked - 1, this.vacantPositions.length - 1);
    }

    private advance(positionIndex: number, position: number): PositionBuilder{
        const newPositions = this.positions | positionIndex + 1 << this.section.offset;
        const newAtEnd = this.sectionIndex === 8;
        const newVacantPositions = this.vacantPositions.removeAtIndex(positionIndex);
        const newSectionIndex = newAtEnd ? 8 : this.sectionIndex + 1;
        const newSection = sections[newSectionIndex];
        return new PositionBuilder(
            newPositions,
            position,
            newAtEnd,
            newVacantPositions,
            newSectionIndex,
            newSection
        )
    }

    public write(position: number): PositionBuilder {
        const positionIndex = this.vacantPositions.indexOf(position);
        if(positionIndex === -1){
            return this;
        }
        return this.advance(positionIndex, position);
    }

    public read(positions: number): PositionBuilder {
        const positionIndex = this.readPositionIndex(positions);
        if(positionIndex === undefined){
            return this;
        }
        const position = this.vacantPositions.positionAt(positionIndex);
        if(position === undefined){
            return this;
        }
        return this.advance(positionIndex, position);
    }

    public static *readAllPositions(positions: number): Generator<number> {
        let vacantPositions = PositionArray.initial;
        let sectionIndex = 0;
        let section = sections[sectionIndex];
        while(true){
            const masked = (positions >> (section.offset)) & ((1 << section.length) - 1);
            if(masked === 0){
                break;
            }
            const positionIndex = Math.min(masked - 1, vacantPositions.length - 1);
            const position = vacantPositions.positionAt(positionIndex);
            if(position === undefined){
                break;
            }
            yield position;
            if(sectionIndex === 8){
                break;
            }
            sectionIndex++;
            section = sections[sectionIndex];
            vacantPositions = vacantPositions.removeAtIndex(positionIndex);
        }
    }

    public static *readAll(positions: number): Generator<PositionBuilder> {
        let builder = PositionBuilder.initial;    
        while(true){
            const newBuilder = builder.read(positions);
            if(newBuilder === builder){
                break;
            }
            builder = newBuilder;
            yield builder;
        }
    }

    public static initial: PositionBuilder = new PositionBuilder(
        0,
        undefined,
        false,
        PositionArray.initial,
        0, 
        sections[0]
    )
}