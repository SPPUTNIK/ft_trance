
import './styles/AppHeader.scss'

import { BiSearchAlt } from 'react-icons/bi';
import { IoNotificationsOutline } from 'react-icons/io5';
import { GoStop } from 'react-icons/go';
import ProfileSection from './ProfileSection';
import webSocket from '../../auth/Socket/Socket';
import { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserContext, currentUserType } from '../../auth/userContext';
import userInfo from '../../auth/Socket/UserInfo';

interface ListInfo {
    listsearch: { username: string, id: string }[],
    setInputSearch: any
}

function Notification() {
    const socket = webSocket.getSocket();
    const navigate = useNavigate();
    const [notification, setNotification] = useState<{}[]>([]);
    const { fetchData }: any = useContext(UserContext) as currentUserType;

    socket?.off(`have-new-game`).on(`have-new-game`, (args: any) => {
        // console.log('plyer info', args);
        document.getElementById("numberNotification")?.classList.add('bg-red');
        document.getElementById("numberNotification")?.classList.remove('d-none');
        setNotification(arr => [...arr, args]);
    });

    useEffect(() => {
        // console.log('--- notification --- ');
        async function getNotifications() {
            fetchData('/game/notifications').then((ress: any) => {
                setNotification(ress)
            })
        }
        getNotifications();
        return () => { };

    }, [fetchData])

    const handleNotification = (id: string, notid: number, i: number) => {
        socket?.emit('accept-game', { id: notid, freindId: id });
        const temp = [...notification];
        temp.splice(i, 1);
        setNotification(temp);
        navigate(`/game`);
    }
    return <div id='NotificationDropdown' className='drop-down-list notification-list d-flex row-center  mr-row-10'>
        {notification.length ? notification.reverse().map((not: any, i) =>
            <div key={`${i}${not.id}`} className={'list-item notification-item'}>
                <img src={not.avatar} />
                <p> {not.name.slice(0,10)} </p>
                <button className='btn btn-primary' onClick={() => handleNotification(not.playerid, not.id, i)}>Accept</button>
            </div>
        ) :
            <h6 className='pd-10 '>you have't notfication</h6>
        }
    </div>
}

function ListSearch({ listsearch , setInputSearch}: ListInfo) {
    return <div id='SearchUserDropdown' className='drop-down-list notification-list d-flex row-center  mr-row-10'>
        {listsearch?.length ? listsearch.map((el: any, i) =>
            <NavLink to={`/userProfile/${el.id}`} key={`${i}${el.id}`} className={'list-item notification-item'} onClick={()=>setInputSearch('')}>
                <img src={el.avatar} />
                <p> {el.username.slice(0,10)} </p>
            </NavLink>
        ) :
            <h6 className='pd-10 '>you have't notfication</h6>
        }

    </div>
}
function AppHeader() {
    // console.log('--- header ---');
    const socket = webSocket.getSocket();
    const [message, setMessage] = useState('');
    const [searchList, setSearchList] = useState<any>();
    const [inputSearch, setInputSearch] = useState('');
    const username = userInfo.getuser()?.username;
    const isNotification = userInfo.getuser()?.notification;
    const { fetchData }: any = useContext(UserContext) as currentUserType;

    /// --------------- handling drop down --------.///
    const hundlerDropdown = () => {
        let box = document.getElementById('root');
        let width = box?.clientWidth;
        // setnot(true)
        let dropNotification = document.getElementById("NotificationDropdown");
        if (dropNotification)
            dropNotification.classList.toggle("showDropdown");
        if (width && width <= 768)
            document.getElementById("mobile-nav")?.classList.toggle("d-none");
        return true;
    }
    const handlerSearch = (e: any) => {

        setInputSearch(e.target.value);

        let dropNotification = document.getElementById("SearchUserDropdown");
        if (!e.target.value) {
            if (dropNotification)
                dropNotification.classList.remove("showDropdown");
            return;
        }
        fetchData(`/auth-user/search/${e.target.value}`).then((ress: any) => {
            setSearchList(ress)
        });
        if (dropNotification)
            dropNotification.classList.add("showDropdown");
        // console.log('searchLst ', searchList);
    }
    let timer: any;
    socket?.off(`error`).on(`error`, (args: any) => {
        // console.log('error ', args);
        document.getElementById("errorName")?.classList.add("d-errorName");
        setMessage(args.message ? args.message : args);
        timer = setTimeout(function () {
            document.getElementById("errorName")?.classList.remove("d-errorName");
        }, 4000);
    });
    clearTimeout(timer);

    useEffect(() => {
        if (!socket) {
            webSocket.connect();
            // console.log('check Nav socket')
        }
        return () => {};
    }, [socket])
    /// -------- handling dropdown ---------------- //

    window.onclick = function (e: any) {
        // console.log('here click');

        if (!(e.target)?.matches('.search-user-input')) {

            var mydetalnavDropdown = document.getElementById("SearchUserDropdown");
            if (mydetalnavDropdown?.classList.contains('showDropdown')) {
                mydetalnavDropdown.classList.remove('showDropdown');
            }
        }
        if (!(e.target)?.matches('.notification-icon')) {

            var mydetalnavDropdown = document.getElementById("NotificationDropdown");
            if (mydetalnavDropdown?.classList.contains('showDropdown')) {
                mydetalnavDropdown.classList.remove('showDropdown');
            }
        }
        /// edit chat convirsation
        if (!(e.target)?.matches('.icon-chat-conv-detail')) {

            var listDropdownEdit = document.getElementById("listDropdownEdit");
            if (listDropdownEdit?.classList.contains('showDropdown')) {
                listDropdownEdit.classList.remove('showDropdown');
            }
        }
        // list group users edit button
        if (!(e.target)?.matches('.icon-creat-group')) {

            var myDropdown = document.getElementById("CreateGroupDropdwon");
            if (myDropdown?.classList.contains('showDropdown')) {
                // console.log("srer 1");
                myDropdown.classList.remove('showDropdown');
            }
        }
    }
    return (
        <>
            <h1 id='errorName' className='errorName '>
                <GoStop />
                {message}</h1>
            <header className="app-header">
                <div className="containers app-header__container">
                    <h2 className='nav_title'>Welcome, {username?.slice(0,15)}!</h2>
                    <div className="header-user-notifi">
                        <div className="search-area  detailNavDropdown">
                            <input type='text' className='search-user-input' placeholder='Search Friend By ID ...' onChange={handlerSearch} value={inputSearch} />
                            <BiSearchAlt className='search-icon' />
                            <ListSearch listsearch={searchList} setInputSearch={setInputSearch}/>
                        </div>

                        <div className="notification-area detailNavDropdown"  >
                            <IoNotificationsOutline className='notification-icon cursor-pointer' onClick={hundlerDropdown} />
                            <div id='numberNotification' className={`status-circle d-none`}>
                                <span className='text-notification '></span>
                            </div>
                            <Notification />
                        </div>

                        <div className="user-area">
                            <ProfileSection />
                        </div>

                    </div>

                </div>

            </header>
        </>
    )
}

export default AppHeader;