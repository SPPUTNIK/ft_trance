
import './styles/ProfileSection.css'
import { NavLink } from 'react-router-dom';
import userInfo from '../../auth/Socket/UserInfo';

function ProfileSection() {
  const user = userInfo.getuser();

  return (
    <div className='profile-section d-flex row-center'>
      <NavLink to={'/profile'}>
      <img src={user.avatar} alt="Image User" />
      </ NavLink>
    </div>
  )
}

export default ProfileSection