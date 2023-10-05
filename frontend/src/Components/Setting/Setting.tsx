import  { useContext, useState } from 'react';
import './Setting.scss';
import { UserContext } from '../../auth/userContext';
import { currentUserType } from '../../auth/userContext';
import { useNavigate } from 'react-router-dom';

//icons
import {GiConfirmed} from "react-icons/gi";
import {FaAngleDoubleRight} from "react-icons/fa";
import {FaAngleDoubleLeft} from "react-icons/fa";
import {FaUpload} from "react-icons/fa";


export const Setting = (props: { id?: string }) => {
    const navigate = useNavigate();
    const { currentUser, fetchData }: any = useContext(UserContext) as currentUserType;
    const [urlimg, seturlimg] = useState(currentUser.avatar);
    const [file, setFile] = useState('');
    const [username, setUsername] = useState<string>('');
    const [pathImage, setPathImage] = useState('');
    const [nbrComponent, setNbrComponent] = useState(1);
    const formData = new FormData();

    const sikpHundler = async () => {
        // console.log(currentUser);
        setUsername('');
        setNbrComponent(nbrComponent + 1)
        if (nbrComponent > 1) {
            if (!currentUser.signup) {
                const header = {
                    credentials: 'include',
                    method: 'POST',
                    body: JSON.stringify({}),
                    headers: { 'Content-Type': 'application/json' },
                }
                await fetchData(`/auth-user/update-username`, header)
                    .catch((err: any) => console.error(err));
                    // window.location.href = '/'
                    navigate(0);
            }
            navigate('/');
            // console.log("skip ----------- ");
        }
    }

    const onChangeFile = (event: any) => {
        // console.log("event = ", event.target.files[0]);
        setFile(event.target.files[0]);
        setPathImage(event.target.value);
        // console.log(file);
        if (event.target.files && event.target.files[0]) {
            // console.log(event.target.files[0]);
            seturlimg(URL.createObjectURL(event.target.files[0]));
        }

    }

    const handleUpload = async (e: any) => {
        e.preventDefault();
        if (!file && !username)
            return;
        // console.log(file);
        // formData.append('username', username);
        formData.append('img', file);

        // console.log('data body = ', formData);
        let data = nbrComponent === 1 ? JSON.stringify({ username: username }) : formData;
        const header = {
            credentials: 'include',
            method: 'POST',
            body: data,
            headers: (nbrComponent === 1 ? { 'Content-Type': 'application/json' } : {}),
        };

        await fetchData(`/auth-user/update-${nbrComponent === 1 ? 'username' : 'img'}`, header)
            .then((ress: any) => {
                if (file && nbrComponent > 1)
                {
                    // console.log("send");
                    navigate('/');
                    navigate(0);
                }
                if(ress.message === 'no')
                {
                    document.getElementById('wrongName')?.classList.toggle('d-none');
                    return ;
                }
                if(ress.message === 'ok')
                    setNbrComponent(nbrComponent + 1);
            })
            .catch((err: any) => console.error(err));

            setUsername('');
    };


    return (
        <>
            <div className="img-edit"></div>
            <div className='setting'>
                <h1 className='title'>Update Profile</h1>
                <div className='gapping d-flex-column row-center pd-20'>
                    {nbrComponent === 1 ?
                        <>
                            <div className='d-flex-column row-center'>
                                <p >Welcome</p>
                                <h1 className='mr-10'>{currentUser.username}</h1>
                            </div>
                            <div className='mr-10 d-flex-column row-center'>
                                <label > New User Name :</label>
                                <p id="wrongName" className='d-none'>you can't use this name</p>
                                <input className='pd-5 input-username txt-darck border-gray' type='text' value={username} placeholder='Insert new username' onChange={(val) => setUsername(val.target.value)} />
                            </div>
                        </>
                        :
                        <>
                            <div className='img-profile'>
                                <img alt='profile'  className='img' src={urlimg} />
                            </div>
                            <div className='input-file d-flex clm-center row-center'>

                                <label className=' mr-10'> New Image :</label>
                                <button type='button' className='btn-warning'>
                                    <FaUpload></FaUpload>Upload File
                                    <input className='border-gray ' type='file' value={pathImage} onChange={onChangeFile} />
                                </button>
                            </div>
                        </>
                    }
                    <div className='btn-update d-flex w-100 clm-center'>
                        {nbrComponent === 1 ? '' : <FaAngleDoubleLeft onClick={() => setNbrComponent(nbrComponent - 1)} className='btn-icon skip-click'></FaAngleDoubleLeft>}

                        <GiConfirmed onClick={handleUpload} className='btn-icon confirm-click'></GiConfirmed>
                        <FaAngleDoubleRight onClick={sikpHundler}  className='btn-icon skip-click'></FaAngleDoubleRight>
                    </div>
                </div>
            </div>
        </>
    )
}
