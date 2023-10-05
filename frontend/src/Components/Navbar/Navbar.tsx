import { useContext, useEffect, useState } from 'react'
import './Navbar.scss'
import { UserContext, currentUserType } from '../../auth/userContext';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

// import { faArrowLeft, faComments, faGamepad, faGears, faHouse, faMagnifyingGlass, faMoon, faSignOut, faUser, faUserGroup } from '@fortawesome/free-solid-svg-icons';
// import { faBell, faAddressCard } from '@fortawesome/free-regular-svg-icons';
import webSocket from '../../auth/Socket/Socket';
import { RiPingPongLine } from 'react-icons/ri';

const NavMobile = () => {
  const { signOut }: any = useContext(UserContext) as currentUserType;

  const hundlerDropdown = () => {
    document.getElementById("mobile-nav")?.classList.toggle("d-none");
  }
  return (
    <div id='mobile-nav' className='bg-mobile-nav d-none'>
      <div className=' mobile-nav pd-10 d-flex-column'>
        <div onClick={hundlerDropdown}>
          {/* <FontAwesomeIcon icon={faArrowLeft} className='icon-nav-list' /> */}
        </div>
        <div className='d-flex-column' onClick={hundlerDropdown}>
          <NavLink className={'item-nav-mobile'} to="/">
            {/* <FontAwesomeIcon icon={faHouse} className='icon-nav-list' /> */}
            Dashboard</NavLink>
          <NavLink className={'item-nav-mobile'} to="/users">
            {/* <FontAwesomeIcon icon={faUserGroup} className='icon-nav-list' /> */}
            users</NavLink>
          <NavLink className={'item-nav-mobile'} to="/chat">
            {/* <FontAwesomeIcon icon={faComments} className='icon-nav-list' /> */}
            chat</NavLink>
        </div>
        <div className='d-flex-column' onClick={hundlerDropdown}>
          <NavLink className={'item-nav-mobile'} to={'/profile'}>
            {/* <FontAwesomeIcon className=' icon-nav-list' icon={faUser} />Profile */}
            </NavLink>
          <NavLink className={'item-nav-mobile'} to={'/setting'}>
            {/* <FontAwesomeIcon className=' icon-nav-list' icon={faGears} /> Setting */}
            </NavLink>
          <NavLink className={'item-nav-mobile'} to={'/game'}>
            {/* <FontAwesomeIcon className=' icon-nav-list' icon={faGamepad} />Game */}
            </NavLink>
          <NavLink className={'item-nav-mobile'} to={'/'} onClick={signOut}>
            {/* <FontAwesomeIcon className=' icon-nav-list' icon={faSignOut} /> */}
            Log-out</NavLink>
        </div>
      </div>
    </div>
  )
}

const LandingPageNavBar = () => {


  return (
    <header className='landingPageNavBar'>
      <div className='logo'>
      <div className="sidebar-content">
        <Link className="app-logo mr-row-30 menu-link" to={'/'} >
          <RiPingPongLine className="icon " />
          <span className="small-text">
          PingPong
          </span>
          </Link>
      </div>
        {/* <NavLink to={'/'} ><h1>CoLoNeL</h1></NavLink> */}
      </div>
      <div className='login-detail'>
        <NavLink to={'/login'} className='btn-login'>Join-us</NavLink>
      </div>
    </header>
  )
}

