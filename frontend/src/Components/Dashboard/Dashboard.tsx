import './Dashboard.css'
import Chart from './Chart';

// //image
import {RiHandCoinFill} from 'react-icons/ri';
import {BsCoin} from 'react-icons/bs';


import imgStream from './style/rack.jpg';
import userInfo, { User } from '../../auth/Socket/UserInfo';
import webSocket from '../../auth/Socket/Socket';
import { NavLink, useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { UserContext, currentUserType } from '../../auth/userContext';

//stars
import { TbTopologyStar2 , TbTopologyStar3} from 'react-icons/tb';
import { GiPirateCaptain, GiPirateFlag, GiStarfighter, GiSwissArmyKnife } from 'react-icons/gi';
import { PiStarOfDavidBold } from 'react-icons/pi';


//Grade
import { GiUpgrade } from 'react-icons/gi';

export const Dashboard = () => {
  document.getElementById('root')?.classList.remove('small-side-bar');


  const user : any = userInfo.getuser();
  const socket = webSocket.getSocket();
  const navigate = useNavigate();
  const [Matches, setMatches] = useState<{}[]>();
  const [rank, setRank] = useState<{}[]>();
  const { fetchData }: any = useContext(UserContext) as currentUserType;

  async function getHistory(skip: string) {
    await fetchData(`/game/history?take=6&skip=${skip}`).then((ress: any) => {
      // console.log("history data = ", ress);
      if (ress.matches)
        setMatches(ress.matches);
        
      if (ress.rank)
        setRank(ress.rank.sort((a: User, b:User) => ((b.won / 100) * (b.won + b.lose)) - ((a.won / 100) * (a.won + a.lose))));
    })
      .catch((err: any) => {
        // console.log("Error", err);
      });
  }
  const handleGame = (type: string) => {
    if (type)
      socket?.emit((type === 'random' ? 'random-game' : 'accept-game'), { id: 0, freindId: type });
    navigate('/game');
  }
  
  useEffect(() => {
    if (!socket) {
      webSocket.connect();
      // console.log('check dashbord socket')
    }
    getHistory('0');
   }, [socket])
  return (
    <>
      <div className='app-main'>
        <div className="cont-stream">
          <div className="text-stream">
            <h2>Watch streaming games anywhere anytime</h2>
            <span>Watch your hero compete by watching on CoLoNel</span>
            <NavLink className={'d-flex clm-center row-center'} to={'/stream'}>Watch now</NavLink>
          </div>

          <div className="black-stream">
            <div className="blackDiv"></div>
            <div className="stream-watch">
              <img src={imgStream} alt="" />
            </div>
          </div>
        </div>

        <div className="containers app-main__containers">
          <div className="container-dashboard chart">
            <div className="chartDiv">
              <Chart won={user.won === 0 && user.lose === 0 ? 1 : user.won} lose={user.lose} cancled={0} />
            </div>
          </div>

          <div className="container-dashboard">
            <h2>Progress</h2>
            <div className='totalmatches d-flex-column '>
        <h2 id={'totalMatchLine'}>{user.won + user.lose} total matches</h2>
        <span className='barStatistic'></span>
      </div>
      <div className='details-points details-matches'>
        <div className='bar red-bar'>
          <p>got it   <RiHandCoinFill /></p>
          <h3>{user.point} points</h3>
        </div>
        <div className='bar blue-bar'>
          <p>needed   <BsCoin /></p>
          <h3>{user.won < 50 ? 150 : (user.won < 150 ? 150 : 250)} points</h3>
        </div>
      </div>
          </div>

          <div className="container-dashboard robot">
            <div className="button-click">
              <button onClick={() => handleGame('robo')}>Play With Robot</button>
            </div>
          </div>


          <div className="container-dashboard rank-card">
            <h2>Top Ranking</h2>
            <span className='rate'>{rank && rank?.map((e : any) => e?.username)?.indexOf(user?.username) + 1} </span>
            <div className="grade-player">
                {user?.point < 30 ?
                <>
              <div className="grade">
                <GiUpgrade className='topo' />
              </div>
              <div className="stars">
                <TbTopologyStar2 className='topo-logy-star' />
              </div>
                </>
              :
              
                (user?.point < 60 ?  
                <>
                <div className="grade">
                <GiSwissArmyKnife className='topo' />
              </div>
              <div className="stars">
                <TbTopologyStar3 className='topo-logy-star' />
              </div> 
                </>
              :
              
               ( user?.point < 90 ?   
                <>
                <div className="grade">
                <PiStarOfDavidBold className='topo' />
              </div>
              <div className="stars">
                <GiPirateCaptain className='topo-logy-star' />
              </div> 
                </>
               : <>
              <div className="grade">
              <GiPirateFlag className='topo' />
            </div>
            <div className="stars">
              <GiStarfighter className='topo-logy-star' />
            </div> 
              </>))
              }
              
            </div>
          </div>

          <div className="container-dashboard history-dashboard">
            <h2>History</h2>
            <div className="matches">
            {Matches ? Matches.map((el: any, i) => {
              if (i > 2)
                return ;
              return <div key={el.id + 'ma' + i} className="match-one">
                <span>{el.myscore}</span>
                <div className="image-list-profile">
                <img src={user?.avatar} alt='userImage' />
                </div>
                <span>VS</span>
                <div className="image-list-profile">
                <img src={el.player2avatar} alt='userImage' />
                </div>
                <span>{el.player2score}</span>
              </div>
            }) : null}
            </div>
          </div>


          <div className="container-dashboard friend">
            <div className="button-click">
              <button onClick={() => handleGame('random')}>Play With Friend</button>
            </div>
          </div>
        </div>
      </div>
      {/* <TbTopologyStar2 className='topo-logy-star'/>
                <TbTopologyStar3 className='topo-logy-star'/>
                <TbTopologyStarRing2 className='topo-logy-star'/>
                <TbTopologyStarRing3 className='topo-logy-star'/>
                <GiStarfighter className='topo-logy-star'/>
                <PiStarOfDavidBold className='topo-logy-star'/>

                <GiUpgrade className='topo'/>
                <GiSwissArmyKnife className='topo'/>
                <GiSpeedBoat className='topo'/>
                <GiPowerRing className='topo'/>
                <GiPirateCaptain className='topo'/>
                <GiCapeArmor className='topo'/>
                <GiPirateFlag className='topo'/> */}

    </>
  )
}
