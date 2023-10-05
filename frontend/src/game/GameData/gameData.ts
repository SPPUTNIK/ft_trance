import { Ball, Player } from "../interface/game";

export const G_Table = {
    WIDTH_TABLE: (window.innerWidth >= 1200 ? 1200 : window.innerWidth) - 180,
    HEIGTH_TABLE: 400,
    PLAYER_HEIGHT: 100,
    PLAYER_WIDTH: 15,
    COLOR_TABLE: 'black'
}

export const G_BALL = {
    x: G_Table.WIDTH_TABLE / 2,
    y: G_Table.HEIGTH_TABLE / 2,
    radius: 10,
    velocityX: 5,
    velocityY: 5,
    color: 'gray',
    speed: 1,
}

const PLAYER_HEIGHT = 100;
export let player = {
    // x: props.nbrplayer === 1 ? 0 : (props.nbrplayer === 0 ? 0 : G_Table.WIDTH_TABLE - PLAYER_WIDTH),
    x: 0,
    height: 100,
    width: 15,
    y: G_Table.HEIGTH_TABLE / 2 - PLAYER_HEIGHT / 2,
    color: "#d24d4d",
    score: 0,
}

function drawRect(ctx: any, x: number, y: number, w: number, h: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircale(ctx: any, x: number, y: number, r: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

export function draw(ctx: any, p1: Player, p2: Player, ball:Ball) {
    ctx.clearRect(0, 0, G_Table.WIDTH_TABLE, G_Table.HEIGTH_TABLE);
    drawRect(ctx, 0, 0, G_Table.WIDTH_TABLE, G_Table.HEIGTH_TABLE, G_Table.COLOR_TABLE);
    drawCircale(ctx, ball.x, ball.y, G_BALL.radius, G_BALL.color)
    //draw players
    drawRect(ctx, p1.x, p1.y, G_Table.PLAYER_WIDTH, PLAYER_HEIGHT, player.color);
    drawRect(ctx, p2.x, p2.y, G_Table.PLAYER_WIDTH, PLAYER_HEIGHT, 'gray');
    // console.log('drawing ------');
}
