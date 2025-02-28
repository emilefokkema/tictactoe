import type { Player } from "../player";
import type { Winner } from "../winner";
import { calculateWinner } from "./calculate-winner";
import { GameState } from "./game-state";
import type { GameStateTree } from "./game-state-tree";
import { type SerializedTree, serializeTree, deserializeTree } from "./serialization";


export class GameStateTreeImpl implements GameStateTree{
    private constructor(
        public readonly state: GameState,
        public readonly winnerInState: Winner | undefined, 
        public readonly children: Map<number, GameStateTreeImpl>,
        public readonly winner: Player | undefined
    ){}

    private replace(fn: (state: GameState, tree: GameStateTreeImpl | undefined) => GameStateTreeImpl | undefined): GameStateTreeImpl | undefined {
        const newChildren: Map<number, GameStateTreeImpl> = new Map([...this.children]);
        const winnerCalculator = calculateWinner(this.state);
        let sameChildren = true;
        for(const successor of this.state.getNonequivalentSuccessors()){
            const existingChild = newChildren.get(successor.id);
            const newChild = fn(successor, existingChild);
            if(newChild !== existingChild){
                sameChildren = false;
                if(!newChild){
                    newChildren.delete(successor.id);
                }else{
                    newChildren.set(successor.id, newChild);
                }
            }
            winnerCalculator.addChildWinner(newChild?.winner || existingChild?.winner);
        }
        const newWinner = winnerCalculator.getResult();
        const unchanged = sameChildren && (this.winner === newWinner);
        if(unchanged){
            return fn(this.state, this);
        }
        return fn(this.state, new GameStateTreeImpl(this.state, this.winnerInState, newChildren, newWinner === undefined ? this.winner : newWinner));
    }

    private withPredecessor(predecessorState: GameState): GameStateTreeImpl | undefined {
        const equivalentState = this.state.getEquivalentWithSameLineage(predecessorState);
        if(!equivalentState){
            return undefined;
        }
        if(equivalentState.equals(this.state)){
            return this;
        }
        return this.replace((state, tree) => {
            if(!tree){
                return tree;
            }
            if(state.equals(this.state)){
                return new GameStateTreeImpl(equivalentState, equivalentState.findWinner(), tree.children, tree.winner);
            }
            const equivalentChildState = state.getEquivalentWithSameLineage(equivalentState);
            if(!equivalentChildState){
                return tree;
            }
            return tree.withPredecessor(equivalentChildState);
        })
    }

    private findOwnWinner(): GameStateTreeImpl {
        if(this.winnerInState){
            return this;
        }
        return this;
    }

    public addState(newState: GameState): GameStateTreeImpl {
        if(newState.equals(this.state)){
            return this;
        }
        return this.replace((state, tree) => {
            if(state.equals(this.state)){
                return tree;
            }
            if(state.equals(newState)){
                return tree || GameStateTreeImpl.create(state);
            }
            const equivalentNewState = newState.getEquivalentWithSameLineage(state);
            if(!equivalentNewState){
                return tree;
            }
            const newTree = tree || GameStateTreeImpl.create(state);
            return newTree.addState(equivalentNewState);
        })!;
    }

    public addWinner(winnerState: GameState, winner: Player): GameStateTreeImpl {
        if(winnerState.equals(this.state)){
            if(winner === this.winner){
                return this;
            }
            return new GameStateTreeImpl(this.state, this.winnerInState, this.children, winner);
        }
        return this.replace((state, tree) => {
            if(state.equals(this.state)){
                return tree;
            }
            if(!tree){
                return tree;
            }
            const equivalentWinnerState = winnerState.getEquivalentWithSameLineage(state);
            if(!equivalentWinnerState){
                return tree;
            }
            return tree.addWinner(equivalentWinnerState, winner);
        })!;
    }

    public removeState(stateToRemove: GameState): GameStateTreeImpl | undefined {
        if(stateToRemove.equals(this.state)){
            return undefined;
        }
        return this.replace((state, tree) => {
            if(state.equals(this.state)){
                return tree;
            }
            if(!tree || state.equals(stateToRemove)){
                return undefined;
            }
            const equivalentStateToRemove = stateToRemove.getEquivalentWithSameLineage(state);
            if(!equivalentStateToRemove){
                return tree;
            }
            return tree.removeState(equivalentStateToRemove);
        })
    }

    public getForState(state: GameState): GameStateTreeImpl | undefined {
        if(state.equals(this.state)){
            return this;
        }
        for(const [_, child] of this.children){
            const equivalentChildState = child.state.getEquivalentWithSameLineage(state);
            if(!equivalentChildState){
                continue;
            }
            const equivalentChildTree = child.withPredecessor(equivalentChildState);
            if(!equivalentChildTree){
                continue;
            }
            return equivalentChildTree.getForState(state);
        }
        return undefined;
    }

    public equals(other: GameStateTree | undefined): boolean {
        if(!other){
            return false;
        }
        if(!this.state.equals(other.state)){
            return false;
        }
        if(this.winner !== other.winner){
            return false;
        }
        const thisChildren = this.children;
        const otherChildren = other.children;
        if(thisChildren.size !== otherChildren.size){
            return false;
        }
        for(const [id, child] of thisChildren){
            if(!child.equals(otherChildren.get(id))){
                return false;
            }
        }
        return true;
    }

    public toJSON(): SerializedTree{
        return serializeTree(this)
    }

    public findWinnerFor(state: GameState): GameStateTreeImpl {
        if(state.equals(this.state)){
            return this.findOwnWinner();
        }
        return this.replace((treeState, tree) => {
            if(treeState.equals(this.state)){
                return tree;
            }
            if(!tree){
                return;
            }
            if(treeState.equals(state)){
                return tree.findOwnWinner();
            }
            return tree.findWinnerFor(state);
        })!
    }



    public static fromJSON(json: SerializedTree): GameStateTree {
        return deserializeTree(GameStateTreeImpl.initial, json);
    }

    public static create(state: GameState): GameStateTreeImpl {
        const winner = state.findWinner();
        return new GameStateTreeImpl(state, winner, new Map(), winner ? winner.player : undefined);
    }

    public static initial = this.create(GameState.initial);
}