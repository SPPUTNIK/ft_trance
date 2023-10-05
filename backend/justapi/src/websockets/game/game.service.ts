import { Injectable } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { PrismaService } from "src/prisma/prisma.service";

type Player = {
    id: string,
    username: string,
    avatar: string,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    score: number,
}
type Ball = {
    x: number,
    y: number,
    radius: number,
    velocityX: number,
    velocityY: number,
    color: string,
    speed: number,
}
type Table = {
    x: number,
    y: number,
    w: number,
    h: number,
}
type Game = { id: string, roomId: string, id_player1: string, id_player2: string }

type GameInfo = {
    t: Table,
    b: Ball,
    p1: Player,
    p2: Player,
    isEnd: boolean,
    isStart: boolean,
    game: Game,
    roomId: string
}

@Injectable()
export class GameService {
    constructor(private prisma: PrismaService) { }

    server: Server;
    private gameInfo: Map<string, GameInfo> = new Map();
    private game: Map<string, Game> = new Map();
    private idRandomList: string[] = new Array();

    async getNotifications(req, res) { /// update done
        const listnot = await this.prisma.notification.findMany({ where: { myid: req.user.id } });
        return res.send(listnot);
    }

    async getHistory(req, res, skip, take) {
        const userId = req.user.id;
        const history = await this.prisma.gameinfo.findMany({
            where: { myid: userId },
            skip: +skip,
            take: +take,
        });
        const user = await this.prisma.user.findMany({
            select :{
                point :true,
                lose: true,
                won: true,
                username: true,
                avatar : true,
                id : true
            }
        });
        // console.log('history', history)
        if (history)
            return res.send({ matches: history , rank : user});
        return res.sendStatus(404);
    }

    async getStreamList(res, skip, take) {
        const users = await this.prisma.user.findMany({
            skip: +skip,
            take: +take,
            where: {
                inGame: true
            },
            select: {
                roomId: true,
                username: true,
                avatar: true,
            },
            orderBy: {
                inGame: 'desc',
            },
            distinct: ['roomId']

        })
        // console.log('stream list', users.length);
        return res.send(users)
    }

    async getStream(res, roomid) {
        const Info = this.gameInfo.get(roomid.roomid);
        // console.log('roomid', roomid, Info);
        if (Info)
            return res.send({
                p1: Info.p1,
                p2: Info.p2,
                t: Info.t,
                b: Info.b,
                isEnd: Info.isEnd,
                inStream: true,
                roomId: roomid
            })
        else
            return res.send({ inStream: false });
    }

    async gamechecker(req, res) { /// update done
        const user = await this.prisma.user.findFirst({ where: { id: req.user.id } });
        if (user.inGame) {
            const Info = this.gameInfo.get(user.roomId);
            if (Info) {
                return res.send({
                    p1: Info.p1,
                    p2: Info.p2,
                    t: Info.t,
                    b: Info.b,
                    isEnd: Info.isEnd,
                    inGame: user.inGame,
                    inStream: false
                })
            }
        }
        return res.send({ inGame: user.inGame, inStream: false });
    }

    async getNewGame(client, req, body) {//// --- update Done 
        const reciverId = body.playerId;
        const senderId = req.user.id;
        // const sockReciver = this.Socketclients.get(reciverId);
        const friend = await this.prisma.user.findFirst({ where: { id: reciverId } });
        const user = await this.prisma.user.findFirst({ where: { id: senderId } });
        if (user.inGame)
            return client.emit('error', { startGame: false, message: 'you can\'t play two game' });
        if (!friend)
            return client.emit('error', { startGame: false, message: 'this player not found' });
        if (friend.inGame)
            return client.emit('error', { startGame: false, message: 'this user is already in game' });
        else if (!friend.online)
            return client.emit('error', { startGame: false, message: 'user did\'t not connected' });

        const not = await this.prisma.notification.create({ data: { myid: reciverId, playerid: senderId, name: user.username, avatar: user.avatar } });
        this.prisma.user.update({
            where: { id: senderId },
            data: { socketId: client.id },
        });
        client.emit('error', { message: 'wait player to join game !' });
        client.to(reciverId).emit('have-new-game', not);
    }

