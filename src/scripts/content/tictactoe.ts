import { GameState } from "../state/game-state";
import { Cell, Grid } from "./grid/grid";
import { getMarkLineWidth } from "../measurements";
import { otherPlayer, Player } from "../player";
import { Possibility, PossibilityParent } from "./possibility";
import { O } from "./o";
import { X } from "./x";
import { Mark } from "./mark";
import { Point } from "../point";
import { Win } from "./win";
import { Theme } from "../themes";
import { Renderer } from "../renderer/types";
import { GridCellMeasurements } from "./grid/types";
import { Winner } from "../winner";
import { addToRevealedPosition, RevealedPosition, splitRevealedPosition } from "../state/revealed-position";
import { CustomPointerEventTarget } from "../events/types";

export interface TicTacToeParent {
    notifyRevealedPosition(position: RevealedPosition): void
}

export class TicTacToe implements PossibilityParent, TicTacToeParent {
    private theme: Theme
    private win: Win | undefined;
    private readonly possibilities: Possibility[]
    private readonly marks: Mark[]
    private readonly ticTacToes: TicTacToe[] = []
    private grid: Grid | undefined;
    public winner: Player | undefined;
    public isWin: boolean;

    public constructor(
        private readonly parent: TicTacToeParent,
        private readonly eventTarget: CustomPointerEventTarget,
        private readonly renderer: Renderer,
        measurements: GridCellMeasurements,
        theme: Theme,
        public readonly gameState: GameState,
        winner: Winner | undefined,
        private readonly gridCell: Cell | undefined
    ){
        const actualTheme = winner ? theme.winnerTheme : theme;
        this.theme = actualTheme;
        const grid = this.grid = new Grid(measurements, actualTheme)
        const possibilities: Possibility[] = this.possibilities = [];
        const marks: Mark[] = this.marks = [];
        const playersAtPositions = [...gameState.getPlayersAtPositions()];
        if(winner){
            this.winner = winner.player;
        }
        this.isWin = !!winner;
        
        gridCell?.setTheme(actualTheme)
        let winnerStartPoint: Point | undefined;
        for(let position = 0; position < 9; position++){
            const cell = grid.cells[position]
            const measurements = cell.measurements;
            const playerAtCell = playersAtPositions[position];
            if(playerAtCell === 0){
                if(winner){
                    continue;
                }
                const newGameState = gameState.playPosition(position)
                possibilities.push(new Possibility(eventTarget.addChildForArea(measurements), this, measurements, newGameState, position))
                continue;
            }
            const mark: Mark = playerAtCell === Player.X
                ? new X(measurements, actualTheme)
                : new O(measurements, actualTheme);
            
            marks.push(mark);
            
            if(winner && position === winner.three.positions[0]){
                winnerStartPoint = mark.getWinStart(winner.three);
            }
            if(winnerStartPoint && winner && position === winner.three.positions[2]){
                this.win = new Win(
                    actualTheme,
                    winnerStartPoint,
                    mark.getWinEnd(winner.three),
                    getMarkLineWidth(grid.cellSize)
                )
            }
        }
    }

    private setWinner(winner: Player): void{
        this.winner = winner;
        this.setTheme(this.theme);
    }

    private showPossibility(possibility: Possibility): {tictactoe: TicTacToe, winner: Winner | undefined}{
        const index = this.possibilities.indexOf(possibility);
        this.possibilities.splice(index, 1);
        possibility.destroy();

        const position = possibility.position;
        const winner = possibility.gameState.findWinner();
        const tictactoe = new TicTacToe(
            this,
            this.eventTarget.addChildForArea(possibility.measurements),
            this.renderer,
            possibility.measurements,
            this.theme,
            possibility.gameState,
            winner,
            this.grid?.cells[position]
        );
        return { tictactoe, winner }
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

    public setTheme(theme: Theme): void{
        const currentPlayer = this.gameState.getCurrentPlayer();
        const isLosing = this.winner === currentPlayer;
        const isWinning = this.isWin || this.winner === otherPlayer(currentPlayer);
        const newTheme = isWinning ? theme.winnerTheme : isLosing ? theme.loserTheme : theme;
        this.theme = newTheme;
        this.win?.setTheme(newTheme);
        this.marks.forEach(m => m.setTheme(newTheme))
        this.gridCell?.setTheme(newTheme)
        this.grid?.setTheme(newTheme)
        this.ticTacToes.forEach((tictactoe) => tictactoe.setTheme(newTheme))
    }

    

    public notifyRevealedPosition(position: RevealedPosition): void{
        const revealedTicTacToePositions = this.ticTacToes.map(t => t.getRevealedPosition())
        const ownRevealedPosition = this.getRevealedPosition();
        const combined = addToRevealedPosition(position, ownRevealedPosition, revealedTicTacToePositions);
        this.parent.notifyRevealedPosition(combined);
    }

    public showPosition(position: RevealedPosition): void{
        const winner = position.winner;
        if(winner && this.gameState.indexOfPredecessor(winner.gameState) > -1){
            this.setWinner(winner.player);
        }
        const split = [...splitRevealedPosition(position, this.gameState)];
        const newTicTacToes: TicTacToe[] = [];
        for(const possibility of this.possibilities.slice()){
            const positionForPossibility = split.find(p => p.gameState.indexOfPredecessor(possibility.gameState) > -1);
            if(!positionForPossibility){
                continue;
            }
            const {tictactoe} = this.showPossibility(possibility);
            newTicTacToes.push(tictactoe)
        }
        for(const tictactoe of this.ticTacToes){
            const positionForTicTacToe = split.find(p => p.gameState.indexOfPredecessor(tictactoe.gameState) > -1);
            if(!positionForTicTacToe){
                continue;
            }
            tictactoe.showPosition(positionForTicTacToe);
        }
        this.ticTacToes.push(...newTicTacToes);
    }

    public draw(ctx: CanvasRenderingContext2D): void{
        this.grid?.drawCells(ctx)
        this.ticTacToes.forEach(t => t.draw(ctx))
        this.marks.forEach(m => m.draw(ctx))
        this.win?.draw(ctx)
        this.grid?.drawBorders(ctx);
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
        this.renderer.rerender();
    }
}