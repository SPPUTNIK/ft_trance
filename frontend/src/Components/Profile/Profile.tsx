import { useContext, useEffect, useState, useCallback } from 'react'
import './Profile.scss'
import { useNavigate, useParams } from 'react-router-dom';
import { ListDetailUser } from './ListDetailUser';
import { UserContext, backendUrl, currentUserType } from '../../auth/userContext';
import QRCode from 'react-qr-code';
import Chart from '../Dashboard/Chart';
import userInfo from '../../auth/Socket/UserInfo';

const DetailUser = (props: { userInfo: any }) => {
  document.getElementById('root')?.classList.add('small-side-bar');
  console.log(props)
  const user = props.userInfo;
  const won: number = user?.won;
  const lose: number = user?.lose;
  const point: number = user?.point;
  const totalmatch = document.getElementById('totalMatchLine')
  if (totalmatch)
    totalmatch.style.width = `${(user.point * 100 / 150) === 0 ? 1 : (user?.point * 100 / 150)}%`
  return <>
    <div className='progress d-flex-column bg'>
      <h1 className='title'>Progress</h1>
      <div className='totalmatches d-flex-column '>
        <h2 id={'totalMatchLine'}>{won + lose} total matches</h2>
        <span className='barStatistic'></span>
      </div>
      <div className='details-points details-matches'>
        <div className='bar red-bar'>
          <p>got it</p>
          <h3>{point} points</h3>
        </div>
        <div className='bar blue-bar'>
          <p>needed</p>
          <h3>{won < 50 ? 150 : (won < 150 ? 150 : 250)} points</h3>
        </div>
      </div>
    </div>
    <div className='ckecker d-flex bg'>
      <div className='details-matches '>
        <div className='bar red-bar'>
          <p>Total of won matches</p>
          <h3>{won} matches</h3>
        </div>
        <div className='bar blue-bar'>
          <p>Total matches lost</p>
          <h3>{lose} matches</h3>
        </div>
        <div className='bar gray-bar'>
          <p>Total canceled matches</p>
          <h3>{0} matches</h3>
        </div>
      </div>
      <div>
        <Chart won={won} lose={lose} cancled={0} />
      </div>

    </div>
  </>
}

export const MyProfile = () => {
  const [MyInfo, setMyInfo] = useState<any>(userInfo.getuser())
  const { fetchData }: any = useContext(UserContext) as currentUserType;
  const [isEnableTwoFactor, setIsEnableTwoFactor] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [codeCheck, setCodeCheck] = useState('');
  const [error, setError] = useState('');
  const [qrcode, setqrconde] = useState<any>(null);

  async function getMyInfo() {

    await fetchData('/auth-user/user').then((ress: any) => {
      // console.log("info = ", ress);
      setMyInfo(ress)
      setIsEnableTwoFactor(ress.is2FAEnabled);
    })
      .catch(() => {
        // console.log("Error", err);
      });
  }

  const getQRC = async () => {
    // ---- check if did't get qrcode ---- //
    fetch(`http://${backendUrl}/auth-user/generate`, {
      credentials: 'include'
    })
      .then((res: any) => res.text())
      .then((res: any) => {
        // console.log(res);
        setqrconde(res)
      })
      // .catch((err: any) => console.log('error', err));
  }

  const twofaOn = useCallback(async () => {
    if (!codeCheck)
      return;
    await fetchData("/auth-user/turn-on", {
      credentials: 'include',
      method: 'post',
      body: `twoFactorAuthenticationCode=${codeCheck}`,
      headers: { 'Content-Type': "application/x-www-form-urlencoded" }
    })
      .then((res: any) => {
        if (res.statusCode === 401) {
          setError(res.message);
          return;
        }
        killTwoFactor();
        getMyInfo();
        // console.log('return = two enable -- ', res);
      })
      // .catch((error: any) => console.log('error', error));
    setCodeCheck('');
  }, [codeCheck, isUpdate])

  const twofaOff = useCallback(async () => {
    if (!codeCheck)
      return;
    await fetchData("/auth-user/turn-off", {
      credentials: 'include',
      method: 'post',
      body: `twoFactorAuthenticationCode=${codeCheck}`,
      headers: { 'Content-Type': "application/x-www-form-urlencoded" }
    })
      .then((res: any) => {
        // console.log(res);
        // setqrconde(result)
        if (res.statusCode === 401)
          setError(res.message);
        else {
          getMyInfo();
          setIsUpdate(!isUpdate);

        }
      })
      // .catch((error: any) => console.log('error', error));
    setCodeCheck('');

  }, [codeCheck, isUpdate]);

  const handlingTwoFactor = (event: any) => {
    event.preventDefault();
    // console.log('event', event.target.value);
    if (event.target.value === 'disableTwoFactor') {
      twofaOff();
      return;
    }
    else if (event.target.value === 'enableTwoFactor') {
      twofaOn();
      return;
    }
    setIsEnableTwoFactor(event.target.checked);
    if (!MyInfo.is2FAEnabled && event.target.checked) {
      document.body.classList.add('stopScrol');
      getQRC();
      // console.log(MyInfo.is2FAEnabled, "=---- enaple ----=", !event.target.checked);
    }
    else if (MyInfo.is2FAEnabled && !event.target.checked) {
      setIsUpdate(!isUpdate);
      // console.log(!MyInfo.is2FAEnabled, "=----- desible---=", event.target.checked);
    }
    else
      setIsUpdate(!isUpdate);
  }
  const killTwoFactor = () => {
    document.body.classList.remove('stopScrol');
    setqrconde(null);
    setIsEnableTwoFactor(false);
  }
  useEffect(() => {
    // console.log('freind use effect ');

    getMyInfo();
    return () => { };
  }, [fetchData, twofaOff, twofaOn, isUpdate]);

  return (
    <>
      <div className='profile-root'>
        {qrcode ?
          <div className='QR'>
            <div className='QRcode w-100 d-flex-column clm-center row-center'>

              <div className='qr-image'>
                <QRCode size={256}
                  style={{ height: "auto", maxWidth: "300px", width: "160px" }}

                  value={qrcode}
                  viewBox={`0 0 256 256`} />
              </div>
              <div className='d-flex-column clm-center w-100 row-center' >
                <p className='mr-5'>Scan QR</p>
                <div className='d-flex w-100 row-center'>
                  <input type='text' className='pd-10 mr-20 w-100 btn-light btn' placeholder='insert code' value={codeCheck} onChange={(val) => setCodeCheck(val.target.value)} />
                </div>
                <div className='d-flex btn-qr' >
                  <button className='pd-10  btn bg-gray' onClick={killTwoFactor}> Cancel</button>
                  <button className='pd-10  btn  btn-light' value={'enableTwoFactor'} onClick={handlingTwoFactor}> Enable</button>
                </div>
              </div>
            </div>
          </div>
          : null}
        <div className='bg header-profile'>
          <div className='info-profile '>
            <div className='info bg'>
              <div className='content-img-profile'>
                <img className='img-profile' alt='friend' src={MyInfo?.avatar} />
              </div>
              <div className='d-flex row-center mr-clm-10 pd-clm-10 space-btw '>
                <h2> {MyInfo?.username} </h2>
                <div className='d-flex row-center '>
                  <p>Two Factor</p>
                  <label className="toggle-switch mr-5">
                    <input type="checkbox" checked={isEnableTwoFactor} onChange={handlingTwoFactor} />
                    <div className="toggle-switch-background">
                      <div className="toggle-switch-handle"></div>
                    </div>
                  </label>
                </div>
              </div>
              {isUpdate ? <>
                <p>{error}</p>
                <div className='d-flex  clm-center mr-row-10 row-center'>
                  <input type='text' className='pd-10  w-75 btn-light btn' placeholder='insert code' value={codeCheck} onChange={(val) => setCodeCheck(val.target.value)} />
                  <button className='pd-10  btn btn btn-light' value={'disableTwoFactor'} onClick={handlingTwoFactor}> disable</button>
                </div>
              </>
                : null
              }
            </div>
          </div>
          <DetailUser userInfo={MyInfo} />
        </div>
        <ListDetailUser id={MyInfo?.id} />
      </div>
    </>
  )
}

