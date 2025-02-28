export enum Player{
    X = 1,
    O = 2
}

export function otherPlayer(player: Player): Player{
    return (player % 2) + 1
}