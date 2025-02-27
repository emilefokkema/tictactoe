export enum GridBorderSection {
    Beginning = 0,
    Middle = 1,
    End = 2
}

export enum GridBorderSide {
    Left = 0,
    Right = 4
}

export enum GridBorderPart {
    BeginningLeft = GridBorderSection.Beginning | GridBorderSide.Left,
    BeginningRight = GridBorderSection.Beginning | GridBorderSide.Right,
    MiddleLeft = GridBorderSection.Middle | GridBorderSide.Left,
    MiddleRight = GridBorderSection.Middle | GridBorderSide.Right,
    EndLeft = GridBorderSection.End | GridBorderSide.Left,
    EndRight = GridBorderSection.End | GridBorderSide.Right
}

export function getSection(part: GridBorderPart): GridBorderSection{
    return part & 3;
}

export function getSide(part: GridBorderPart): GridBorderSide{
    return part & 4;
}