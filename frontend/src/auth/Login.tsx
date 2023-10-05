import './Login.scss';
import { backendUrl } from './userContext';


export default function Login() {

    // const { signIn } = useContext(UserContext) as currentUserType;

    // const hundleLogin = async () => {
    //     const getUser = await signIn();
    //     console.log(getUser);
    // }
    return (
        <div className='LoginPage'>
            <div className="LoginPage-Content">
                <div className='bg-img'>
                </div>
                <div className='section-login-btn'>
                    <div className='scop-btn-login'>
                        <img className='img-racite' src='/assets/img/boycrrayracket-2.png' alt='racite-ping-pong' />
                        <h1 className='title-SignIn'>Sign in</h1>
                        <h3 className='text-signin'>Get ready to serve and volley in the thrilling world of ping pong. Log in now!</h3>
                        <button className='btn-auth'><a href={`http://${backendUrl}/auth-user/redirect`}> Authorization</a> </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
