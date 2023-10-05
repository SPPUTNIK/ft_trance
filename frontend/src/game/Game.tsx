import { useContext, useEffect, useRef, useState } from 'react';
import './Game.scss';
import { UserContext, currentUserType } from '../auth/userContext';
import webSocket from '../auth/Socket/Socket';
import { Ball, Player, gameChecker } from './interface/game';
import { G_Table, draw, player } from './GameData/gameData';
import userInfo from '../auth/Socket/UserInfo';
import { NavLink, useNavigate } from 'react-router-dom';
import { ListOnlineUsers } from '../Components/Users/Users';

interface props {
  p1: Player,
  p2: Player,
  ball: Ball,
  isPlayerLeft: boolean,

}

interface GameHeaderInfo {
  p1: Player,
  p2: Player
}

function GameHeader({ p1, p2 }: GameHeaderInfo) {
  return <div className='d-flex space-btw bg header-game'>
    <div className='d-flex row-center score'>
      <img src={p1?.avatar} width={'30px'} alt='' />
      <p className=' mr-10'>{p1?.username}</p>
      <p className='pd-10 mr-5 border-gray'>{p1?.score}</p>
    </div>
    <div>
      <h1>Vs</h1>
    </div>
    <div className='d-flex row-center score'>
      <p className='pd-10 mr-5 border-gray'>{p2?.score}</p>
      <p className=' mr-10'>{p2?.username}</p>
      <img src={p2?.avatar} width={'30px'} alt='' />
    </div>
  </div>
}

function ChoiseGame(props: { setListUsers: any }) {
  const socket = webSocket.getSocket();
  const handleGame = (type: string) => {
    if (type)
      socket?.emit((type === 'random' ? 'random-game' : 'accept-game'), { id: 0, freindId: type });
  }

  return <div className=' game-option '>
    <div className='img-item item-friend'> <button className='btn btn-primary' onClick={() => props.setListUsers(true)}>Play with friend</button></div>
    <div className='img-item item-robo'> <button onClick={() => handleGame('robo')} className='btn btn-primary'>Play with robo</button></div>
    <div className='img-item item-random'> <button onClick={() => handleGame('random')} className='btn btn-primary'>Play random with friend</button></div>
  </div>
}

function CanvasGame({ p1, p2, ball, isPlayerLeft }: props) {
  const socket = webSocket.getSocket();
  const canvasRef = useRef(null);
  const [score, setScore] = useState<{ s1: number, s2: number }>({ s1: 0, s2: 0 });
  let p_y: number = 0;

  function resizeCanvas() {
    const canvas: any = document.getElementById('canvas');
    G_Table.WIDTH_TABLE = (window.innerWidth >= 1200 ? 1020 : window.innerWidth) - 180;
    G_Table.PLAYER_WIDTH = G_Table.WIDTH_TABLE * 15 / 800;
    if (canvas)
      canvas.width = G_Table.WIDTH_TABLE;
    // console.log('resize', G_Table.WIDTH_TABLE)
    if (isPlayerLeft)
      p2.x = G_Table.WIDTH_TABLE;
    else
      p1.x = G_Table.WIDTH_TABLE;
  }

  socket?.off('update-Game').on('update-Game', (args) => {
    // console.log('draw event ****** - ');
    if (args.isEnd)
      return;
    ball = args.b;
    p2 = args.p2;
    p1 = args.p1;
    if (isPlayerLeft) {
      ball.x *= G_Table.WIDTH_TABLE / 800;
      p2.x = G_Table.WIDTH_TABLE - G_Table.PLAYER_WIDTH;
    }
    else {
      ball.x = G_Table.WIDTH_TABLE - ball.x * G_Table.WIDTH_TABLE / 800;
      p2.x = 0;
      p1.x = G_Table.WIDTH_TABLE - G_Table.PLAYER_WIDTH;
    }
    if (p1.score > score.s1 || p2.score > score.s2)
      setScore({ s1: p1.score, s2: p2.score });
    // if (isPlayerLeft)
    //   p1.y = p_y;
    // else
    //   p2.y = p_y;
    //     draw(ctx, p1, p2, ball);
    socket?.emit(`play-game`, { roomId: null, p_y: p_y });
  });
  socket?.emit(`play-game`, { roomId: null, p_y: p_y });
  ///
  let frame : number;
  useEffect(() => {
    const canvas: any = canvasRef.current;

    const ctx = canvas.getContext('2d');
    // console.log('--- rander ---');
    window.addEventListener('resize', resizeCanvas, false);

    canvas.addEventListener("mousemove", (e: any) => {
      let rect = canvas.getBoundingClientRect();
      const top_c = e.clientY > rect.top + player.height / 2 - 10;
      const bottom_c = e.clientY < rect.bottom - player.height / 2 + 10;
      if (top_c && bottom_c)
        p_y = e.clientY - rect.top - player.height / 2;
    });

    const rander = () => {
      if (ctx && p1 && p2 && ball) {

        if (isPlayerLeft)
          p1.y = p_y;
        else
          p2.y = p_y;
        draw(ctx, p1, p2, ball);
      }
      frame = window.requestAnimationFrame(rander);
    }
    frame = window.requestAnimationFrame(rander);

    return () => {
      // console.log('canvas destry---');
      // window.cancelAnimationFrame(frame);
      canvas.removeEventListener("mousemove", () => { ; });
      window.removeEventListener("resize", resizeCanvas);
      // socket?.emit('exit-game');
    }

  }, [draw, score])
  return <div>
    {/* <GameHeader p1={isPlayerLeft ? p1 : p2} p2={isPlayerLeft ? p2 : p1}  /> */}
    <div className='d-flex space-btw bg header-game'>
      <div className='d-flex row-center score'>
        <img src={isPlayerLeft ? p1?.avatar : p2?.avatar} width={'30px'} alt='' />
        <p className=' mr-10'>{isPlayerLeft ? p1?.username.slice(0,10) : p2?.username.slice(0,10)}</p>
        <p className='pd-10 mr-5 border-gray'>{isPlayerLeft ? score.s1 : score.s2}</p>
      </div>
      <div>
        <h1>Vs</h1>
      </div>
      <div className='d-flex row-center score'>
        <p className='pd-10 mr-5 border-gray'>{isPlayerLeft ? score.s2 : score.s1}</p>
        <p className=' mr-10'>{isPlayerLeft ? p2?.username.slice(0,10) : p1?.username.slice(0,10)}</p>
        <img src={isPlayerLeft ? p2?.avatar : p1?.avatar} width={'30px'} alt='' />
      </div>
    </div>
    <canvas id='canvas' className='game' width={G_Table.WIDTH_TABLE} height={G_Table.HEIGTH_TABLE} ref={canvasRef} />
  </div>
}

