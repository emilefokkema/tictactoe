import { describe, beforeEach, it, expect } from 'vitest'
import { createTicTacToeRoot, TicTacToeRoot } from '../src/scripts/content/tictactoe-root'
import { MockTheme } from './mock-theme';
import { RevealedPosition } from '../src/scripts/state/revealed-position';
import { Player } from '../src/scripts/player';
import { createTestPlayer } from './player/test-player-impl';
import { TestPlayer } from './player/test-player';
import { GameState } from '../src/scripts/state/game-state';
import { revealedPosition } from './revealed-position-builder';
import winner01Succinct from './fixtures/winner-0-1-succinct.json'
import manyLosersSuccinct from './fixtures/many-losers-succinct.json';
import { replayRecord } from './replay-record';

describe('a tictactoe', () => {
    let ticTacToe: TicTacToeRoot;
    let player: TestPlayer;
    
    beforeEach(() => {
        player = createTestPlayer();
        ticTacToe = createTicTacToeRoot(
            player.grid,
            new MockTheme()
        )
    })

    describe('when playing 0, 1, 3, 6, 4 and 5', () => {
        let player2: TestPlayer;

        beforeEach(() => {
            player2 = player
                .play(0)
                .play(1)
                .play(3)
                .play(6)
                .play(4)
                .play(5)
        });

        it('should show winner and loser', () => {
            player2.play(8);
            const grid013645 = player2.grid;
            expect(grid013645.toString()).toMatchSnapshot();
        })

        it('should reveal winner', () => {
            let revealedPosition: RevealedPosition;
            ticTacToe.addEventListener('positionrevealed', p => revealedPosition = p);
            player2.play(8);
            expect(revealedPosition).toEqual({
                gameState: player2.gameState.playPosition(8),
                winner: {
                    player: Player.X,
                    gameState: player2.gameState
                }
            })
        })


    })

    describe('when playing 0, 5, 2, 1, 4 and 3', () => {
        let player2: TestPlayer;

        beforeEach(() => {
            player2 = player
                .play(0)
                .play(5)
                .play(2)
                .play(1)
                .play(4)
                .play(3)
        });

        it('should reveal and display two winners when playing 8', () => {
            let revealedPosition: RevealedPosition;
            ticTacToe.addEventListener('positionrevealed', p => revealedPosition = p);
            player2.play(8);
            expect(player2.grid.toString()).toMatchSnapshot();
            expect(revealedPosition).toEqual({
                gameState: player2.gameState.playPosition(8),
                winner: {
                    player: Player.X,
                    gameState: player2.gameState
                }
            })
        })

        it('should reveal and display two winners when playing 6', () => {
            let revealedPosition: RevealedPosition;
            ticTacToe.addEventListener('positionrevealed', p => revealedPosition = p);
            player2.play(6);
            expect(player2.grid.toString()).toMatchSnapshot();
            expect(revealedPosition).toEqual({
                gameState: player2.gameState.playPosition(6),
                winner: {
                    player: Player.X,
                    gameState: player2.gameState
                }
            })
        })
    })

    describe('when playing 0, 1, 3, 6 and 4', () => {
        let player01: TestPlayer;
        let player013: TestPlayer;
        let player0136: TestPlayer;
        let player01364: TestPlayer;
        let player013647: TestPlayer;

        beforeEach(() => {
            player01 = player
                .play(0)
                .play(1);
            player013 = player01.play(3);
            player0136 = player013.play(6);
            player01364 = player0136.play(4)
            player01364.play(5).play(8);
            player01364.play(2).play(5);
            player01364.play(8).play(5);
            player013647 = player01364.play(7);
        })

        it('should show winner higher up', () => {
            let revealedPosition: RevealedPosition;
            ticTacToe.addEventListener('positionrevealed', p => revealedPosition = p);
            player013647.play(8);
            expect(revealedPosition).toEqual({
                gameState: player013647.gameState.playPosition(8),
                winner: {
                    gameState: player0136.gameState,
                    player: Player.X
                }
            })
            expect(player0136.grid.toString()).toMatchSnapshot();
        })

        describe('and 7 and 8', () => {
            let player0138: TestPlayer;

            beforeEach(() => {
                player013647.play(8);
                player013.play(4).play(6);
                player013.play(7).play(6);
                player013.play(2).play(6);
                player013.play(5).play(6);
                player0138 = player013.play(8)
            })

            it('should show winner even higher up', () => {
                let revealedPosition: RevealedPosition;
                ticTacToe.addEventListener('positionrevealed', p => revealedPosition = p);
                player0138.play(6);
                expect(revealedPosition).toEqual({
                    gameState: player0138.gameState.playPosition(6),
                    winner: {
                        gameState: player01.gameState,
                        player: Player.X
                    }
                })
                expect(player01.grid.toString()).toMatchSnapshot();
            })

            describe('and winner 01 is revealed', () => {

                beforeEach(() => {
                    player0138.play(6);
                })

                it('should delete states by double clicking', () => {
                    let hiddenState: GameState;
                    ticTacToe.addEventListener('statehidden', s => hiddenState = s);
                    player013.grid.findByPosition([0]).dblclick();
                    expect(hiddenState).toEqual(player013.gameState)
                    expect(player.grid.toString()).toMatchSnapshot();
                })
            })
        })
    })

    describe('when playing 0, 2, 1, 6, 3 and 8 and revealing the winner', () => {
        let player02: TestPlayer;
        let player0216: TestPlayer;
        let player02163: TestPlayer;
        let player021638: TestPlayer;

        beforeEach(() => {
            player02 = player
                .play(0)
                .play(2);
            player0216 = player02
                .play(1)
                .play(6)
            player02163 = player0216.play(3)
            player021638 = player02163.play(8);
            const player0216385 = player021638.play(5);
            const player0216384 = player021638.play(4);
            player0216385.play(4);
            player0216384.play(5);
            player0216385.grid.findByPosition([5]).dblclick();
            player0216384.grid.findByPosition([4]).dblclick();
        })

        it('should look like this', () => {
            expect(player02163.grid.toString()).toMatchSnapshot();
        })

        describe('and then winner 023 is revealed', () => {

            beforeEach(() => {
                const player023 = player02
                    .play(3)
                const player02364 = player023
                    .play(6)
                    .play(4);
                player02364.play(5).play(8);
                player02364.play(8).play(5);
                player02364.play(1).play(5);
                player02364.play(7).play(8);
                player023.play(1).play(6);
                player023.play(4).play(6);
                player023.play(5).play(6);
                player023.play(7).play(6);
                player023.play(8).play(6);
            })

            it('should look like this', () => {
                expect(player02163.grid.toString()).toMatchSnapshot();
            })

            describe('and then winner 02164 is revealed', () => {

                beforeEach(() => {
                    const player02164 = player0216.play(4);
                    player02164.play(3).play(8);
                    player02164.play(5).play(8);
                    player02164.play(7).play(8);
                    player02164.play(8).play(7);
                })

                it('should look like this', () => {
                    expect(player02163.grid.toString()).toMatchSnapshot();
                })

                describe('and then winner 02163584 is revealed', () => {
                    let player0216358: TestPlayer;

                    beforeEach(() => {
                        player0216358 = player02163.play(5).play(8);
                        player0216358.play(4);
                    })

                    it('should look like this', () => {
                        expect(player0216358.grid.toString()).toMatchSnapshot();
                    })

                    describe('and then winner 021635874 is revealed', () => {
                        let player02163587: TestPlayer;

                        beforeEach(() => {
                            player02163587 = player0216358.play(7);
                            player02163587.play(4);
                        })

                        it('should look like this', () => {
                            expect(player02163587.grid.toString()).toMatchSnapshot();
                        })
                    })
                })
            })
        })
    })

    describe('when it is told to reveal positions', () => {


        beforeEach(() => {
            const positions: RevealedPosition[] = [
                revealedPosition([0, 2, 1, 6, 3], Player.O),
                revealedPosition([0, 2, 3, 6], Player.X),
                revealedPosition([0, 2], Player.X),
                revealedPosition([0, 2, 1, 6], Player.X),
                revealedPosition([0, 2, 1, 6, 3, 5, 8], Player.O),
                revealedPosition([0, 2, 1, 6, 3, 5, 8, 7], Player.X),
            ];
            for(const position of positions){
                ticTacToe.revealPosition(position);
            }
        });

        it('should look like this', () => {
            expect(player.grid.findByPosition([0, 2, 1, 6]).grid.toString()).toMatchSnapshot();
            expect(player.grid.findByPosition([6, 0, 3, 8]).grid.toString()).toMatchSnapshot();
        })
    })

    describe('when it is told to reveal positions 2', () => {

        beforeEach(() => {
            replayRecord(ticTacToe, winner01Succinct);
        })

        it('should look like this', () => {
            expect(player.grid.findByPosition([0, 1]).grid.toString()).toMatchSnapshot();
        })
    })

    describe('when it is told to reveal positions 3', () => {

        beforeEach(() => {
            replayRecord(ticTacToe, manyLosersSuccinct);
        })

        it('should look like this', () => {
            expect(player.grid.findByPosition([0, 2, 1, 6, 3, 5, 8, 7]).grid.toString()).toMatchSnapshot();
        })
    })

    it('should reveal position', () => {
        const state0138 = GameState.initial
            .playPosition(0)
            .playPosition(1)
            .playPosition(3)
            .playPosition(8)
        const state01386 = state0138.playPosition(6);
        ticTacToe.revealPosition({
            gameState: state01386,
            winner: {
                gameState: state0138,
                player: Player.X
            }
        });
        const grid8750 = player.grid.findByPosition([8, 7, 5, 0]).grid;
        expect(grid8750.toString()).toMatchSnapshot();
    })
})