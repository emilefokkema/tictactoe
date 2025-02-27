interface Section {
    shift: number
    cumulativeShift: number
}

const sections: Section[] = [
    { shift: 4, cumulativeShift: 0},
    { shift: 4, cumulativeShift: 4},
    { shift: 3, cumulativeShift: 8},
    { shift: 3, cumulativeShift: 11},
    { shift: 3, cumulativeShift: 14},
    { shift: 3, cumulativeShift: 17},
    { shift: 2, cumulativeShift: 20},
    { shift: 2, cumulativeShift: 22},
    { shift: 1, cumulativeShift: 24}
];

export class PositionStream {
    private readonly vacantPositions = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    private sectionIndex = 0;
    private section = sections[0];
    private atEnd = false;
    public constructor(public positions: number){}
    private getCurrentPositionIndex(): number | undefined{
        if(this.atEnd){
            return undefined;
        }
        const masked = (this.positions >> (this.section.cumulativeShift)) & ((1 << this.section.shift) - 1);
        return masked === 0 ? undefined : Math.min(masked - 1, this.vacantPositions.length - 1);
    }
    private advance(positionIndex: number): void{
        if(this.sectionIndex === 8){
            this.atEnd = true;
            return;
        }
        this.vacantPositions.splice(positionIndex, 1);
        this.section = sections[++this.sectionIndex];
    }
    private read(): number | undefined{
        const positionIndex = this.getCurrentPositionIndex();
        if(positionIndex === undefined){
            return undefined;
        }
        const position = this.vacantPositions[positionIndex];
        this.advance(positionIndex);
        return position;
    }
    public write(position: number): void{
        const positionIndex = this.vacantPositions.indexOf(position);
        if(positionIndex === -1){
            return;
        }
        this.positions |= (positionIndex + 1) << (this.section.cumulativeShift);
        this.advance(positionIndex);
    }
    public *readAll(): Generator<number>{
        let position: number | undefined = undefined;
        while((position = this.read()) !== undefined){
            yield position;
        }
    }
    public moveToEnd(): void{
        for(const _ of this.readAll()){}
    }
    public static readAll(positions: number): Generator<number>{
        return new PositionStream(positions).readAll();
    }
}