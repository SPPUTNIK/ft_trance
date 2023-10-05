import './LandingPage.scss';
import Navbar from '../Components/Navbar/Navbar';
import { NavLink } from 'react-router-dom';
import {SiFireship} from 'react-icons/si';

//icons
import {RiTwitterFill} from 'react-icons/ri';
import {FaGithub} from 'react-icons/fa';
import {GrLinkedinOption} from 'react-icons/gr';

export const LandingPage = () => {
   
  return (
    <>
    <div className='landing-page'>
        <Navbar />
        <div className="content-div">

          <div className='hero-slide'>
            <div className='text-slid'>
              <div className="fir-div">
                <h1>Anytime is Ping Pong Time.</h1>
              </div>
              <h2>Explore our world It’s More than a Ping-Pong Thing!</h2>
              <p>and discover all the ways we can enhance your table tennis experience. Whether you're a beginner or a pro, we've got something special for you. Enjoy your stay!</p>
              
              <NavLink className='btn-hero' to={'/login'}>Join-us</NavLink>
            </div>
            <div className='img-slid'>
              <div className="light-img zero"></div>
              <div className="light-img one"></div>
              <div className="light-img two"></div>
              <div className="light-img three"></div>
              <div className="image">
              </div>
            </div>
          </div>

          <div className="about-us">
            <h1 id='about'>About us</h1>
            <div className='slide-about'>
            <div className='text-slid'>
              <h2>We're passionate about ping pong and dedicated to creating an immersive virtual experience for players of all levels. Join us in celebrating the joy of the game!"</h2>
            </div>
            <div className='img-slid'>
              <div className="light-img zero"></div>
              <div className="light-img one"></div>
              <div className="light-img two"></div>
              <div className="light-img three"></div>
              <div className="img-about">
              </div>
            </div>
          </div>
          </div>

          <div className="our-team">

            <h1>Our Team</h1>

            <div className="team">

              <div className="leader-profile">


                <div className="box-image">
    
                </div>

                <h2>El Bouziady Abdessamad</h2>
                <span>Developer</span>

                <div className="contact-me">
                <NavLink to='/'>
                    <RiTwitterFill/>
                  </NavLink>
                  <NavLink to='/'>
                    <FaGithub/>
                  </NavLink>
                  <NavLink to='/'>
                    <GrLinkedinOption/>
                  </NavLink>
                </div>

              </div>

              <div className="leader-profile">


                <div className="box-image">
    
                </div>

                <h2>Jrifi Hamza</h2>
                <span>Developer</span>

                <div className="contact-me">
                <NavLink to='/'>
                    <RiTwitterFill/>
                  </NavLink>
                  <NavLink to='/'>
                    <FaGithub/>
                  </NavLink>
                  <NavLink to='/'>
                    <GrLinkedinOption/>
                  </NavLink>
                </div>

              </div>

              <div className="leader-profile">


                <div className="box-image">
    
                </div>

                <h2>Alqoh Hamid</h2>
                <span>Developer</span>

                <div className="contact-me">
                <NavLink to='/'>
                    <RiTwitterFill/>
                  </NavLink>
                  <NavLink to='/'>
                    <FaGithub/>
                  </NavLink>
                  <NavLink to='/'>
                    <GrLinkedinOption/>
                  </NavLink>
                </div>

              </div>

              <div className="leader-profile">


                <div className="box-image">
    
                </div>
                
                <h2>Walad Zakaria</h2>
                <span>Developer</span>

                <div className="contact-me">
                  <NavLink to='/'>
                    <RiTwitterFill/>
                  </NavLink>
                  <NavLink to='/'>
                    <FaGithub/>
                  </NavLink>
                  <NavLink to='/'>
                    <GrLinkedinOption/>
                  </NavLink>
                </div>

              </div>

            </div>

          </div>

        </div>
      
    <footer>
      Copyright &copy; All Rights Reserved By CoLoNeL
    </footer>
    </div>
    
    </>
  )
}

  // ...