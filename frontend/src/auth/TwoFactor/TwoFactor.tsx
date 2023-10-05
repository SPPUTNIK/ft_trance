import { useContext, useState, useEffect } from 'react'
import { UserContext, currentUserType } from '../userContext';
import './TwoFactor.scss'

export const VerificationTwoFactor = () => {
    const { fetchData }: any = useContext(UserContext) as currentUserType;
    const [err, setError] = useState('');
    const [codeCheck, setCheckCode] = useState('');

    const sendCodeCheck = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if (!codeCheck)
            return ;
        const header =  {
            credentials: 'include',
            method: 'post',
            body: `twoFactorAuthenticationCode=${codeCheck}`,
            headers: { 'Content-Type': "application/x-www-form-urlencoded" }
        };
        fetchData("/auth-user/authenticate", header)
            .then((res: any) => {
                if (res.statusCode === 401)
                    setError(res.message);
                else if (res.id)
                    window.location.href = '/';
            })
            .catch((error: any) => 
            {
                setError(error.message);
            }
            )
        setCheckCode('');
    }
    useEffect(() =>{

    },[fetchData])
    return (
        <form className='TwoFactor bg w-75 d-flex-column row-center' onSubmit={sendCodeCheck}>

            <h1 className=''>check Two Factor</h1>
            <p>{err}</p>
            <input className='input-auth' type='text' value={codeCheck} onChange={(val)=>setCheckCode(val.target.value)} placeholder='inserte code' />
            <div className=''>
                <button className=' btn btn-light' >Submit</button>
            </div>
        </form>)
}
