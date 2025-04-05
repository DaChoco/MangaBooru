import { useState, useEffect, useContext } from 'react'
import { SearchBar, Topnav, Footer } from "../components"
import { loggedIn } from '../contexts/loggedinContext'
import { Link, useNavigate } from 'react-router-dom'
import "../style/Posts.css"
import "../style/Profile.css"

import applelogo from "../assets/apple-logo.png"
import googlelogo from "../assets/google.png"


function Profile(){
    //elements
    const emaillogininput = document.getElementById("emaillogin")
    const passwdlogininput = document.getElementById("passwdlogin")

    const emailregisterinput = document.getElementById("emailregister")
    const passwdregisterinput = document.getElementById("passwdregister")

    const acceptedBanners = 
    [
    "https://publicboorufiles-01.s3.af-south-1.amazonaws.com/userIcons/userBanners/8acc4628408cb4ecf0a1bc6c225f85b2.jpg",
    "https://publicboorufiles-01.s3.af-south-1.amazonaws.com/userIcons/userBanners/d3ff89457850e066d28f7eb84179d583.jpg",
    "https://publicboorufiles-01.s3.af-south-1.amazonaws.com/userIcons/userBanners/image_2025-04-01_193059632.png",

    "https://i.pinimg.com/1200x/57/39/b8/5739b85cb9aa3362a879f5c67f27a845.jpg",
    "https://i.pinimg.com/1200x/63/1f/18/631f18d68cee0131c9cf3d63b0516fec.jpg",
    "https://i.pinimg.com/1200x/ff/79/98/ff79982de230500555c1e886c7320853.jpg"
    ]
//HOOKS -----------------------------------------------------------------
const navigate = useNavigate()


    const {logged, setLogged} = useContext(loggedIn)
    const {userID, setUserID} = useContext(loggedIn)
    const {userIcon, setUserIcon} = useContext(loggedIn)
    const {showLoginBox, setShowLoginBox} = useContext(loggedIn)
    const {showRegisterBox, setShowRegisterBox} = useContext(loggedIn)

    const [emailquery, setEmailquery] = useState("")
    const [usernamequery, setUsernamequery] = useState("")
    const [passwordquery, setPasswordquery] = useState("")
    const [showstats, setShowstats] = useState(false)

    const [userData, setUserData] = useState({})

    useEffect(()=>{
        userInfoData(userID)
    }, [])

    useEffect(()=>{
        if (userID.length>0){
            
            console.log(userID)
            console.log("Haha")
        }
    }, [userID])



//FUNCTIONS --------------------------------------------------------------

    //WHEN LOGGED OUT
    function showLogin(){
        if (showRegisterBox === true){
            setShowRegisterBox(!showRegisterBox)
            
        }
        
        setShowLoginBox(!showLoginBox)
        console.log(showLoginBox)
    }

    function showRegister(){
        if (showLoginBox === true){
            setShowLoginBox(!showLoginBox)
        }
        
        setShowRegisterBox(!showRegisterBox)
        console.log(showRegisterBox)
    }

    //LOGIN AND REGISTER
    const userLogin = async (e)=>{
        e.preventDefault()
        const url = `http://127.0.0.1:8000/login`

        let uemail = emaillogininput.value
        let upasswd = passwdlogininput.value


        try{
        const response = await fetch(url, 
            {method: "POST",
                headers: {
                    "content-type": "application/json",

                    "Access-Control-Allow-Origin": "*",
                    'Access-Control-Allow-Headers': "*",
                    'Access-Control-Allow-Methods': "*"},
            body: JSON.stringify({email: uemail, passwd: upasswd})
            }
            
        )

        const data = await response.json()
        console.log(data)

        if (data.message === true){
            setUserID(data.userID)
            setLogged(true)
            
        }
        else{
            console.log("Sorry, something has gone wrong. This is the reason: ", data.elaborate)
        }
        }
        catch (error){
            console.log("Something has gone wrong: ", error)
        }

    }

    const userRegister = async(e)=>{
        const url = "http://127.0.0.1:8000/register"

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "content-type": "application/json",

                "Access-Control-Allow-Origin": "*",
                'Access-Control-Allow-Headers': "*",
                'Access-Control-Allow-Methods': "*"}
            })

        const data = await response.json()

        if (data.message === true){
            setLogged(true)
        }
    }
    //END OF LOGIN AND REGISTER


    //API CALLS

    async function userInfoData(userID){

        //Extracts user info for the profile page
        const url = `http://127.0.0.1:8000/returnUserInfo/${userID}`
    try{
        const response = await fetch(url, {method: "GET"})
        const data = await response.json()

        console.log("Data: ", data)
        setUserData(data)
        setUserIcon(data.userIcon)

        setUserData((prevdata) =>({...prevdata, DateCreated: new Date(prevdata.DateCreated).toLocaleDateString()}))




        
    }
    catch (error){
        console.log("An unforseen error has occured")
    }
        
    }

    //WHEN LOGGED IN

    const updateBannerPic = (e)=>{
        let randnum = Math.floor(Math.random() * 6)
        e.target.style.backgroundImage = `url(${acceptedBanners[randnum]})`

    }

    const togglestats = ()=>{
        setShowstats(!showstats)
    }

    const logout = async () =>{
        setLogged(!logged)
        console.log("Thank you for using the service. Bye!")
    }
//JSX ---------------------------------------------------

