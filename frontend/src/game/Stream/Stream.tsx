
import { useContext, useEffect, useRef, useState } from 'react'
import './style/Stream.css';
import { UserContext, currentUserType } from '../../auth/userContext';
import { Ball, Player } from '../interface/game';
import { G_Table, draw } from '../GameData/gameData';
import webSocket from '../../auth/Socket/Socket';
import { EndGame } from '../Game';

type listStreamInfo = {
    avatar: string,
    username: string,
    roomid: string,
}
interface Streaminfo {
    p1: Player,
    p2: Player,
    ball: Ball,
    roomId: string,
    setInStream: any
}

export function LiveStream({ p1, p2, ball, roomId, setInStream }: Streaminfo) {
    document.getElementById('root')?.classList.add('small-side-bar');
    const socket = webSocket.getSocket();
    const canvasRef = useRef(null);
    const [endGame, setEndGame] = useState(false);
    socket?.off('live-Stream').on('live-Stream', (args) => {
        if (args.isEnd) {
            // console.log('stream event ****** - ', args);
            setEndGame(true);
            // setInStream(false)
            return;
        }

        p1 = args.p1;
        p2 = args.p2;
        ball = args.b;
        ball.x *= G_Table.WIDTH_TABLE / 800;
        p2.x = G_Table.WIDTH_TABLE - G_Table.PLAYER_WIDTH;
        socket?.emit(`play-game`, { roomId: roomId });
    });
    socket?.emit(`play-game`, { roomId: roomId });
    function resizeCanvas() {
        const canvas: any = document.getElementById('canvas');
        G_Table.WIDTH_TABLE = (window.innerWidth >= 1200 ? 1200 : window.innerWidth) - 180;
        if (canvas)
            canvas.width = G_Table.WIDTH_TABLE;
        p2.x = G_Table.WIDTH_TABLE;
    }
    useEffect(() => {
        let frame: number;
        const canvas: any = canvasRef.current;

        const ctx = canvas.getContext('2d');
        // console.log('--- rander ---');
        window.addEventListener('resize', resizeCanvas, false);

        const rander = () => {
            if (endGame)
                return;
            if (ctx && p1 && p2 && ball) {
                draw(ctx, p1, p2, ball);
            }
            frame = window.requestAnimationFrame(rander);
        }
        frame = window.requestAnimationFrame(rander);

        return () => {
            // console.log('stream destry---');
            window.cancelAnimationFrame(frame);
            window.removeEventListener("resize", resizeCanvas);
        }
    }, [draw])
    if (endGame)
        return <EndGame p1={p1} p2={p2}/>
    return <div className='game-container'>
        <div className='d-flex space-btw bg header-game'>
            <div className='d-flex row-center score'>
                <img src={p1.avatar} width={'30px'} alt='' />
                <p className=' mr-10'>{p1?.username.slice(0,10)}</p>
                <p className='pd-10 mr-5 border-gray'>{p1?.score}</p>
            </div>
            <div>
                <h1>Vs</h1>
            </div>
            <div className='d-flex row-center score'>
                <p className='pd-10 mr-5 border-gray'>{p2?.score}</p>
                <p className=' mr-10'>{p2?.username.slice(0,10)}</p>
                <img src={p2?.avatar} width={'30px'} alt='' />
            </div>
        </div>
        <canvas id='canvas' className='game' width={G_Table.WIDTH_TABLE} height={G_Table.HEIGTH_TABLE} ref={canvasRef} />
    </div>
}

function ListeStream(props: { user: any, handlingStream: (roomid: string) => void }) {
    return (
        <div className="live" onClick={() => props.handlingStream(props.user.roomId)}>
            <div className="user">
                <img src={props.user.avatar} alt='userImage' />
                <span>{props.user.nickName}</span>
            </div>
            <div className="streamDiv">

                <div className="stream-score">
                    <span> 1 </span>
                    <span> - </span>
                    <span> 3 </span>
                </div>
                <div className="stream-round">
                    <span>Round 3</span>
                </div>
            </div>

            <div className="user">
                <img src={props.user.avatar} alt='userImage' />
                <span>{props.user.username}</span>
            </div>
        </div>
    );
}

function Stream() {
    const [streamList, setStreamList] = useState<listStreamInfo[]>();
    const { fetchData }: any = useContext(UserContext) as currentUserType;
    let [streamInfo, setStream] = useState<Streaminfo>();
    const [inStream, setInStream] = useState(true);
    async function getStreamList(skip: string) {
        await fetchData(`/game/streamlist?take=12&skip=${skip}`).then((ress: listStreamInfo[]) => {
            // console.log('stream list', ress);
            setStreamList(ress);
        })
    }
    const handlingStream = async (roomid: string) => {
        // console.log('hundling stream', roomid);
        await fetchData(`/game/getStream/${roomid}`).then((ress: any) => {
            // console.log('stream info', ress)
            if (ress.inStream) {
                setStream(ress);
            }
        })
    }
    useEffect(() => {
        getStreamList('0');
        return () => {
        };
    }, [inStream]);
    if (inStream && streamInfo)
        return <LiveStream p1={streamInfo.p1} p2={streamInfo.p2} ball={streamInfo.ball} roomId={streamInfo.roomId} setInStream={setInStream} />
    else
        return (
            <div className="show-streams">
                <h1>All Streams</h1>
                <div className="stream-cards">
                    {streamList ? streamList.map((stream: listStreamInfo, i) => {
                        return (
                            <div key={`${i}${stream.roomid}`} className="stream">
                                <ListeStream user={stream} handlingStream={handlingStream} />
                            </div>
                        );
                    }) : null}
                </div>
            </div>
        );
}

export default Stream;