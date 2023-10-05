

import MenuSection from "./MenuSection";
import "./styles/AppSidebar.css";
import { UserContext, currentUserType } from "../../auth/userContext";
import { useContext } from "react";
import { BiLogOut } from "react-icons/bi";
import { Link } from "react-router-dom";
import { RiPingPongLine } from "react-icons/ri";

function AppSidebar() {
  const { signOut }: any = useContext(UserContext) as currentUserType;

  return (
    <div  className="app-sidebar">

      <div className="sidebar-content">
        <Link className="app-logo mr-row-10 menu-link" to={'/'} >
          <RiPingPongLine className="icon " />
          <span className="small-text">
          PingPong
          </span>
          </Link>

        <MenuSection />
      </div>
      <div className="icon  menu-link cursor-pointer" onClick={signOut}>
          <BiLogOut className="icon " />
          <span className="small-text" >
            Log-out
          </span>
      </div>
    </div>
  );
}

export default AppSidebar;
