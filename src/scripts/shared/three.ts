export const ROW_ONE = {
    isRow: true,
    positions: [0, 1, 2]
} as const
export const ROW_TWO = {
    isRow: true,
    positions: [3, 4, 5]
} as const
export const ROW_THREE = {
    isRow: true,
    positions: [6, 7, 8]
} as const
export const COLUMN_ONE = {
    isColumn: true,
    positions: [0, 3, 6]
} as const
export const COLUMN_TWO = {
    isColumn: true,
    positions: [1, 4, 7]
} as const
export const COLUMN_THREE = {
    isColumn: true,
    positions: [2, 5, 8]
} as const
export const MAIN_DIAGONAL = {
    mainDiagonal: true,
    positions: [0, 4, 8]
} as const
export const OTHER_DIAGONAL = {
    otherDiagonal: true,
    positions: [2, 4, 6]
} as const
export type ThreeInColumn = 
    | typeof COLUMN_ONE
    | typeof COLUMN_TWO
    | typeof COLUMN_THREE

export type ThreeInRow = 
    | typeof ROW_ONE
    | typeof ROW_TWO
    | typeof ROW_THREE

export type Three = 
    | ThreeInRow
    | ThreeInColumn
    | typeof MAIN_DIAGONAL
    | typeof OTHER_DIAGONAL

export function isInRow(three: Three): three is ThreeInRow{
    return (three as ThreeInRow).isRow !== undefined;
}

export function isInColumn(three: Three): three is ThreeInColumn{
    return (three as ThreeInColumn).isColumn !== undefined;
}

export function isMainDiagonal(three: Three): three is typeof MAIN_DIAGONAL{
    return (three as typeof MAIN_DIAGONAL).mainDiagonal;
}

export function isOtherDiagonal(three: Three): three is typeof OTHER_DIAGONAL{
    return (three as typeof OTHER_DIAGONAL).otherDiagonal;
}

export function *getThrees(): Iterable<Three>{
    yield ROW_ONE;
    yield ROW_TWO;
    yield ROW_THREE;
    yield COLUMN_ONE;
    yield COLUMN_TWO;
    yield COLUMN_THREE;
    yield MAIN_DIAGONAL;
    yield OTHER_DIAGONAL;
}