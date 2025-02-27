export type PositionIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export interface Transformation{
    positions: [
        PositionIndex, PositionIndex, PositionIndex,
        PositionIndex, PositionIndex, PositionIndex,
        PositionIndex, PositionIndex, PositionIndex,
    ]
}

export function combine({positions: one}: Transformation, {positions: other}: Transformation): Transformation{
    return {
        positions: [
            other[one[0]], other[one[1]], other[one[2]],
            other[one[3]], other[one[4]], other[one[5]],
            other[one[6]], other[one[7]], other[one[8]]
        ]
    }
}

export const Identity: Transformation = {
    positions: [0, 1, 2, 3, 4, 5, 6, 7, 8]
}

export const RotateLeft: Transformation = {
    positions: [6, 3, 0, 7, 4, 1, 8, 5, 2]
}

export const FlipHorizontal: Transformation = {
    positions: [2, 1, 0, 5, 4, 3, 8, 7, 6]
}

export const TurnUpsideDown = combine(RotateLeft, RotateLeft);

export const RotateRight = combine(TurnUpsideDown, RotateLeft);

export const FlipOtherDiagonal = combine(FlipHorizontal, RotateLeft)

export const FlipVertical = combine(FlipOtherDiagonal, RotateLeft);

export const FlipMainDiagonal = combine(FlipVertical, RotateLeft);

export const allTransformations = [
    Identity,
    RotateLeft,
    TurnUpsideDown,
    RotateRight,
    FlipHorizontal,
    FlipOtherDiagonal,
    FlipVertical,
    FlipMainDiagonal
];



