import { PositionBuilder } from "./position-builder";

export class PositionStream {
    private constructor(
        public positions: number,
        private positionBuilder: PositionBuilder
    ){}

    public write(position: number): void{
        const newBuilder = this.positionBuilder.write(position);
        if(newBuilder === this.positionBuilder){
            return;
        }
        this.positionBuilder = newBuilder;
        this.positions = newBuilder.positions;
    }

    public *readAll(): Generator<number>{    
        for(const builder of PositionBuilder.readAll(this.positions)){
            this.positionBuilder = builder;
            if(builder.lastPlayedPosition === undefined){
                break;
            }
            yield builder.lastPlayedPosition;
        }
    }


    public moveToEnd(): void{
        for(const builder of PositionBuilder.readAll(this.positions)){
            this.positionBuilder = builder;
        }
    }

    public clone(): PositionStream {
        return new PositionStream(
            this.positions,
            this.positionBuilder
        )
    }
    public static create(positions: number): PositionStream {
        return new PositionStream(
            positions,
            PositionBuilder.initial
        );
    }
}