    /// --- save data when end match ---
    async setData(game, Info, client, senderId, isExit) {/// -- update done
        Info.isEnd = true;
        let theloseP1 = 0;
        let thewonP1 = 0;
        let theloseP2 = 0;
        let thewonP2 = 0;
        let ginfoP1;
        if (game.id_player1 !== 'robo')
            ginfoP1 = await this.prisma.gameinfo.findFirst({ where: { myid: game.id_player1, player2id: game.id_player2 } });
        const ginfoP2 = await this.prisma.gameinfo.findFirst({ where: { myid: game.id_player2, player2id: game.id_player1 } });
        if (ginfoP1) {
            theloseP1 = ginfoP1.lose;
            thewonP1 = ginfoP1.won;
        }
        if (ginfoP2) {
            theloseP2 = ginfoP2.lose;
            thewonP2 = ginfoP2.won;
        }

        if (Info.p1.score > 3 || (game.id_player2 === senderId && isExit)) {
            if (game.id_player1 !== 'robo') {
                await this.prisma.gameinfo.create({
                    data: {
                        myid: game.id_player1, player2id: game.id_player2, lose: theloseP1, won: thewonP1 + 1,
                        myscore: Info.p1.score.toString(), player2score: Info.p2.score.toString(),
                        player2name: Info.p2.username, player2avatar: Info.p2.avatar
                    }
                });
                await this.prisma.user.update({ where: { id: game.id_player1 }, data: { won: { increment: 1 }, point: { increment: 10 } } });

            }
            await this.prisma.gameinfo.create({
                data: {
                    myid: game.id_player2, player2id: game.id_player1, lose: theloseP2 + 1, won: thewonP2,
                    myscore: Info.p2.score.toString(), player2score: Info.p1.score.toString(),
                    player2name: Info.p1.username, player2avatar: Info.p1.avatar
                }
            });
            await this.prisma.user.update({ where: { id: game.id_player2 }, data: { lose: { increment: 1 }, point: { increment: -10 } } });

        }
        else {
            if (game.id_player1 !== 'robo') {
                await this.prisma.gameinfo.create({
                    data: {
                        myid: game.id_player1, player2id: game.id_player2, lose: theloseP1 + 1, won: thewonP1,
                        myscore: Info.p1.score.toString(), player2score: Info.p2.score.toString(),
                        player2name: Info.p2.username, player2avatar: Info.p2.avatar

                    }
                });
                await this.prisma.user.update({ where: { id: game.id_player1 }, data: { lose: { increment: 1 }, point: { increment: -10 } } });
            }
            await this.prisma.gameinfo.create({
                data: {
                    myid: game.id_player2, player2id: game.id_player1, lose: theloseP2, won: thewonP2 + 1,
                    myscore: Info.p2.score.toString(), player2score: Info.p1.score.toString(),
                    player2name: Info.p1.username, player2avatar: Info.p1.avatar
                }
            });
            await this.prisma.user.update({ where: { id: game.id_player2 }, data: { won: { increment: 1 }, point: { increment: 10 } } });

        }

        // console.log('p1 ----- ', Info.p1.id, '////////-----------//////////', 'p2 ----- ', Info.p2.id);
        if (client) {
            client.to(senderId === game.id_player1 ? game.id_player2 : game.id_player1).emit('game-over', Info);
            client.emit('game-over', Info);
        }
        this.gameInfo.delete(game.roomId);
        if (game.id_player1 !== 'robo') {
            await this.prisma.user.update({ where: { id: Info.p1.id }, data: { roomId: null, inGame: false } });
            this.game.delete(Info.p1.id);
        }
        await this.prisma.user.update({ where: { id: Info.p2.id }, data: { roomId: null, inGame: false } });
        this.game.delete(Info.p2.id);
    }