function PlayGame(props: { gameInfo: any }) {
  const [gameOver, setGameover] = useState(false);
  const GameScore: any = useRef(null);
  // console.log('--- GAme ---')
  const socket = webSocket.getSocket();
  G_Table.WIDTH_TABLE = (window.innerWidth >= 1200 ? 1020 : window.innerWidth) - 180;
  G_Table.PLAYER_WIDTH = G_Table.WIDTH_TABLE * 15 / 800;

  const navigate = useNavigate();
  socket?.off('game-over').on('game-over', (args) => {
    // console.log('game over', args)
    setGameover(true);
    GameScore.current = args;
    navigate('/');
  });
  useEffect(() => {
    return () => {
      // console.log('destry game---');
      socket?.emit('exit-game')
    }
  }, [gameOver])
  let isPlayerLeft: boolean = false;
  if (props.gameInfo.p1)
    isPlayerLeft = userInfo?.getuser()?.id === props.gameInfo.p1.id;
  if (gameOver)
    return <EndGame p1={isPlayerLeft ? GameScore.current.p1 : GameScore.current.p2} p2={isPlayerLeft ? GameScore.current.p2 : GameScore.current.p1} />
  return <CanvasGame p1={props.gameInfo.p1} p2={props.gameInfo.p2} ball={props.gameInfo.b} isPlayerLeft={isPlayerLeft} />
}

export function EndGame({ p1, p2 }: GameHeaderInfo) {
  return <div className='d-flex-column clm-center w-50 row-center mr-auto '>
    <h1 className='d-flex clm-center'>
      End game
    </h1>
    <div className='d-flex-column row-center'>
      {p1.score > p2.score ? p1.username : p2.username} is Win
    </div>
    <div className='d-flex bg clm-center w-100'>

      <div className='d-flex row-center score'>
        <img src={p1?.avatar} width={'30px'} alt='' />
        <p className=' mr-10'>{p1?.username}</p>
        <p className='pd-10 mr-5 border-gray'>{p1?.score}</p>
      </div>
      <div>
        <h1>Vs</h1>
      </div>
      <div className='d-flex row-center score'>
        <p className='pd-10 mr-5 border-gray'>{p2?.score}</p>
        <p className=' mr-10'>{p2?.username}</p>
        <img src={p2?.avatar} width={'30px'} alt='' />
      </div>
    </div><NavLink className={'btn btn-primary mr-10 d-flex clm-center row-center w-25'} to={'/'}>Go Home</NavLink>
  </div>
}

export const StartGame = (props: { reload: boolean }) => {
  // console.log('--- start game ---');
  document.getElementById('root')?.classList.add('small-side-bar');
  const [gameInfo, setGameinfo] = useState<gameChecker>();
  const [listUsers, setListUsers] = useState(false);
  // const socket = webSocket.getSocket();
  const { fetchData } = useContext(UserContext) as currentUserType;

  async function checkGame() {
    await fetchData('/game/gamechecker').then((ress: any) => {
      setGameinfo(ress);
    })
  }

  useEffect(() => {
    checkGame();
    return () => { };
  }, [props])
  if (gameInfo?.inGame)
    return <div className='game-container'><PlayGame gameInfo={gameInfo} /></div>
  else
    return <div className='game-container'>
      {listUsers ? <ListOnlineUsers setListUsers={setListUsers} /> : null}
      <ChoiseGame setListUsers={setListUsers} />
    </div>
}