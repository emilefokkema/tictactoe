import { PositionBuilder } from "./position-builder";

export class PositionStream {
    private constructor(
        public positions: number,
        private positionBuilder: PositionBuilder
    ){}

    private read(): number | undefined{
        const newBuilder = this.positionBuilder.read(this.positions);
        if(newBuilder === this.positionBuilder){
            return undefined;
        }
        this.positionBuilder = newBuilder;
        return newBuilder.lastPlayedPosition;
    }
    public write(position: number): void{
        const newBuilder = this.positionBuilder.write(position);
        if(newBuilder === this.positionBuilder){
            return;
        }
        this.positionBuilder = newBuilder;
        this.positions = newBuilder.positions;
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

    public clone(): PositionStream {
        return new PositionStream(
            this.positions,
            this.positionBuilder
        )
    }
    public static readAll(positions: number): Generator<number>{
        return PositionStream.create(positions).readAll();
    }
    public static create(positions: number): PositionStream {
        return new PositionStream(
            positions,
            PositionBuilder.initial
        );
    }
}