    async exitGame(client, req) {//// update done
        const senderId = req.user.id;
        const user = await this.prisma.user.findFirst({ where: { id: senderId } });

        const game = this.game.get(senderId);
        // console.log(' game -- ', game ? true : false);
        // console.log('game info', this.gameInfo.get(game?.roomId) ? true : false)
        const Info = this.gameInfo.get(game?.roomId);
        if (senderId && user.inGame && game && Info) {
            // console.log('exit game');
            this.setData(game, Info, client, senderId, true);
        }
        else {
            // console.log('clear game data')
            await this.prisma.user.update({ where: { id: senderId }, data: { roomId: null, inGame: false } });
            this.gameInfo.delete(game?.roomId);
            this.game.delete(senderId);
        }
    }

    async randomGame(client: Socket, req) {//// update done
        const userId = req.user.id;
        const user = await this.prisma.user.findFirst({ where: { id: userId } });
        if (user.inGame) {
            client.emit('error', 'you can\'t play more one game');
            return;
        }
        const PlayerId = this.idRandomList?.find((element) => element === userId);
        if (PlayerId)
            client.emit('error', 'wait player to join game');
        else if (this.idRandomList.length === 0) {
            this.idRandomList.push(userId);
            client.emit('error', 'wait player to join game');
        }
        else {
            const playerId: any = this.idRandomList.shift();
            const player = await this.prisma.user.findFirst({ where: { id: playerId }, select: { inGame: true, online: true } });

            if (player.online && !player.inGame)
                this.acceptGame(client, { id: 0, freindId: playerId }, req, true);
            else {
                client.emit('error', 'wait player to join game');
                this.idRandomList.push(userId);
            }
        }

    }

    async watchLive(client, roomId) {
        const Info = this.gameInfo.get(roomId);
        // if (Info && (Info?.p1.id === roomId || Info?.p2.id === roomId))
        //     return false;
        if (Info) {
            client.emit('live-Stream', {
                p1: Info.p1,
                p2: Info.p2,
                t: Info.t,
                b: Info.b,
                isEnd: Info.isEnd
            });
        }
        else {
            // console.log('this game is end');
            client.emit('live-Stream', {
                isEnd: true
            });
        }
        return true;
    }

    // -- when player 2 accept game or went to play with robo
    async acceptGame(client: Socket, body: { id: number, freindId: string }, req, random: boolean) {//// update done

        if (isNaN(body.id) && !random)
            client.emit('error', 'no player found')
        const playerSender = await this.prisma.notification.findFirst({ where: { id: body.id }, select: { playerid: true } });
        // console.log('requsete game', body, playerSender)
        let reciverId = playerSender?.playerid;
        if (body.freindId === 'robo')
            reciverId = 'robo';
        if (random)
            reciverId = body.freindId;
        const senderId = req.user.id;
        // --- don't forget to check player if online 
        const player = await this.prisma.user.findFirst({ where: { id: reciverId } });
        if (((playerSender || random) && player?.online) || reciverId === 'robo') {
            const user = await this.prisma.user.findFirst({ where: { id: senderId } });
            if (user.inGame)
                return client.emit('error', { message: 'you can"t play two game' })
            else if (player?.inGame)
                return client.emit('error', { message: `${player.username} already in game` })
            this.game.set(senderId, { id: reciverId, roomId: senderId + reciverId, id_player1: reciverId, id_player2: senderId });
            await this.prisma.user.update({ where: { id: senderId }, data: { roomId: senderId + reciverId, inGame: true, socketId: client.id } });

            if (reciverId !== 'robo') {
                this.game.set(reciverId, { id: reciverId, roomId: senderId + reciverId, id_player1: reciverId, id_player2: senderId });
                await this.prisma.user.update({ where: { id: reciverId }, data: { roomId: senderId + reciverId, inGame: true } });

                client.to(reciverId).emit('accept-game');
                if (!random)
                    await this.prisma.notification.delete({ where: { id: body.id } });
            }
            client.emit('accept-game');
            this.startGame(body, req, player);
        }
        else {
            // console.log('the user not want to play with you or user is not online')
            client.emit('error', 'can\'t start game');
            return;
        }
    }

