import { useState, useEffect, useContext } from 'react'
import { SearchBar, Topnav, Footer } from "../components"
import { loggedIn } from '../contexts/loggedinContext'
import { Link } from 'react-router-dom'
import "../style/Posts.css"
import "../style/Profile.css"


function Profile(){

    const {logged} = useContext(loggedIn)
    const {setLogged} = useContext(loggedIn)

    return(

        <div className="main-content">
            <Topnav></Topnav> 
            <SearchBar data={{ lenoutput: 0, setLenoutput: () => {} }}></SearchBar>

            {logged === true ?
             (<div className='profile-page-container'>
                <div className="anouncement-ppage">
                    <h2>You are not currently logged in.</h2>

                    <ul className="islogged-container">
                        <li><h3>Login</h3></li>
                        <li><h3>Register</h3></li>
                    </ul>
                </div>
             </div>):
             (<div className='profile-page-container'>
                <div className="anouncement-ppage">
                    <h3>My Profile Information and Settings</h3>

                    <ul className="islogged-container">
                        <li><h3>Show My Profile</h3></li>
                        <li><h3><Link to={"/favorites"}>Show My Favorites</Link></h3></li>
                        <li><h3>Logout</h3></li>
                    </ul>
                </div>
             </div>)}
            <Footer></Footer>
        

       
        </div>
        
        
    )
}

export default Profile