const UserNavBar = () => {
  const socket = webSocket.getSocket();
  useEffect(() => {
    if (!socket) {
      webSocket.connect();
      // console.log('check Nav socket')
    }
    socket?.off(`error`).on(`error`, (args: any) => {
      // console.log('error ', args);
    });
    socket?.off(`notification`).on(`notification`, (args: any) => {
      // console.log('notification ', args);
      if(args.startGame)
      {
        navigate('/game');
      }
    });
    socket?.off(`have-new-game`).on(`have-new-game`, (args: any) => {
      // console.log('plyer info', args);
      setNotId(args.userId);
      document.getElementById("notification")?.classList.add("bg-green");

    });
  }, [socket])
  const navigate = useNavigate();
  const [notId, setNotId] = useState('');


  const { currentUser, signOut }: any = useContext(UserContext) as currentUserType;

  const handleNotification = () => {
    socket?.emit('accept-game', { freindId: notId });
    // console.log('sender id = ', notId);
    document.getElementById("notification")?.classList.remove("bg-green");

    navigate(`/game`);
  }

  /// --------------- handling drop down --------.///
  const hundlerDropdown = () => {
    let box = document.getElementById('root');
    let width = box?.clientWidth;
    document.getElementById("mydetalnavDropdown")?.classList.toggle("showDropdown");
    if (width && width <= 768)
      document.getElementById("mobile-nav")?.classList.toggle("d-none");
  }

  /// -------- handling dropdown ---------------- //

  window.onclick = function (e: any) {
    // nav bar
    // console.log('here click');
    if (!(e.target)?.matches('.icon-nav-detail')) {

      var mydetalnavDropdown = document.getElementById("mydetalnavDropdown");
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
  // / =------------------- end drop down --------//
  return (
    <header className='user-nav-bar'>
      <div className='logo'>
        <NavLink to={'/'} ><h1>CoLoNeL</h1></NavLink>

      </div>
      <div className='list-nav'>
        <NavLink className={'btn-list user-list-nav'} to="/">
          {/* <FontAwesomeIcon icon={faHouse} className='icon-nav-list' /> */}
        </NavLink>
        {/* <NavLink className={'btn-list user-list-nav'} to="/profile">
        <FontAwesomeIcon icon={faUser} className='icon-nav-list' />
          Profile
          </NavLink> */}
        <NavLink className={'btn-list user-list-nav'} to="/users">
          {/* <FontAwesomeIcon icon={faUserGroup} className='icon-nav-list' /> */}
        </NavLink>
        <NavLink className={'btn-list user-list-nav'} to="/game">
          {/* <FontAwesomeIcon icon={faGamepad} className='icon-nav-list' /> */}
        </NavLink>
        <NavLink className={'btn-list user-list-nav'} to="/chat">
          {/* <FontAwesomeIcon icon={faComments} className='icon-nav-list' /> */}
        </NavLink>
        <div className='search btn-list user-list-nav'>
          {/* <FontAwesomeIcon className='icon-search' icon={faMagnifyingGlass} /> */}
          <input className='nav-search-input' type="text" placeholder="Search.." />
        </div>
      </div>
      <div className='user-detail'>
        {/* <FontAwesomeIcon className='btn-detail icon-nav' icon={faMoon} /> */}
        <div className='' onClick={handleNotification} >

          {/* <FontAwesomeIcon id='notification' className='btn-detail icon-nav' icon={faBell} /> */}
        </div>
        <div className='mr-10 image-list-profile'>
          <img src={currentUser.avatar} alt='userProfile' />
        </div>
        <div className='detailNavDropdown'>
          <img alt='icon-edit' src='/assets/img/more-vertical.svg' onClick={hundlerDropdown} className=' icon-drop icon-nav-detail' />
          <div id='mydetalnavDropdown' className='drop-down-list'>
            <NavLink className={'list-item'} to={'/profile'}>
              {/* <FontAwesomeIcon className=' icon-drop-down' icon={faUser} /> */}
              Profile</NavLink>
            <NavLink className={'list-item'} to={'/setting'}>
              {/* <FontAwesomeIcon className=' icon-drop-down' icon={faGears} />  */}
              Setting</NavLink>
            {/* <NavLink className={'list-item'} to={''}>More</NavLink> */}
            <NavLink className={'list-item'} to={''} onClick={signOut}>
              {/* <FontAwesomeIcon className=' icon-drop-down' icon={faSignOut} /> */}
              Log-out</NavLink>
          </div>
        </div>
      </div>
      <NavMobile />

    </header>
  )
}

export default function Navbar() {
  const { currentUser }: any = useContext(UserContext) as currentUserType;

  if (currentUser.id)
    return <UserNavBar />
  else
    return <LandingPageNavBar />
}