import  { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Friends } from '../Friends/Friends';
import { History } from './History';
import { ListBlock } from './ListBlock';

export const ListDetailUser = (props: { id: string }) => {
  const [component, setComponents] = useState('History');
  return (
    <div className='listDetailUser mr-row-20 bg'>
      <nav className='nav-detail-user bg'>
        <ul>
          <li><NavLink to={`/profile/friends/${props.id}`} className={`btn-detail ${component === 'Friends' ? 'active' : ''}`} onClick={() => setComponents("Friends")}>Friends</NavLink></li>
          <li><NavLink to="/profile/History" className={`btn-detail ${component === 'History' ? 'active' : ''}`} onClick={() => setComponents("History")}>History</NavLink></li>
          <li><NavLink to="/profile/listBlocked" className={`btn-detail ${component === 'listBlocked' ? 'active' : ''}`} onClick={() => setComponents("Blocked")}>list Blocked</NavLink></li>
        </ul>
      </nav>
      {/* <Friends id={props?.id} /> */}
      {component === "Friends" && <Friends id={props.id} />}
      {component === "History" && <History />}
      {component === "Blocked" && <ListBlock />}

      {/* <Outlet /> */}
    </div>
  )
}