    collision(b: Ball, p: Player) {/// update done 

        let b_top = b.y - b.radius;
        let b_bottom = b.y + b.radius;
        let b_left = b.x - b.radius;
        let b_right = b.x + b.radius;

        let p_top = p.y;
        let p_bottom = p.y + p.height;
        let p_left = p.x;
        let p_right = p.x + p.width;
        return (b_right > p_left && b_bottom > p_top && b_left < p_right && b_top < p_bottom);
    }

    async startGame(body: { id: number, freindId: string }, req, player) {/// update done

        const senderId = req.user.id;
        const reciverId = body.freindId;
        await this.prisma.user.update({ where: { id: senderId }, data: { inGame: true } });
        if (reciverId !== 'robo')
            await this.prisma.user.update({ where: { id: reciverId }, data: { inGame: true } });
        const user = await this.prisma.user.findFirst({ where: { id: req.user.id } });
        const game = this.game.get(senderId);
        // console.log('---- ', this.gameInfo.get(user?.roomId)?.isStart , roomId)
        if (this.gameInfo.get(user?.roomId)?.isStart) {
            // console.log('game data is already created.');
            return;
        }
        if (!game)
        {
            // console.log('you can\'t play this game.');
            return ;
        }
        // console.log('create game')
        // game variable
        const WIDTH_TABLE = 800;
        const HEIGTH_TABLE = 400;
        const PLAYER_HEIGHT = 100;
        const PLAYER_WIDTH = 15;
        const BALL_START_SPEED = 0.02;
        
        // game object
        const player1: Player = {
            id: game.id_player1,
            username: reciverId === 'robo' ? 'robo' : player.username,
            avatar: reciverId === 'robo' ? '/src/Components/Dashboard/style/welcome.png' : player.avatar,
            x: 0,
            y: HEIGTH_TABLE / 2 - PLAYER_HEIGHT / 2,
            width: PLAYER_WIDTH,
            height: PLAYER_HEIGHT,
            color: "#18153A",
            score: 0,
        }
        const player2: Player = {
            id: game.id_player2,
            username: user.username,
            avatar: user.avatar,
            x: WIDTH_TABLE - PLAYER_WIDTH,
            y: HEIGTH_TABLE / 2 - PLAYER_HEIGHT / 2,
            width: PLAYER_WIDTH,
            height: PLAYER_HEIGHT,
            color: "#18153A",
            score: 0,
        }
        const ball: Ball = {
            x: WIDTH_TABLE / 2,
            y: HEIGTH_TABLE / 2,
            radius: 10,
            velocityX: 5,
            velocityY: 5,
            color: "#0171d9",
            speed: BALL_START_SPEED,
        }
        const table: Table = {
            x: 0,
            y: 0,
            w: WIDTH_TABLE,
            h: HEIGTH_TABLE,
        }
        const GameInfo: GameInfo = {
            t: table,
            b: ball,
            p1: player1,
            p2: player2,
            isEnd: false,
            isStart: false,
            game: game,
            roomId: user.roomId
        }
        if (user.roomId)
            this.gameInfo.set(user.roomId, GameInfo);
        const Info = this.gameInfo.get(user.roomId);
        Info.isStart = true;
    }