if (!userData){ return (<div>LOADING...</div>)}
    return(

        <div className="main-content" style={{position: "relative"}}>
            <Topnav></Topnav> 

            {logged === false ?
             (
             
            <> 
             <div className='profile-page-container' style={{height: "65vh", width: "auto"}}>
                <div className="anouncement-ppage">
                    <h2>You are not currently logged in.</h2>

                    <ul className="islogged-container">
                        <li onClick={()=> showLogin()} style={{cursor: "pointer"}}><h3>Login</h3></li>
                        <li onClick={()=> showRegister()} style={{cursor: "pointer"}}><h3>Register</h3></li>
                    </ul>
                </div>

             </div>
             

             {showLoginBox === true && (
                <form className="userauthbox" id='login' style={{transform: "translate(-50%, -50%)"}} onSubmit={userLogin}> {/*Swoops in from the left - Login */}

                <span>Login with</span> 
                <div className="userinputs" >
                
                    <input type="text" id='emaillogin' value={emailquery} onChange={(e) => setEmailquery(e.target.value)} placeholder='Type your email or username'/>
                    <input type="text" id='passwdlogin'  value={passwordquery} onChange={(e) => setPasswordquery(e.target.value)} placeholder='Type your password'/>
                    
                    <div style={{display: "flex", flexDirection: "row", margin: "0 auto 0 3rem", width: "75%"}}>
                    
                    <input type="checkbox" id='plsremember' value={"Remember me"}/>
                    <label htmlFor="plsremember">Remember Me</label>
                    </div>
                    <button type="submit">Login</button>

                    <span style={{margin: "0 auto"}}>--------OR----------</span>
                    <div className="logoauth-box" style={{margin: "0 auto"}}>
                        <img src={applelogo} alt="apple" style={{width: "40px", margin: "0 1rem"}}/>
                        <img src={googlelogo} alt="google" style={{width: "40px", margin: "0 1rem"}}/>
                    </div>
                
                    <span className='not-txt' onClick={()=> showRegister()}>Not a user yet? Then Register!</span>
                  
                </div>
    
                </form>
            )}
            
            {showRegisterBox === true && (
            <form className="userauthbox" id='register' style={{transform: "translate(-50%, -50%)"}} > {/*Swoops in from the right - Register*/}
                <span>Register With</span>

            <div className="userinputs">
                <input type="text" value={usernamequery} onChange={(e) => setUsernamequery(e.target.value)} placeholder='Type your username'/>
                <input type="text" value={emailquery} onChange={(e) => setEmailquery(e.target.value)} placeholder='Type your email'/>
                <input type="text" value={passwordquery} onChange={(e) => setPasswordquery(e.target.value)} placeholder='Type your password'/>
                
                <div style={{display: "flex", flexDirection: "row", margin: "0 auto 0 3rem", width: "75%"}}>
                    <input type="checkbox" id='plsremember' value={"Remember me"}/>
                    <label htmlFor="plsremember">Remember Me</label>
                </div>
                <button type="submit">Register</button>

                <span style={{margin: "0 auto"}}>--------OR----------</span>
                    <div className="logoauth-box" style={{margin: "0 auto"}}>
                        <img src={applelogo} alt="apple" style={{width: "40px", margin: "0 1rem"}}/>
                        <img src={googlelogo} alt="google" style={{width: "40px", margin: "0 1rem"}}/>
                    </div>
                <span className='not-txt' onClick={()=> showLogin()}>Already a user? Then login!</span>
            </div>


             </form>)}
            </>
             ):(
            <>
             <div className='profile-page-container'>
                <div className="anouncement-ppage">
                    <h3>My Profile Information and Settings</h3>

                    <ul className="islogged-container">
                        <li><h3>Options</h3></li>
                        <li><h3><Link to={"/favorites"} style={{color: "var(--base-text-dark)"}}>Show My Favorites</Link></h3></li>
                        <li><h3 onClick={logout} style={{cursor: "pointer"}}>Logout</h3></li>
                    </ul>

{showstats && (<div id="statswrapper">
                        <h3>Statistics Summarized:</h3>
                    <ul className="islogged-container">
                        <li><h3>Date Joined: <p style={{color: "var(--generic-tag)", margin: 0, width: "max-content"}}>{userData.DateCreated}</p></h3></li>
                        <li><h3>Series Uploaded:<p style={{color: "var(--generic-tag)", margin: 0, width: "max-content"}}>{userData.seriesUploaded}</p></h3></li>
                    </ul>
                </div>)
}
         
                </div>
            </div>

             <div className="profile-info-container">
                {/*Currently dummy data. Will have dynamic data later */}
                
                <div onClick={updateBannerPic} className="banner-container" style={{backgroundImage: `url(${userData.userBanner})`}}></div>
        
                <div className="profile-user-display">
                    <img className="profile-icon" src={userData.userIcon} alt='user profile picture'/>
                    <span className='user-title'><strong>{userData.userName}</strong> - {userData.role}</span>
                </div>

                <div className="profile-content">

                <section id="mysig"> 
                    <span className='user-sig' style={{fontFamily: "Verdana, Arial"}}>
                        ~<strong>{userData.signature}</strong>~
                    </span>
                </section>

                <section id="btnsection">
                    <button type='button' className='profile-button' onClick={()=> {navigate(`/profile/${userData.userID}/update`)}}>Edit Profile</button>
                    <button type='button' className='profile-button'>View Saved Searches</button>
                    <button type='button' className='profile-button' onClick={()=> setShowstats(!showstats)}>Toggle Statistics</button>
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
                    <p> {userData.userabout}
                    </p>
                </section>
                

                </div>
             </div>  {/*END OF MAIN Profile Page CONTENT */}

            
             
            </> 
           
            )}

            <Footer></Footer>
        </div>
        
        
    )
}

export default Profile