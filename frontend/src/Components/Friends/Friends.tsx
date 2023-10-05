import React, { useContext, useEffect, useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { UserContext, currentUserType } from '../../auth/userContext';
import { IoGameControllerOutline } from 'react-icons/io5';
import webSocket from '../../auth/Socket/Socket';
import { FiSend } from 'react-icons/fi';


export const Friends = (props: { id?: string }) => {
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([]);
  const params = useParams();
  const userId = params.userId;
  const navigate = useNavigate();
  const { currentUser, fetchData }: any = useContext(UserContext) as currentUserType;
  const socket = webSocket.getSocket();

  const getPageFreind = (value: any) => {
    // console.log("content friend = ", value);
    currentUser.id === value.userid ? navigate(`/Profile`) :
      navigate(`/userProfile/${value.userid}`);
  }
  const getNewGame = (id: string) => {
    socket?.emit(`getnewgame`, { playerId: id });
  }
  useEffect(() => {
    async function getFriends() {//following
      await fetchData(`/auth-user/following`).then((ress: any) => {
        // console.log("friends 111 = " , ress);
        setFollowing(ress.foundFriends)
      })
        .catch((err: any) => {
          // console.log("Error", err);
        });
      // console.log(friends);
      // await fetchData(`/auth-user/friendOFfriend/${userId ? userId : props.id}`).then((ress: any) => {
        await fetchData(`/auth-user/followers`).then((ress: any) => {
        // console.log("followers = " , ress);
        setFollowers(ress.users)
      })
        .catch((err: any) => {
          // console.log("Error", err);
        });
      // console.log(friends);
    }
    getFriends();
    return () => { };
  }, [userId, props.id, fetchData]);

  return (
    <div className='list-friend bg d-flex'>
      <div className='w-100'>
        <h1 className='title'>Following</h1>
        <div className='userList w-100'>
          {following && following?.length > 0 ? following.map((user: any, i: number) => {
            return <div className="user-profile " key={user?.Id + `${i}`}>
              <div className="profil-img" onClick={() => getPageFreind(user)}><img src={user?.avatar ? user.avatar : '/assets/img/user-profile.png'}></img></div>
              <p className="profil-last">{user?.user.slice(0,10)}</p>
              <span className="icons ">
                <NavLink to={`/chat/users/${user.userid}`} ><FiSend /></NavLink>
              </span>
              <div className="icons cursor-pointer" onClick={() => getNewGame(user.userid)}><IoGameControllerOutline /></div>
            </div>
          }) :
            <p className='mr-10 d-flex clm-center'>no user available</p>}
        </div>
      </div>
      <div className='w-100'>
        <h1 className='title'>Followers</h1>
        <div className='userList w-100'>
          {followers && followers?.length > 0 ? followers.map((user: any, i: number) => {
            // console.log(user)
            return <div className="user-profile " key={user.user?.Id + `${i}`}>
              <div className="profil-img" onClick={() => getPageFreind(user.user)}><img src={user?.user.avatar}></img></div>
              <p className="profil-last">{user?.user.username.slice(0,10)}</p>
              <span className="icons ">
                <NavLink to={`/chat/users/${user?.user.userid}`} ><FiSend /></NavLink>
              </span>
              <div className="icons cursor-pointer" onClick={() => getNewGame(user?.user.userid)}><IoGameControllerOutline /></div>
            </div>
          }) :
            <p className='mr-10 d-flex clm-center'>no user available</p>}
        </div>
      </div>
    </div>
  )
}
