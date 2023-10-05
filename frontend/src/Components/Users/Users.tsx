import { useContext, useEffect, useState } from 'react'
import './Users.scss'

import { NavLink, useNavigate } from 'react-router-dom';
import { UserContext, currentUserType } from '../../auth/userContext';
import webSocket from '../../auth/Socket/Socket';

import { AiOutlineCloseCircle, AiOutlineUserDelete } from 'react-icons/ai';
import { AiOutlineUserAdd } from 'react-icons/ai';
import { IoGameControllerOutline } from 'react-icons/io5';
import { FiSend } from 'react-icons/fi';

interface StatusListOnlineUsers {
    id: string,
    username: string,
    avatar: string,
}

export function ListOnlineUsers(props: { setListUsers: any }) {
    const { fetchData } = useContext(UserContext) as currentUserType;
    const socket = webSocket.getSocket();

    const [listUsers, setListUsers] = useState<StatusListOnlineUsers[] | undefined>()

    function getNewGame(id: string) {
        socket?.emit(`getnewgame`, { playerId: id });

    }
    useEffect(() => {
        async function getOnlineUsers() {
            await fetchData('/auth-user/userstatus').then((ress: any) => {
                if (ress.onlineuser)
                    setListUsers(ress.onlineuser);
                // console.log(ress.onlineuser)
            })
        }
        getOnlineUsers();
    }, [])
    return <div className='container-online-user'>
        <span className='kill-users-list' onClick={() => props.setListUsers(false)}><AiOutlineCloseCircle /></span>
        <div className='userList'>
            {listUsers && listUsers?.length > 0 ? listUsers.map((user: any, i) => {
                return <div className="user-profile" key={user?.id + `${i}`}>
                    <div className="image-list-profile"><img src={user?.avatar} />
                        <div className={`status-circle ${user?.online ? ` bg-green` : ' bg-gray'}`}>
                        </div>
                    </div>
                    <p className="profil-last">{user?.username.slice(0,10)}</p>
                    <div className="icons cursor-pointer" onClick={() => getNewGame(user?.id)}><IoGameControllerOutline /></div>
                </div>
            }) :
                <p>no user available</p>}
        </div>
    </div>
}
function List(props: { key: string, user: any, check: boolean }) {
    document.getElementById('root')?.classList.add('small-side-bar')
    const socket = webSocket.getSocket();
    const navigate = useNavigate();

    const getPageFreind = (value: string) => {
        // console.log("user data", props.user.id);
        navigate(`/userProfile/${value}`);
    }

    const getNewGame = (id: string) => {
        socket?.emit(`getnewgame`, { playerId: id });
    }
    return (
        <div className="user-profile" key={props.user.id}>
            <span className=" image-list-profile" onClick={() => getPageFreind(props.user.id)}>
                <img src={props.user.avatar}></img>
                <div className={`status-circle ${props.user.online ? ` bg-green` : ' bg-gray'}`}>
                </div>
            </span>
            <span className="profil-id">{props.user.id}</span>
            <span className="profil-last">{props.user.username.slice(0,12)}</span>
            <span className="profil-nick">{props.user.grade}</span>
            <span className="profil-email">{props.user.email}</span>
            <span className="icons cursor-pointer" onClick={() => getNewGame(props.user.id)}><IoGameControllerOutline /></span>
            <span className="icons ">
                <NavLink to={`/chat/users/${props.user.id}`} ><FiSend /></NavLink>
            </span>
            {
                props.check ? (
                    <span className="icons"><AiOutlineUserAdd /></span>
                ) : (
                    <span className="icons"><AiOutlineUserDelete /></span>
                )
            }
        </div>
    )
}


export const Users = () => {
    const [checked, setChecked] = useState(false);
    const [users, setUsers] = useState([]);

    const { fetchData, currentUser }: any = useContext(UserContext) as currentUserType;
    function handleChange(elem: { target: { checked: boolean | ((prevState: boolean) => boolean); }; }) {
        setChecked(elem.target.checked);
        // if (elem.target.checked)
        //     console.log(`============= ${elem.target.checked} ${checked}`);
        // else
        //     console.log(`*********** ${elem.target.checked} ${checked}`);
    }

    useEffect(() => {
        async function getUsers() {
            await fetchData('/auth-user/users').then((ress: any) => {
                // console.log(ress);
                setUsers(ress)
            })
        }
        getUsers();
        return () => { };
    }, [fetchData]);

    return (
        <div className="friendDiv">
            {
                <div className='data-tables'>
                    <div className="headerTable">
                        <span className="profil-img">img</span>
                        <span className="profil-id">id</span>
                        <span className="profil-nick">nickName</span>
                        <span className="profil-first">Grade</span>
                        <span className="profil-email">email</span>
                        <span>Following</span>
                        <label className="switch">
                            <input type="checkbox" onChange={handleChange} />
                            <span className='slider'></span>
                        </label>
                        {/* <span>Users</span> */}
                    </div>
                    {users.filter((el: any) => el.id !== currentUser.id && !(el.isBlocked)).map(((user: { id: string; }) => {
                        return (
                            <List key={user.id} user={user} check={checked} />
                        )
                    }))}

                </div>
            }
        </div>
    )
}
