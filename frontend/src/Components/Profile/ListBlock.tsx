import { useContext, useEffect, useState, useCallback } from 'react';
import { UserContext, currentUserType } from '../../auth/userContext';
import { CgUnblock } from 'react-icons/cg';

export const ListBlock = (props: { id?: string }) => {
  const [listFrienfBlock, setListFriendBlock] = useState<[]>();
  const { fetchData }: any = useContext(UserContext) as currentUserType;

  async function getBlockList() {
    await fetchData(`/auth-user/blocklist`).then((ress: any) => {
      // console.log("block list = ", ress);
      setListFriendBlock(ress)
    })
      .catch((err: any) => {
        // console.log("Error", err);
      });
    // console.log(friends);
  }
  const UnblockFriend = useCallback(async (e: any) => {
    // console.log("deblock", e.userid);
    await fetchData(`/auth-user/unblockuser/${e.userid}`).then((ress: any) => {
      // console.log("unblock = ", ress);
      // setListFriendBlock(ress)
      getBlockList();
    })
      .catch((err: any) => {
        // console.log("Error", err);
      });
  }, []);

  useEffect(() => {

    getBlockList();
    return () => { };
  }, [props.id, fetchData, UnblockFriend]);
  return (
    <div className='list-friend bg'>
      <h1 className='title'>List Block</h1>
      <div className='userList w-100'>
        {listFrienfBlock && listFrienfBlock?.length > 0 ? listFrienfBlock.map((user: any, i: number) => {
          return <div className="user-profile " key={user?.Id + `${i}`}>
            <div className="profil-img" ><img src='/assets/img/user-profile.png'></img></div>
            <p className="profil-last">{user?.user.slice(0,10)}</p>
            <div className="icons cursor-pointer" onClick={() => UnblockFriend(user)}><CgUnblock /></div>
          </div>
        }) :
          <p className='mr-10 d-flex clm-center'>no user available</p>}
      </div>
    </div>
  )
}
