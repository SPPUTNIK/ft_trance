export type gameChecker = {
    inGame: boolean,
    inStream: boolean
}


export type Ball = {
    x: number,
    y: number,
    radius: number,
    velocityX: number,
    velocityY: number,
    color: string,
    speed: number,
}
export type Player = {
    id: string,
    username: string,
    avatar: string,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    score: number
}
type Table = {
    x: number,
    y: number,
    w: number,
    h: number,
}
type Game = { id: string, roomId: string, id_player1: string, id_player2: string }

export type GameInfo = {
    t: Table,
    b: Ball,
    p1: Player,
    p2: Player,
    isEnd: boolean,
    isStart: boolean,
    game: Game,
    roomId: string
}
