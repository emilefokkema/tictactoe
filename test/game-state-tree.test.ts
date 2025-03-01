import { describe, it, expect, beforeEach } from 'vitest'
import { GameStateTreeImpl } from '../src/scripts/shared/state/game-state-tree-impl'
import { gameStateWithPositions } from './game-state-with-positions'
import { Player } from '../src/scripts/shared/player';
import type { GameStateTree } from '@shared/state/game-state-tree';
import type { SerializedTree } from '@shared/state/serialization';


function stringifyTree(tree: GameStateTree | undefined): string {
    return JSON.stringify(tree, null, 2);
}
describe('a game state tree', () => {
    let tree: GameStateTree

    beforeEach(() => {
        tree = GameStateTreeImpl.initial;
    })

    describe('that adds 364517802', () => {
        let treeA: GameStateTree;

        beforeEach(() => {
            treeA = tree.addState(gameStateWithPositions([3, 6, 4, 5, 1, 7, 8, 0, 2]))
        })

        it('should look like this', () => {
            expect(stringifyTree(treeA.getForState(gameStateWithPositions([3, 6, 4, 5, 1, 7, 8, 0])))).toMatchSnapshot();
        })
        
    })

    describe('that adds 36450872 successively', () => {
        let treeA: GameStateTree;

        beforeEach(() => {
            treeA = tree
                .addState(gameStateWithPositions([3]))
                .addState(gameStateWithPositions([3, 6]))
                .addState(gameStateWithPositions([3, 6, 4]))
                .addState(gameStateWithPositions([3, 6, 4, 5]))
                .addState(gameStateWithPositions([3, 6, 4, 5, 0]))
                .addState(gameStateWithPositions([3, 6, 4, 5, 0, 8]))
                .addState(gameStateWithPositions([3, 6, 4, 5, 0, 8, 7]))
                .addState(gameStateWithPositions([3, 6, 4, 5, 0, 8, 7, 2]))
        })

        it('should look like this', () => {
            expect(stringifyTree(treeA)).toMatchSnapshot();
        })
    })

    describe('that adds state 0', () => {
        let tree0: GameStateTree;

        beforeEach(() => {
            tree0 = tree.addState(gameStateWithPositions([0]));
        })

        it('should have children', () => {
            expect(stringifyTree(tree0)).toMatchSnapshot();
        })

        describe('and then adds state 1 and 01', () => {
            let tree0_1: GameStateTree;
            let tree01_1: GameStateTree;

            beforeEach(() => {
                tree0_1 = tree0.addState(gameStateWithPositions([1]));
                tree01_1 = tree0_1.addState(gameStateWithPositions([0, 1]));
            })

            it('should do equality right', () => {
                const state01 = gameStateWithPositions([0, 1]);
                const state85 = gameStateWithPositions([8, 5]);
                const state7 = gameStateWithPositions([7]);
                const state1 = gameStateWithPositions([1])
                const tree01_1winner01 = tree01_1.addWinner(state01, Player.X);
                expect(tree01_1winner01.getForState(state01)!.equals(tree01_1.getForState(state01))).toBe(false);
                expect(tree01_1winner01.getForState(state01)!.equals(tree01_1.getForState(state01))).toBe(false);
                expect(tree01_1winner01.getForState(state85)!.equals(tree01_1.getForState(state85))).toBe(false);
                expect(tree01_1winner01.getForState(state85)!.equals(tree01_1winner01.getForState(state85))).toBe(true);
                expect(tree01_1.getForState(state7)!.equals(tree01_1winner01.getForState(state7))).toBe(true);
                expect(tree01_1winner01.getForState(state7)!.equals(tree01_1winner01.getForState(state1))).toBe(false);
            })

            it('should contain the same tree for state 5', () => {
                const forState5a = tree0_1.getForState(gameStateWithPositions([5]));
                const forState5b = tree01_1.getForState(gameStateWithPositions([5]));
                expect(forState5a!.equals(forState5b)).toBe(true);
            })
        })

        describe('that then adds the same state', () => {
            let tree0a: GameStateTree;

            beforeEach(() => {
                tree0a = tree0.addState(gameStateWithPositions([0]));
            })

            it('should return the same one', () => {
                expect(tree0a).toBe(tree0);
            })
        })

        describe('that then removes the state', () => {
            let treeA: GameStateTree;

            beforeEach(() => {
                treeA = tree0.removeState(gameStateWithPositions([0]))!;
            })

            it('should no longer have the child', () => {
                expect(stringifyTree(treeA)).toMatchSnapshot();
            })
        })

        describe('that adds 013 and then all winners', () => {
            let tree013: GameStateTree;

            beforeEach(() => {
                tree013 = tree0
                    .addState(gameStateWithPositions([0, 1, 3, 2]))
                    .addWinner(gameStateWithPositions([0, 1, 3, 2]), Player.X)
                    .addState(gameStateWithPositions([0, 1, 3, 4]))
                    .addWinner(gameStateWithPositions([0, 1, 3, 4]), Player.X)
                    .addState(gameStateWithPositions([0, 1, 3, 5]))
                    .addWinner(gameStateWithPositions([0, 1, 3, 5]), Player.X)
                    .addState(gameStateWithPositions([0, 1, 3, 6]))
                    .addWinner(gameStateWithPositions([0, 1, 3, 6]), Player.X)
                    .addState(gameStateWithPositions([0, 1, 3, 7]))
                    .addWinner(gameStateWithPositions([0, 1, 3, 7]), Player.X)
                    .addState(gameStateWithPositions([0, 1, 3, 8]))
                    .addWinner(gameStateWithPositions([0, 1, 3, 8]), Player.X)
            })

            it('should look like this', () => {
                expect(stringifyTree(tree013.getForState(gameStateWithPositions([0, 1])))).toMatchSnapshot();
            })
        })

        describe('that adds state 013645', () => {
            let tree013645: GameStateTree;

            beforeEach(() => {
                tree013645 = tree0.addState(gameStateWithPositions([0, 1, 3, 6, 4, 5]));
            })

            it('should look like this', () => {
                expect(stringifyTree(tree013645)).toMatchSnapshot();
            })

            describe('that adds winner 013645', () => {
                let tree013645w: GameStateTree;

                beforeEach(() => {
                    tree013645w = tree013645.addWinner(gameStateWithPositions([0, 1, 3, 6, 4, 5]), Player.X)
                })

                it('should look like this', () => {
                    expect(stringifyTree(tree013645w.getForState(gameStateWithPositions([0, 1, 3, 6, 4])))).toMatchSnapshot();
                })
            })

            describe('that adds 0136458', () => {
                let tree0136458: GameStateTree;

                beforeEach(() => {
                    tree0136458 = tree013645.addState(gameStateWithPositions([0, 1, 3, 6, 4, 5, 8]))
                })

                it('should look like this', () => {
                    expect(stringifyTree(tree0136458)).toMatchSnapshot();
                })

                describe('that adds the winner of 01364', () => {
                    let tree01364: GameStateTree;

                    beforeEach(() => {
                        tree01364 = tree0136458
                            .addState(gameStateWithPositions([0, 1, 3, 6, 4, 8, 5]))
                            .addState(gameStateWithPositions([0, 1, 3, 6, 4, 2, 8]))
                            .addState(gameStateWithPositions([0, 1, 3, 6, 4, 7, 8]))
                    })

                    describe('and then removes a winner in 01364', () => {
                        let tree01364a: GameStateTree;

                        beforeEach(() => {
                            tree01364a = tree01364.removeState(gameStateWithPositions([0, 1, 3, 6, 4, 7]))!
                        })

                        it('should look like this', () => {
                            expect(stringifyTree(tree01364a.getForState(gameStateWithPositions([0, 1, 3, 6])))).toMatchSnapshot();
                        })
                    })

                    describe('and then removes 01364', () => {
                        let tree0136: GameStateTree;

                        beforeEach(() => {
                            tree0136 = tree01364.removeState(gameStateWithPositions([0, 1, 3, 6, 4]))!;
                        })

                        it('should look like this', () => {
                            expect(stringifyTree(tree0136)).toMatchSnapshot();
                        })
                    })
                })
            })
        })
    })

    describe('that adds 0521436', () => {
        let tree0521436: GameStateTree;

        beforeEach(() => {
            tree0521436 = tree.addState(gameStateWithPositions([0, 5, 2, 1, 4, 3, 6]))
        })

        it('should look like this', () => {
            expect(stringifyTree(tree0521436.getForState(gameStateWithPositions([0, 5, 2, 1, 4, 3])))).toMatchSnapshot();
            expect(stringifyTree(tree0521436.getForState(gameStateWithPositions([0, 7, 6, 3, 4, 1])))).toMatchSnapshot();
            expect(stringifyTree(tree0521436.getForState(gameStateWithPositions([2, 3, 0, 1, 4, 5])))).toMatchSnapshot();
            expect(stringifyTree(tree0521436.getForState(gameStateWithPositions([2, 7, 8, 5, 4, 1])))).toMatchSnapshot();
            expect(stringifyTree(tree0521436.getForState(gameStateWithPositions([8, 1, 2, 5, 4, 7])))).toMatchSnapshot();
            expect(stringifyTree(tree0521436.getForState(gameStateWithPositions([8, 3, 6, 7, 4, 5])))).toMatchSnapshot();
            expect(stringifyTree(tree0521436.getForState(gameStateWithPositions([6, 5, 8, 7, 4, 3])))).toMatchSnapshot();
            expect(stringifyTree(tree0521436.getForState(gameStateWithPositions([6, 1, 0, 3, 4, 7])))).toMatchSnapshot();
        })
    })

    describe('that adds 01364', () => {
        let tree01364: GameStateTree;

        beforeEach(() => {
            tree01364 = tree.addState(gameStateWithPositions([0, 1, 3, 6, 4]))
        })

        it('should add winner for 01364', () => {
            const result = tree01364.findWinnerFor(gameStateWithPositions([0, 1, 3, 6, 4]));
            expect(stringifyTree(result)).toMatchSnapshot();
        })

        it('should add winner for 0136', () => {
            const result = tree01364.findWinnerFor(gameStateWithPositions([0, 1, 3, 6]));
            expect(stringifyTree(result)).toMatchSnapshot();
        })

        it('should add winner for 013', () => {
            const result = tree01364.findWinnerFor(gameStateWithPositions([0, 1, 3]));
            expect(stringifyTree(result)).toMatchSnapshot();
        })

        it('should add winner for 01', () => {
            const result = tree01364.findWinnerFor(gameStateWithPositions([0, 1]));
            expect(stringifyTree(result)).toMatchSnapshot();
        })
    })

    it.each<[SerializedTree, SerializedTree]>([
        [{9: {w: 1}}, {}],
        [{0: {0: {w: 1}}}, {0: {}}],
        [{0: {1: {0: {}}}}, {0: {1: {}}}],
        [{a: 9} as SerializedTree, {}],
        [{0: {1: {w: 3} as unknown as SerializedTree}}, {0: {1: {}}}],
        [{2: {1: {}}}, {0: {1: {}}}],
        [{8: {7: {6: {}}}}, {0: {1: {2: {}}}}]
    ])('should deserialize %j', (input, expectedSerialized) => {
        const tree = GameStateTreeImpl.fromJSON(input);
        expect(tree.toJSON()).toEqual(expectedSerialized)
    })
})