import { describe, it, expect } from 'vitest'
import { PositionSet } from '../src/scripts/state/position-set'
import { RotateLeft } from '../src/scripts/transformations';
import { Player } from '../src/scripts/player';

describe('a position set', () => {

    it('should transform', () => {
        const positionSet = PositionSet.fromPlayedPositions([0, 1, 2]);

        const result = [...positionSet.transform(RotateLeft).getPlayersAtPositions()];

        expect(result).toEqual([Player.X, 0, 0, Player.O, 0, 0, Player.X, 0, 0])
    })
})