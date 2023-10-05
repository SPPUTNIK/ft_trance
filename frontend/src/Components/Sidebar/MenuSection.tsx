import { NavLink } from 'react-router-dom';

import './styles/MenuSection.css';

//Icons
import {BiSolidDashboard} from 'react-icons/bi';
import {LiaUserFriendsSolid} from 'react-icons/lia';
import {IoGameControllerOutline} from 'react-icons/io5';
import {VscSettings} from 'react-icons/vsc';
import {BsChatText} from 'react-icons/bs';


function MenuSection() {
    return (

        <ul className="menu-lists">
            <li className="list-item">
                <NavLink to="/" className="menu-link flex">
                    <BiSolidDashboard className="icon"/>
                    <span className="small-text">
                        Dashboard
                    </span>
                </NavLink>
            </li>

            <li className="list-item">
                <NavLink to="/users" className="menu-link flex">
                    <LiaUserFriendsSolid className="icon"/>
                    <span className="small-text">
                        Friends
                    </span>
                </NavLink>
            </li>

            <li className="list-item">
                <NavLink to="/chat" className="menu-link flex">
                    <BsChatText className="icon"/>
                    <span className="small-text">
                        Chat
                    </span>
                </NavLink>
            </li>

            <li className="list-item">
                <NavLink to="/game" className="menu-link flex">
                    <IoGameControllerOutline className="icon"/>
                    <span className="small-text">
                        Game
                    </span>
                </NavLink>
            </li>

            <li className="list-item">
                <NavLink to="/setting" className="menu-link flex">
                    <VscSettings className="icon"/>
                    <span className="small-text">
                        Setting
                    </span>
                </NavLink>
            </li>

        </ul>
  )
}

export default MenuSection