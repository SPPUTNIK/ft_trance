import { useContext, useEffect, useState } from 'react';
import './History.scss'
import { UserContext, currentUserType } from '../../auth/userContext';
import userInfo, { User } from '../../auth/Socket/UserInfo';

export const History = () => {
  const user = userInfo.getuser();
  const [Matches, setMatches] = useState<{}[]>();
  const [rank, setRank] = useState<{}[]>();
  const { fetchData }: any = useContext(UserContext) as currentUserType;

  async function getHistory(skip: string) {
    await fetchData(`/game/history?take=6&skip=${skip}`).then((ress: any) => {
      // console.log("history data = ", ress);
      if (ress.matches)
        setMatches(ress.matches);
      if (ress.rank)
        setRank(ress.rank.sort((a: User, b: User) => ((b.won / 100) * (b.won + b.lose)) - ((a.won / 100) * (a.won + a.lose))));
    })
      .catch((err: any) => {
        // console.log("Error", err);
      });
  }
  useEffect(() => {
    getHistory('0');
    return () => { };
  }, []);
  return (
    <div className='list-friend  '>
      <h1 className='title mr-row-30'>MATCH SCHEDULE & STANDING</h1>
      <div className='history w-100'>
        <div className='rank'>
          <table className='table-rank'>
            <tbody >
            <tr>
          <th className='clm-first'></th>
          <th >User name</th>
          <th className='clm-last'>rank</th>
        </tr>
            {rank ? rank.map((el: any, i) => {
          // console.log('element', i)
          return<tr key={el.id + ' ' +i}>
        <td className='clm-first image-list-profile'> <img className='img-user' alt='profile' src={el.avatar} /> </td>
        <td className=''> {el.username.slice(0,10)}</td>
        <td className='clm-last'>{i + 1}</td>
      </tr>
}): null}

            </tbody>
          </table>
        </div>
          <div className='d-flex-column all-matches'>
        {Matches ? Matches.map((el: any, i) => {
          // console.log('element', i)
          return <div key={i} className='score-match d-flex row-center w-100'>
              <div className='p-l d-flex w-100'>
                <div className='image-list-profile'>
                  <img className='' src={user?.avatar} alt='user-profile' />
                </div>
                <h3>{user?.username.slice(0,10)} </h3>
                <h2>{el.myscore}</h2>
              </div>
              <h1>Vs</h1>
              <div className='p-r  d-flex w-100'>
                <h2>{el.player2score}</h2>
                <h3>{el.player2name.slice(0,10)} </h3>
                <div className='image-list-profile'>
                  <img className='' src={el.player2avatar} alt='user-profile' />
                </div>
              </div>
          </div>
        }) : null}
        </div>
      </div>
    </div>
  )
}
