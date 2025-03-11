import { describe, beforeEach, it, expect, vi, type Mock } from 'vitest'
import type { TestPlayer } from './player/test-player';
import { createTestPlayer } from './player/test-player-impl';
import type { LocalMapPersister } from '@page/store/local-map-persister';
import type { TicTacToeMap } from '@page/map/tictactoemap';
import { createTicTacToeMap } from '@page/content/map'
import { MockTheme } from './mock-theme';
import { gameStateWithPositions } from './game-state-with-positions';
import type { SerializedTree } from '@shared/state/serialization';
import type { GameState } from '@shared/state/game-state';
import { MockBroadcastChannel } from './mock-broadcast-channel';
import type { SharedWork } from '@shared/sharedworker/shared-work';

describe('a tictactoe map', () => {
    const channel = new MockBroadcastChannel();
    const persister: LocalMapPersister = {
        persist(map: SerializedTree): void {
            serialized = map;
        },
        read(){
            return serialized;
        }
    };
    let sharedWorkStoreMapMock: Mock<() => Promise<unknown>>;
    let sharedWorkGetVerifiedStoredMapMock: Mock<() => Promise<unknown>>;
    let player: TestPlayer;
    let serialized: SerializedTree | undefined;
    let serializedInSharedWork: SerializedTree | undefined;
    let ticTacToeMap: TicTacToeMap;

    beforeEach(() => {
        vi.resetAllMocks();
        serialized = undefined;
        player = createTestPlayer();
        sharedWorkStoreMapMock = vi.fn().mockImplementation((map) => {
            serializedInSharedWork = map;
            return Promise.resolve();
        })
        sharedWorkGetVerifiedStoredMapMock = vi.fn().mockImplementation((map) => {
            serializedInSharedWork = map;
            return Promise.resolve(map);
        })
        ticTacToeMap = createTicTacToeMap(
            persister,
            channel,
            {
                sendRequest(method: keyof SharedWork, data: unknown){
                    if(method === 'getVerifiedStoredMap'){
                        // @ts-ignore
                        return sharedWorkGetVerifiedStoredMapMock(...data);
                    }else if(method === 'storeMap'){
                        // @ts-ignore
                        return sharedWorkStoreMapMock(...data);
                    }
                    throw new Error(`No mock defined for '${method}'`)
                }
            }
        );
        ticTacToeMap.renderOnGrid(
            player.grid
        )
    });

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

        it('should persist', () => {
            expect(serialized).toEqual({0:{1:{3:{6:{4:{5:{}}}}}}})
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
            player2.play(8);
            expect(player2.grid.toString()).toMatchSnapshot();
        })

        it('should reveal and display two winners when playing 6', () => {
            player2.play(6);
            expect(player2.grid.toString()).toMatchSnapshot();
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
            player013647.play(8);
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
                player0138.play(6);
                expect(player01.grid.toString()).toMatchSnapshot();
            })

            describe('and winner 01 is revealed', () => {

                beforeEach(() => {
                    player0138.play(6);
                })

                it('should delete states by double clicking', () => {
                    player013.grid.findByPosition([0])!.dblclick();
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
            player0216385.grid.findByPosition([5])!.dblclick();
            player0216384.grid.findByPosition([4])!.dblclick();
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

    describe('when playing 36450872', () => {
        let player3645087: TestPlayer;
        let player36450872: TestPlayer;

        beforeEach(() => {
            player3645087 = player
                .play(3)
                .play(6)
                .play(4)
                .play(5)
                .play(0)
                .play(8)
                .play(7);
            player36450872 = player3645087.play(2);
        })

        it('should look like this', () => {
            expect(player3645087.grid.toString()).toMatchSnapshot();
        })
    })

    describe('when playing 364517802', () => {
        let player36451780: TestPlayer;
        let player364517802: TestPlayer;

        beforeEach(() => {
            player36451780 = player
                .play(3)
                .play(6)
                .play(4)
                .play(5)
                .play(1)
                .play(7)
                .play(8)
                .play(0);
            player364517802 = player36451780.play(2);
        })

        it('should look like this', () => {
            expect(player36451780.grid.toString()).toMatchSnapshot();
        })
    })

    describe('when playing 0', () => {
        let player0: TestPlayer;

        beforeEach(() => {
            player0 = player.play(0);
        })

        it('should have notified the remote renderer', () => {
            expect(channel.messageMock).toHaveBeenCalledWith({type: 'staterevealed', data: gameStateWithPositions([0]).getSummary()})
        })

        describe('and then removing 0', () => {

            beforeEach(() => {
                player.grid.findByPosition([0, 0])!.dblclick();
            })

            it('should look like this', () => {
                expect(player.grid.toString()).toMatchSnapshot();
            })

            it('should have notified the remote renderer', () => {
                expect(channel.messageMock).toHaveBeenCalledWith({type: 'statehidden', data: gameStateWithPositions([0]).getSummary()})
            })
        })
    })

    describe('when it loads from this local storage state', () => {

        beforeEach(() => {
            serialized = {
                0:{
                    2:{
                        1:{
                            6:{
                                3:{
                                    5:{
                                        8:{
                                            7:{
                                                w:1
                                            },
                                            w:2
                                        }
                                    },
                                    w:2
                                },
                                w:1
                            }
                        },
                        3:{
                            6:{
                                w:1
                            },
                            w:1
                        },
                        w:1
                    }
                }
            };
            ticTacToeMap.load();
        })

        it('should look like this', () => {
            expect(player.grid.findByPosition([0, 2, 1, 6])!.grid.toString()).toMatchSnapshot();
            expect(player.grid.findByPosition([6, 0, 3, 8])!.grid.toString()).toMatchSnapshot();
        })
    })

    describe('when it loads from this local storage state 2', () => {

        beforeEach(() => {
            serialized = {0:{1:{3:{2:{6:{w:1},w:1},4:{6:{w:1},w:1},5:{6:{w:1},w:1},6:{4:{2:{5:{w:1},w:1},5:{8:{w:1},w:1},7:{5:{w:1},w:1},8:{5:{w:1},w:1},w:1},w:1},7:{6:{w:1},w:1},8:{6:{w:1},w:1},w:1},w:1}}};
            ticTacToeMap.load();
        })

        it('should look like this', () => {
            expect(player.grid.findByPosition([0, 1])!.grid.toString()).toMatchSnapshot();
        })
    })

    describe('when it loads from this local storage state 3', () => {

        beforeEach(() => {
            serialized = {0:{2:{1:{6:{3:{5:{8:{4:{w:2},7:{4:{w:1},w:1},w:2}},8:{w:2},w:2},4:{3:{8:{w:1},w:1},5:{8:{w:1},w:1},7:{8:{w:1},w:1},8:{7:{w:1},w:1},w:1},w:1}},3:{1:{6:{w:1},w:1},4:{6:{w:1},w:1},5:{6:{w:1},w:1},6:{4:{1:{5:{w:1},w:1},5:{8:{w:1},w:1},7:{8:{w:1},w:1},8:{5:{w:1},w:1},w:1},w:1},7:{6:{w:1},w:1},8:{6:{w:1},w:1},w:1},w:1}}};
            ticTacToeMap.load();
        })

        it('should look like this', () => {
            expect(player.grid.findByPosition([0, 2, 1, 6, 3, 5, 8, 7])!.grid.toString()).toMatchSnapshot();
        })
    })

    describe('when a state is revealed remotely', () => {

        beforeEach(() => {
            notifyRemoteStateRevealed(gameStateWithPositions([0]));
            notifyRemoteStateRevealed(gameStateWithPositions([0, 1]));
            notifyRemoteStateRevealed(gameStateWithPositions([0, 1, 3]));
            notifyRemoteStateRevealed(gameStateWithPositions([0, 1, 3, 2]));
            notifyRemoteStateRevealed(gameStateWithPositions([0, 1, 3, 2, 6]));
        })

        it('should look like this', () => {
            expect(player.grid.findByPosition([0, 1])!.grid.toString()).toMatchSnapshot();
        })

        it('should not have written to local storage', () => {
            expect(serialized).toBeUndefined();
        })

        describe('and then a state is hidden remotely', () => {

            beforeEach(() => {
                notifyRemoteStateHidden(gameStateWithPositions([0, 1, 3, 2, 6]))
            })

            it('should look like this', () => {
                expect(player.grid.findByPosition([0, 1])!.grid.toString()).toMatchSnapshot();
            })
    
            it('should not have written to local storage', () => {
                expect(serialized).toBeUndefined();
            })
        })
    })

    describe('when the stored state is corrected', () => {

        beforeEach(() => {
            sharedWorkGetVerifiedStoredMapMock.mockImplementation(() => {
                return Promise.resolve(serializedInSharedWork);
            })
            serialized = {0:{1:{w:2}}}
            serializedInSharedWork = {0:{1:{w:1}}}
            ticTacToeMap.load();
        })

        it('should have persisted the corrected map', () => {
            expect(serialized).toEqual({0:{1:{w:1}}})
        })
    })

    describe('when an impossible value is sent along the message channel', () => {

        beforeEach(() => {
            channel.messageHandler({data: {type: 'staterevealed', data: {positions: 10}}} as MessageEvent);
        })

        it('should look like this', () => {
            expect(player.grid.toString()).toMatchSnapshot();
        })
    })

    function notifyRemoteStateRevealed(state: GameState): void {
        channel.messageHandler({data: {type: 'staterevealed', data: state.getSummary()}} as MessageEvent)
    }

    function notifyRemoteStateHidden(state: GameState): void {
        channel.messageHandler({data: {type: 'statehidden', data: state.getSummary()}} as MessageEvent)
    }
})