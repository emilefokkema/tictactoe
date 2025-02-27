import { describe, it, expect } from 'vitest'
import { PositionSet } from '../src/scripts/page/state/position-set'
import { RotateLeft } from '../src/scripts/page/transformations';
import { Player } from '../src/scripts/page/player';

describe('a position set', () => {

    it('should transform', () => {
        const positionSet = PositionSet.fromPlayedPositions([0, 1, 2]);

        const result = [...positionSet.transform(RotateLeft).getPlayersAtPositions()];

        expect(result).toEqual([Player.X, 0, 0, Player.O, 0, 0, Player.X, 0, 0])
    })
})