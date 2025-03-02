import { otherPlayer, Player } from "../player"
import { combine, Identity, type Transformation } from "../transformations"
import type { GameState } from "./game-state"
import type { GameStateTree } from "./game-state-tree"
import { PositionSet } from "./position-set"

export interface SerializedTree {
    [position: number]: SerializedTree
    w?: Player
}

export interface DeserializationHooks {
    addState(newState: GameState): void
    addWinner(winnerState: GameState, winner: Player): void
}

interface DeserializationContext extends DeserializationHooks {
    state: GameState
    transformation: Transformation
    positionSet: PositionSet,
    player: Player,
    forState(state: GameState, transformation: Transformation, positionSet: PositionSet, player: Player): DeserializationContext
}

class ChildDeserializationContext implements DeserializationContext{
    public constructor(
        public readonly state: GameState,
        public readonly transformation: Transformation,
        public readonly positionSet: PositionSet,
        public readonly player: Player,
        private readonly context: DeserializationContext
    ){}

    public addState(newState: GameState): void {
        this.context.addState(newState);
    }

    public addWinner(winnerState: GameState, winner: Player): void {
        this.context.addWinner(winnerState, winner);
    }

    public forState(state: GameState, transformation: Transformation, positionSet: PositionSet, player: Player): DeserializationContext {
        return new ChildDeserializationContext(state, transformation, positionSet, player, this);
    }
}

class RootDeserializationContext implements DeserializationContext {
    public state: GameState
    public transformation: Transformation = Identity;
    public positionSet = new PositionSet(0);
    public player = Player.X;
    public constructor(
        public tree: GameStateTree
    ){
        this.state = tree.state
    }

    public addState(newState: GameState): void {
        this.tree = this.tree.addState(newState);
    }

    public addWinner(winnerState: GameState, winner: Player): void {
        this.tree = this.tree.addWinner(winnerState, winner);
    }

    public forState(state: GameState, transformation: Transformation, positionSet: PositionSet, player: Player): DeserializationContext {
        return new ChildDeserializationContext(state, transformation, positionSet, player, this);
    }
}

export function serializeTree(tree: GameStateTree): SerializedTree {
    const result: SerializedTree = {};
    for(const [_, child] of tree.children){
        const lastPlayedPosition = child.state.getLastPlayedPosition();
        if(lastPlayedPosition === undefined){
            continue;
        }
        result[lastPlayedPosition] = serializeTree(child);
    }
    if(tree.winner){
        result.w = tree.winner;
    }
    return result;
}

function deserializeChildTree(serialized: SerializedTree, context: DeserializationContext): void {
    let revealed = false;
    const ownTransformations = [...context.positionSet.getOwnTransformations()];
    const nonequivalentSuccessors = [...context.state.getNonequivalentSuccessors()];
    a:for(const key of Object.getOwnPropertyNames(serialized)){
        if(/^\d$/.test(key)){
            const position = parseInt(key);
            if(position > 8){
                continue;
            }
            const transformedPosition = context.transformation.positions[position];
            for(const ownTransformation of ownTransformations){
                const equivalentPosition = ownTransformation.positions[transformedPosition];
                const equivalentState = context.state.playPosition(equivalentPosition);
                for(const successor of nonequivalentSuccessors){
                    if(equivalentState.equals(successor)){
                        const newTransformation = combine(ownTransformation, context.transformation);
                        const newPositionSet = context.positionSet.withPlayerAtPosition(context.player, equivalentPosition);
                        const newPlayer = otherPlayer(context.player);
                        deserializeChildTree(serialized[position], context.forState(equivalentState, newTransformation, newPositionSet, newPlayer))
                        continue a;
                    }
                }
            }
        }
    }
    if(!revealed){
        context.addState(context.state);
    }
    const winner = serialized.w;
    if(winner === Player.X || winner === Player.O){
        context.addWinner(context.state, winner);
    }
}

export function deserializeTree(emptyTree: GameStateTree, serialized: SerializedTree): GameStateTree {
    const rootContext = new RootDeserializationContext(emptyTree);
    deserializeChildTree(serialized, rootContext);
    return rootContext.tree;
}