import { describe, it, expect, beforeEach } from 'vitest'
import { ClonedGameState, GameState } from '../src/scripts/page/state/game-state'
import { Player } from '../src/scripts/page/player';
import { MAIN_DIAGONAL } from '../src/scripts/page/three';
import { gameStateWithPositions } from './game-state-with-positions';

describe('a game state', () => {

    it('should have a current player', () => {
        let state = GameState.initial;

        expect(state.getCurrentPlayer()).toBe(Player.X)

        state = state.playPosition(1);

        expect(state.getCurrentPlayer()).toBe(Player.O)
    })

    it('should return player at position', () => {
        const state = GameState.initial.playPosition(0).playPosition(1);

        const playersAtPositions = [...state.getPlayersAtPositions()];
        expect(playersAtPositions[0]).toBe(Player.X);
        expect(playersAtPositions[1]).toBe(Player.O);
        expect(playersAtPositions[2]).toBe(0)
    })

    it.each<[GameState, GameState[]]>([
        [
            GameState.initial,
            [
                GameState.initial.playPosition(0),
                GameState.initial.playPosition(1),
                GameState.initial.playPosition(4)
            ]
        ],
        [
            gameStateWithPositions([0, 5, 2, 1, 4, 3]),
            [
                gameStateWithPositions([0, 5, 2, 1, 4, 3, 6]),
                gameStateWithPositions([0, 5, 2, 1, 4, 3, 7])
            ]
        ],
        [
            gameStateWithPositions([0, 4]),
            [
                gameStateWithPositions([0, 4, 1]),
                gameStateWithPositions([0, 4, 2]),
                gameStateWithPositions([0, 4, 5]),
                gameStateWithPositions([0, 4, 8]),
            ]
        ],
        [
            gameStateWithPositions([0, 4, 8]),
            [
                gameStateWithPositions([0, 4, 8, 1]),
                gameStateWithPositions([0, 4, 8, 2]),
            ]
        ],
        [
            gameStateWithPositions([0, 1]),
            [
                gameStateWithPositions([0, 1, 2]),
                gameStateWithPositions([0, 1, 3]),
                gameStateWithPositions([0, 1, 4]),
                gameStateWithPositions([0, 1, 5]),
                gameStateWithPositions([0, 1, 6]),
                gameStateWithPositions([0, 1, 7]),
                gameStateWithPositions([0, 1, 8]),
            ]
        ],
        [
            gameStateWithPositions([0, 4, 2]),
            [
                gameStateWithPositions([0, 4, 2, 1]),
                gameStateWithPositions([0, 4, 2, 3]),
                gameStateWithPositions([0, 4, 2, 6]),
                gameStateWithPositions([0, 4, 2, 7]),
            ]
        ]
    ])('%j should have nonequivalent successors', (state, expectedNonequivalentSuccessors) => {
        expect(state.getNonequivalentSuccessors()).toEqual(expectedNonequivalentSuccessors)
    })

    it('should return players at positions', () => {
        const state = GameState.initial
            .playPosition(0)
            .playPosition(1)
            .playPosition(8)
            .playPosition(4)
            .playPosition(7)
            .playPosition(6)
            .playPosition(2)
            .playPosition(5)
            .playPosition(3)
        
        expect([...state.getPlayersAtPositions()]).toEqual([
            Player.X,
            Player.O,
            Player.X,
            Player.X,
            Player.O,
            Player.O,
            Player.O,
            Player.X,
            Player.X
        ])
    })

    it('should equal', () => {
        const state1 = GameState.initial.playPosition(2).playPosition(6);
        const state2 = GameState.initial.playPosition(2).playPosition(6);
        const state3 = GameState.initial.playPosition(2).playPosition(7);

        expect(state1.equals(state2)).toBe(true)
        expect(state1.equals(state3)).toBe(false)
    })

    it('should not have a winner', () => {
        const state = GameState.initial.playPosition(0).playPosition(4);

        expect(state.findWinner()).toBe(undefined);
    })

    it('should have a winner', () => {
        const state = GameState.initial
            .playPosition(0)
            .playPosition(1)
            .playPosition(3)
            .playPosition(6)
            .playPosition(4)
            .playPosition(5)
            .playPosition(8)
        const winner = state.findWinner();

        expect(winner.player).toBe(Player.X);
        expect(winner.three).toBe(MAIN_DIAGONAL)
    })

    it.each<[GameState, GameState, GameState | undefined]>([
        [
            gameStateWithPositions([0]),
            gameStateWithPositions([0]),
            gameStateWithPositions([0])
        ],
        [
            gameStateWithPositions([0]),
            gameStateWithPositions([2]),
            gameStateWithPositions([2])
        ],
        [
            gameStateWithPositions([0]),
            gameStateWithPositions([8]),
            gameStateWithPositions([8])
        ],
        [
            gameStateWithPositions([0]),
            gameStateWithPositions([6]),
            gameStateWithPositions([6])
        ],
        [
            gameStateWithPositions([0, 1, 4, 3, 2, 5]),
            gameStateWithPositions([0, 1, 4, 3, 6, 7]),
            gameStateWithPositions([0, 1, 4, 3, 6, 7])
        ],
        [
            gameStateWithPositions([0, 4, 2]),
            gameStateWithPositions([0, 4, 6]),
            gameStateWithPositions([0, 4, 6])
        ],
        [
            gameStateWithPositions([0, 1, 4, 3, 2, 5, 8]),
            gameStateWithPositions([0, 1, 4, 3, 6, 7, 8]),
            gameStateWithPositions([0, 1, 4, 3, 6, 7, 8])
        ],
        [
            gameStateWithPositions([0, 1, 3]),
            gameStateWithPositions([2, 1, 5, 8]),
            gameStateWithPositions([2, 1, 5]),
        ]
    ])('state %j with same lineage as %j should be %j', (state, otherState, expectedEquivalent) => {
        expect(state.getEquivalentWithSameLineage(otherState)).toEqual(expectedEquivalent)
    })

    describe('state [0, 4, 2, 6, 8, 3, 5]', () => {
        let state: GameState;

        beforeEach(() => {
            state = gameStateWithPositions([0, 4, 2, 6, 8, 3, 5])
        })

        it.each<[GameState, GameState | undefined]>([
            [
                gameStateWithPositions([0, 4, 2, 6, 8, 3, 5]),
                gameStateWithPositions([0, 4, 2, 6, 8, 3, 5])
            ],
            [
                gameStateWithPositions([4]),
                undefined
            ],
            [
                gameStateWithPositions([2]),
                gameStateWithPositions([2, 4, 8, 0, 6, 1, 7])
            ],
            [
                gameStateWithPositions([2, 4, 0]),
                gameStateWithPositions([2, 4, 0, 8, 6, 5, 3])
            ],
            [
                gameStateWithPositions([2, 4, 0, 6]),
                gameStateWithPositions([2, 4, 0, 6, 8, 3, 5])
            ],
            [
                gameStateWithPositions([2, 4, 0, 5]),
                undefined
            ]
        ])('with same lineage as %j should be %j', (predecessor, expectedEquivalent) => {
            expect(state.getEquivalentWithSameLineage(predecessor)).toEqual(expectedEquivalent)
        })
    })

    it.each<[number, GameState]>([
        [10, GameState.initial.playPosition(8)],
        [170, GameState.initial.playPosition(8).playPosition(7)]
    ])('%d should be rivivable to game state %j', (positions, expectedState) => {
        const impossible: ClonedGameState = {positions};
        const revived = GameState.reviveCloned(impossible);
        expect(revived).toEqual(expectedState);
    })
})