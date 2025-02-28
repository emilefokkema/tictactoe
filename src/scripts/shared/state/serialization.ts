import { Player } from "../player"
import { GameState } from "./game-state"
import { GameStateTree } from "./game-state-tree"

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
    forState(state: GameState): DeserializationContext
}

class ChildDeserializationContext implements DeserializationContext{
    public constructor(
        public readonly state: GameState,
        private readonly context: DeserializationContext
    ){}

    public addState(newState: GameState): void {
        this.context.addState(newState);
    }

    public addWinner(winnerState: GameState, winner: Player): void {
        this.context.addWinner(winnerState, winner);
    }

    public forState(state: GameState): DeserializationContext {
        return new ChildDeserializationContext(state, this);
    }
}

class RootDeserializationContext implements DeserializationContext {
    public state: GameState
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

    public forState(state: GameState): DeserializationContext {
        return new ChildDeserializationContext(state, this);
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
    for(const key of Object.getOwnPropertyNames(serialized)){
        if(/^\d$/.test(key)){
            const position = parseInt(key);
            const stateForKey = context.state.playPosition(position);
            if(stateForKey.equals(context.state)){
                continue;
            }
            revealed = true;
            const contextForState = context.forState(stateForKey);
            deserializeChildTree(serialized[position], contextForState);
            continue;
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