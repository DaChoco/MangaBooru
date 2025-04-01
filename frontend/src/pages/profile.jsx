import { useState, useEffect, useContext } from 'react'
import { SearchBar, Topnav, Footer } from "../components"
import { loggedIn } from '../contexts/loggedinContext'
import { Link } from 'react-router-dom'
import "../style/Posts.css"
import "../style/Profile.css"


function Profile(){

    const {logged, setLogged} = useContext(loggedIn)


    const {showLoginBox, setShowLoginBox} = useContext(loggedIn)
    const {showRegisterBox, setShowRegisterBox} = useContext(loggedIn)

    function showLogin(){
        if (showRegisterBox === true){
            setShowRegisterBox(!showRegisterBox)
        }
        setShowLoginBox(!showLoginBox)
    }

    function showRegister(){
        if (showLoginBox === true){
            setShowLoginBox(!showLoginBox)
        }
        setShowRegisterBox(!showRegisterBox)
    }
    return(

        <div className="main-content">
            <Topnav></Topnav> 

            {logged === true ?
             (<div className='profile-page-container'>
                <div className="anouncement-ppage">
                    <h2>You are not currently logged in.</h2>

                    <ul className="islogged-container">
                        <li onClick={()=> showLogin()}><h3>Login</h3></li>
                        <li onClick={()=> showRegister()}><h3>Register</h3></li>
                    </ul>
                </div>
             </div>):

             (
            <>
             <div className='profile-page-container'>
                <div className="anouncement-ppage">
                    <h3>My Profile Information and Settings</h3>

                    <ul className="islogged-container">
                        <li><h3>Show My Profile</h3></li>
                        <li><h3><Link to={"/favorites"} style={{color: "var(--base-text-dark)"}}>Show My Favorites</Link></h3></li>
                        <li><h3>Logout</h3></li>
                    </ul>
                </div>
             </div>

             <div className="profile-info-container">
                {/*Currently dummy data. Will have dynamic data later */}
                
                <div className="banner-container" style={{backgroundImage: "url(https://i.pinimg.com/1200x/b1/f0/1a/b1f01a2af62782c2468978d2e783713d.jpg)"}}></div>
        
                <div className="profile-user-display">
                    <div className="profile-icon" style={{backgroundImage: "url(https://publicboorufiles-01.s3.af-south-1.amazonaws.com/userIcons/539c003cfb334c2501084cbc58fb297b.jpg)"}}></div>
                    <span className='user-title'><strong>RonaldRappa</strong> - Member</span>
                </div>

                <div className="profile-content">

                <section id="mysig"> 
                    <span className='user-sig' contentEditable="true" style={{fontFamily: "Verdana, Arial"}}>
                        ~<strong>Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque, ducimus!</strong>~
                    </span>
                </section>

          
                <section id='myfavorites'>
                    <h1 className='header-section' style={{fontSize: "2rem"}}>Favorites:</h1>

                    <h3 className="header-section">Mangas:</h3>
                    <ul className="show-my-favs-container">
                        <li><img className='img-unit-favs' src="https://i.pinimg.com/1200x/3a/db/5f/3adb5fb6defd1bfe9cd9a5b3632d7e7a.jpg" alt="" /></li>
                        <li><img className='img-unit-favs' src="https://i.pinimg.com/1200x/3a/db/5f/3adb5fb6defd1bfe9cd9a5b3632d7e7a.jpg" alt="" /></li>
                        <li><img className='img-unit-favs' src="https://i.pinimg.com/1200x/3a/db/5f/3adb5fb6defd1bfe9cd9a5b3632d7e7a.jpg" alt="" /></li>

                        <li><img className='img-unit-favs' src="https://i.pinimg.com/1200x/88/47/61/8847610bf60a59b60a9bda353f06a219.jpg" alt="" /></li>
                        <li><img className='img-unit-favs' src="https://i.pinimg.com/1200x/88/47/61/8847610bf60a59b60a9bda353f06a219.jpg" alt="" /></li>
                        <li><img className='img-unit-favs' src="https://i.pinimg.com/1200x/88/47/61/8847610bf60a59b60a9bda353f06a219.jpg" alt="" /></li>

                        <li><img className='img-unit-favs' src="https://i.pinimg.com/1200x/55/c9/44/55c944c15483988c8985f0cc7c529c73.jpg" alt="" /></li>
                        <li><img className='img-unit-favs' src="https://i.pinimg.com/1200x/55/c9/44/55c944c15483988c8985f0cc7c529c73.jpg" alt="" /></li>
                        <li><img className='img-unit-favs' src="https://i.pinimg.com/1200x/55/c9/44/55c944c15483988c8985f0cc7c529c73.jpg" alt="" /></li>
                   
                    </ul>

                    <h3 className="header-section">Tags:</h3>

                    <ul className="fav-taglist">
                        <li className="tag-unit-favs">weekly_shonen_jump</li>
                        <li className="tag-unit-favs">romance</li>
                    </ul>
                </section>

                <section id="myself">
                    <h1 className="header-section" style={{fontSize: "2rem"}}>About Myself:</h1>
                    <p> Lorem ipsum dolor, sit amet consectetur adipisicing elit. 
                        Ducimus quia nihil voluptatibus facilis aperiam placeat totam vero cumque est fugiat, quod rem ullam aspernatur.
                        Sed, ex incidunt. Maxime, amet debitis fuga at ipsam magnam reiciendis minus autem quia voluptatem, cumque velit corrupti odio. Similique soluta tempore vitae tenetur recusandae, molestiae facere quidem sunt natus quia dolores facilis eaque officiis quibusdam quo quaerat perspiciatis dolore corrupti nostrum officia obcaecati perferendis quos! Eos impedit suscipit ea fugit! 
                        Repellat a nulla ex veniam!
                    </p>
                </section>
                

                </div>
             </div>  {/*END OF MAIN Profile Page CONTENT */}

             <div className="loginbox"> {/*Swoops in from the left */}

             </div>

             <div className="registerbox"> {/*Swoops in from the right*/}

             </div>
            </> 
           
            ) 
             
             
             }

            <Footer></Footer>
        

       
        </div>
        
        
    )
}

export default Profile