    playGame(client: Socket, body: any, req) {//// updadte done
                // console.log('body game', body)
        // return;
        if (body?.roomId && this.watchLive(client, body.roomId.roomid))
            return;

        const senderId = req.user.id;
        const game = this.game.get(senderId);
        if (!game || (game.id_player1 !== senderId && game.id_player2 !== senderId)) {
            // console.log('we don"t have game for you');
            client.emit('get-player-info', {
                isEnd: true
            });
            return;
        }

        const reciverId = (senderId === game.id_player1 ? game.id_player1 : (senderId === game.id_player2 ? game.id_player2 : body.freindId));
        const BALL_DELTA_SPEED = 0.005;
        const BALL_START_SPEED = 0.02;
        const COM_LEVEL = 0.005;
        const Info = this.gameInfo.get(game.roomId);
        if (!Info)
            return;
        if (game.id_player1 === senderId)
            Info.p1.y = body.p_y;
        else if (game.id_player2 === senderId)
            Info.p2.y = body.p_y;
        if (!Info.isEnd && (game.id_player1 === senderId || game.id_player2 === senderId)) {
            //ball movement 
            Info.b.x += Info.b.velocityX * Info.b.speed;
            Info.b.y += Info.b.velocityY * Info.b.speed;

            // ball collision with top and bottom  
            if (Info.b.y + Info.b.radius > Info.t.h || Info.b.y - Info.b.radius < 0) {
                Info.b.velocityY = -Info.b.velocityY;
            }

            // // ball collition with players
            let selectedPlayer = Info.b.x < Info.t.w / 2 ? Info.p1 : Info.p2;
            if (this.collision(Info.b, selectedPlayer)) {
                var rad = 3.14 / 4;
                function mapRange(value, a, b, c, d) {
                    // first map value from (a..b) to (0..1)
                    value = (value - a) / (b - a);
                    // then map it from (0..1) to (c..d) and return it
                    return c + value * (d - c);
                }
                if (Info.b.x < Info.t.w / 2) {
                    if (Info.b.x < Info.p1.x + Info.p1.width + Info.b.radius) {
                        if (Info.b.y > Info.p1.y && Info.b.y < Info.p1.y + Info.p1.height) {
                            var diff = Info.b.y - Info.p1.y;
                            var angle = mapRange(diff, 0, Info.p1.height, -rad, rad);
                            Info.b.velocityX = 5 * Math.cos(angle);
                            Info.b.velocityY = 5 * Math.sin(angle);
                        }
                    }
                } else {
                    if (Info.b.x > Info.p2.x - Info.b.radius) {
                        if (Info.b.y > Info.p2.y && Info.b.y < Info.p2.y + Info.p1.height) {
                            var diff = Info.b.y - Info.p2.y;
                            var angle = mapRange(diff, 0, Info.p1.height, -rad, rad);
                            Info.b.velocityX = (5 * Math.cos(angle)) * -1;
                            Info.b.velocityY = 5 * Math.sin(angle);
                        }
                    }
                }

                // Info.b.velocityX = -Info.b.velocityX;
                // console.log('ball speed', Info.b.speed)
                Info.b.speed += BALL_DELTA_SPEED;
            }
            // computer movement 
            if (game.id_player1 === 'robo') {
                let targetPos = Info.b.y - Info.p1.height / 2;
                let currenPos = Info.p1.y;
                Info.p1.y = currenPos + (targetPos - currenPos) * COM_LEVEL;
            }

            // update score
            if (Info.b.x - Info.b.radius < 0) {
                Info.p2.score++;
                Info.b.x = Info.t.w / 2;
                Info.b.y = Info.t.h / 2;
                Info.b.speed = BALL_START_SPEED;
                Info.b.velocityX = -Info.b.velocityX;
                // console.log('p2 ++', Info.p1.score)
            } else if (Info.b.x + Info.b.radius > Info.t.w) {
                Info.p1.score++;
                Info.b.x = Info.t.w / 2;
                Info.b.y = Info.t.h / 2;
                Info.b.speed = BALL_START_SPEED;
                Info.b.velocityX = -Info.b.velocityX;
                // console.log('p1 ++', Info.p1.score)
            }
            // ----- end game
            if ((Info.p1.score > 3 || Info.p2.score > 3) && reciverId !== 'robo') {
                // console.log('end game sender id', senderId, ' reciver id = ', reciverId);
                this.setData(game, Info, client, senderId, false);
            }
        }

        client.emit('update-Game', {
            p1: Info.p1,
            p2: Info.p2,
            t: Info.t,
            b: Info.b,
            isEnd: Info.isEnd
        });

        if (game.id_player1 !== 'robo') {
            client.to(reciverId).emit('update-Game', {
                p1: Info.p1,
                p2: Info.p2,
                t: Info.t,
                b: Info.b,
                isEnd: Info.isEnd
            });
        }

        if (Info.isEnd) {
            // console.log('delete node from map game info')
            this.gameInfo.delete(game.roomId);
        }
    }
}