export const ProfileFriend = () => {
  const params = useParams();
  const friendId = params.friendId;
  const [friend, setFriend] = useState<any>([]);
  const { fetchData }: any = useContext(UserContext) as currentUserType;
  const navigate = useNavigate();

  const blockhandler = useCallback(async () => {
    await fetchData(`/auth-user/block/${friendId}`).then((ress: any) => {
      // console.log("block ress = ", ress);
      navigate('/users');

    }).catch((err: any) => {
      // console.log("blcok error = ", err);
    })
  }, [])
  const addhandler = useCallback(async () => {
    await fetchData(`/auth-user/addfriend/${friendId}`).then((ress: any) => {
      // console.log("add ress  = ", ress);
      getFriend();

    }).catch((err: any) => {
      // console.log("add error = ", err);
    })
  }, [])

  const deletehandler = useCallback(async () => {
    await fetchData(`/auth-user/deletefriend/${friendId}`).then((ress: any) => {
      // console.log("delete ress = ", ress);
      getFriend();

    }).catch((err: any) => {
      // console.log("delete error = ", err);
    })
  }, [])

  async function getFriend() {
    await fetchData(`/auth-user/user/${friendId}`).then((ress: any) => {
      // console.log("friend ress = ", ress);
      setFriend(ress)
    })
      .catch((err: any) => {
        // console.log("Error get freind", err);
      });
  }

  useEffect(() => {

    getFriend();
    return () => { };
  }, [friendId, fetchData, blockhandler, addhandler, deletehandler]);
  if (friend.User)
  return (
    <main className='profile-root'>
      <div className='bg header-profile'>
        <div className='info-profile'>
          <div className='info bg'>
            <div className='content-img-profile'>
              <img className='img-profile' alt='friend' src={friend.User?.avatar} />
            </div>
            <h1> username : {friend.User?.username} <span></span></h1>
            <div className='btn-updateUser'>
              {friend.isfriend === 'false' ?
                <button onClick={addhandler}> Follow </button> :
                <button onClick={deletehandler}> Unfollow </button>}
              <button onClick={blockhandler}> Block </button>
            </div>
          </div>
        </div>
        <DetailUser userInfo={friend?.User} />
      </div>
      <div className='mr-row-10'>
        {/* <Friends id={friend.User?.id} /> */}
      </div>
    </main>
  )
  else
    return <div className='d-flex clm-center mr-30'><h1>User Not Found</h1></div>
}
