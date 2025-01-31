import { otherPlayer, Player } from "../player"
import { GameState } from "../state/game-state"
import { addToRevealedPosition, RevealedPosition, splitGameState, splitRevealedPosition } from "../state/revealed-position"
import { TicTacToeStoreMutations } from "../store/tictactoe-store"
import { Theme } from "../themes"
import { Grid, GridCell } from "../ui/grid"
import { Winner } from "../winner"
import { Possibility, PossibilityParent } from "./possibility"
import { X, XParent } from "./x"

export interface TicTacToeParent {
    notifyRevealedPosition(position: RevealedPosition): void
    notifyHiddenState(state: GameState): void
}

export class TicTacToeImpl implements TicTacToeStoreMutations, PossibilityParent, TicTacToeParent, XParent {
    private theme: Theme
    private readonly possibilities: Possibility[]
    private readonly xes: X[];
    private readonly ticTacToes: TicTacToeImpl[] = [];
    public winner: Player | undefined;
    public isWin: boolean;

    public constructor(
        private readonly parent: TicTacToeParent,
        public readonly gameState: GameState,
        winner: Winner | undefined,
        theme: Theme,
        private readonly grid: Grid,
        private readonly gridCell: GridCell | undefined
    ){
        const actualTheme = winner ? theme.winnerTheme : theme;
        this.theme = actualTheme;
        grid.setTheme(actualTheme);
        const possibilities: Possibility[] = this.possibilities = [];
        const xes: X[] = this.xes = [];
        const playersAtPositions = [...gameState.getPlayersAtPositions()];
        if(winner){
            this.winner = winner.player;
        }
        this.isWin = !!winner;
        for(let position = 0; position < 9; position++){
            const cell = grid.cells[position];
            const playerAtCell = playersAtPositions[position];
            if(playerAtCell === 0){
                if(winner){
                    continue;
                }
                possibilities.push(new Possibility(
                    cell,
                    this,
                    gameState.playPosition(position)
                ));
                continue;
            }
            if(playerAtCell === Player.X){
                xes.push(new X(cell, this));
                continue;
            }
            cell.displayO();
        }
        if(winner){
            grid.displayWinner(winner);
        }
    }

    private setWinner(winner: Player): void{
        if(winner === this.winner){
            return;
        }
        this.winner = winner;
        this.setTheme(this.theme);
    }

    private showPossibility(possibility: Possibility): {tictactoe: TicTacToeImpl, winner: Winner | undefined}{
        const index = this.possibilities.indexOf(possibility);
        this.possibilities.splice(index, 1);
        possibility.destroy();

        const winner = possibility.gameState.findWinner();
        const tictactoe = new TicTacToeImpl(
            this,
            possibility.gameState,
            winner,
            this.theme,
            possibility.cell.displayGrid(),
            possibility.cell
        );
        return { tictactoe, winner };
    }

    private removeTicTacToe(tictactoe: TicTacToeImpl): void {
        const index = this.ticTacToes.indexOf(tictactoe);
        this.ticTacToes.splice(index, 1);
        tictactoe.destroy();
        const cell = tictactoe.gridCell!;
        const possibility = new Possibility(
            cell,
            this,
            tictactoe.gameState
        )
        this.possibilities.push(possibility);
    }

    private getRevealedPosition(): RevealedPosition{
        return {
            gameState: this.gameState,
            winner: this.winner ? {
                player: this.winner,
                gameState: this.gameState
            } : undefined
        }
    }


    public setTheme(theme: Theme): void {
        const currentPlayer = this.gameState.getCurrentPlayer();
        const isLosing = this.winner === currentPlayer;
        const isWinning = this.isWin || this.winner === otherPlayer(currentPlayer);
        const newTheme = isWinning ? theme.winnerTheme : isLosing ? theme.loserTheme : theme;
        this.theme = newTheme;
        this.grid?.setTheme(newTheme)
        this.ticTacToes.forEach((tictactoe) => tictactoe.setTheme(newTheme))
    }

    public notifyRevealedPosition(position: RevealedPosition): void{
        const revealedTicTacToePositions = this.ticTacToes.map(t => t.getRevealedPosition())
        const ownRevealedPosition = this.getRevealedPosition();
        const combined = addToRevealedPosition(position, ownRevealedPosition, revealedTicTacToePositions);
        this.parent.notifyRevealedPosition(combined);
    }

    public hideState(state: GameState): void {
        const split = [...splitGameState(state, this.gameState)];
        for(const tictactoe of this.ticTacToes.slice()){
            const hasSplitGameState = split.some(s => s.state.equals(tictactoe.gameState));
            if(hasSplitGameState){
                this.removeTicTacToe(tictactoe);
                continue;
            }
            const descendant = split.find(s => s.state.indexOfPredecessor(tictactoe.gameState) > -1);
            if(descendant){
                tictactoe.hideState(descendant.state)
            }
        }
    }

    public revealPosition(position: RevealedPosition): void{
        const winner = position.winner;
        if(winner && this.gameState.indexOfPredecessor(winner.gameState) > -1){
            this.setWinner(winner.player);
        }
        if(position.gameState.equals(this.gameState)){
            return;
        }
        const split = [...splitRevealedPosition(position, this.gameState)];
        const newTicTacToes: TicTacToeImpl[] = [];
        for(const possibility of this.possibilities.slice()){
            const positionForPossibility = split.find(p => p.gameState.indexOfPredecessor(possibility.gameState) > -1);
            if(!positionForPossibility){
                continue;
            }
            const {tictactoe} = this.showPossibility(possibility);
            newTicTacToes.push(tictactoe);
            tictactoe.revealPosition(positionForPossibility);
        }
        for(const tictactoe of this.ticTacToes){
            const positionForTicTacToe = split.find(p => p.gameState.indexOfPredecessor(tictactoe.gameState) > -1);
            if(!positionForTicTacToe){
                continue;
            }
            tictactoe.revealPosition(positionForTicTacToe);
        }
        this.ticTacToes.push(...newTicTacToes);
    }

    public notifyXDoubleClicked(): void {
        this.parent.notifyHiddenState(this.gameState);
    }

    public notifyHiddenState(state: GameState): void {
        this.parent.notifyHiddenState(state);
    }

    public play(possibility: Possibility): void {
        const { tictactoe, winner } = this.showPossibility(possibility);
        this.ticTacToes.push(tictactoe);
        if(winner){
            this.setWinner(winner.player);
        }
        this.parent.notifyRevealedPosition({
            gameState: possibility.gameState,
            winner: winner ? {
                player: winner.player,
                gameState: this.gameState
            } : undefined
        })
    }

    public destroy(): void {
        this.ticTacToes.forEach(t => t.destroy());
        this.possibilities.forEach(p => p.destroy())
        this.xes.forEach(x => x.destroy())
        this.gridCell?.clear()
    }
}