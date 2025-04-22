import { useState, useEffect, useContext, useRef } from 'react'
import { SearchBar, Topnav, Footer } from "../components"
import { favoritesitems } from '../contexts/favoritesContext'
import { loggedIn } from '../contexts/loggedinContext'
import {SavedSearch} from "../pages"

import { Link, useNavigate } from 'react-router-dom'
import "../style/Posts.css"
import "../style/Profile.css"
import "../style/LoadingBG.css"

import applelogo from "../assets/apple-logo.png"
import googlelogo from "../assets/google.png"


function Profile(){
    //elements
    const emaillogininput = document.getElementById("emaillogin")
    const passwdlogininput = document.getElementById("passwdlogin")

    const [logininfo, setLogininfo] = useState({emailregister: "", passwdregister: ""})
    const [registerinfo, setRegisterinfo] = useState({emailregister: "", passwdregister: ""})



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
    const LoginBoxRef = useRef()
    const RegisterBoxRef = useRef()

    const {logged, setLogged} = useContext(loggedIn)
    const {userID, setUserID} = useContext(loggedIn)
    const {userIcon, setUserIcon} = useContext(loggedIn)
    const {showLoginBox, setShowLoginBox} = useContext(loggedIn)
    const {showRegisterBox, setShowRegisterBox} = useContext(loggedIn)
    const {loadingcredentials, setLoadingcredentials} = useContext(loggedIn)
    const {userName, setUserName} = useContext(loggedIn)
    const {setUserRole} = useContext(loggedIn)
    const {userRole} = useContext(loggedIn)

    const {favorited} = useContext(favoritesitems)

    const [emailquery, setEmailquery] = useState("")
    const [usernamequery, setUsernamequery] = useState("")
    const [passwordquery, setPasswordquery] = useState("")
    const [showstats, setShowstats] = useState(false)
    const [favoritesData, setFavoritesData] = useState({})
    const [showSearch, setShowSearch] = useState(false)

    const [ticked, setTicked] = useState(false)

    const [userData, setUserData] = useState({})

    useEffect(()=>{
        if (LoginBoxRef.current !== null){
            const handleclickoutside =(event)=>{
                if (!LoginBoxRef.current.contains(event.target)){
                    setShowLoginBox(false)
                }
            }
            document.addEventListener("mousedown", handleclickoutside);
            return () => {
            document.removeEventListener("mousedown", handleclickoutside);
            };
        }
    },[showLoginBox])

    useEffect(()=>{
        if (RegisterBoxRef.current){
            const handleclickoutside =(event)=>{
                if (!RegisterBoxRef.current.contains(event.target)){
                
                    setShowRegisterBox(false)
                }
            }
            document.addEventListener("mousedown", handleclickoutside);
            return () => {
            document.removeEventListener("mousedown", handleclickoutside);
            };
        }
    },[showRegisterBox])

    useEffect(()=>{
        const getLoginCreds = async () =>{
            //before the user ID is even set we can see if the end user has the tokens to log in automatically. Skipping the filler
            const token = localStorage.getItem("access_token")

            setLoadingcredentials(true)

            if (!token || token == "null") {
                console.log("No token found");
                localStorage.removeItem("access_token")
                setLoadingcredentials(false)
                setLogged(false);
                return;
            }
            else if (token === null || token === undefined){
                console.log("No token found");
                localStorage.removeItem("access_token")
                setLoadingcredentials(false)
                setLogged(false);
                return;
            }
            const url = `http://${import.meta.env.VITE_PERSONAL_IP}:8000/getuser`

            const response = await fetch(url, {method: "GET", headers: {"Authorization": `Bearer ${token}`}})

            if (!response.ok) {
                console.warn("Token is invalid or expired");
                localStorage.removeItem("access_token"); 
                setLoadingcredentials(false)
                setLogged(false);
                return;
            } else{
                const data = await response.json()
                console.log("USER DATA: ", data)
                setUserID(data.userID)
                setLogged(true)
                setUserName(data.userName)
                userInfoData(data.userID)
                setLoadingcredentials(false)
                
            }
     
               
            

        }
        getLoginCreds()
    }, [])

    useEffect(()=>{

        //ONCE the user ID has been set, we can now render this thingy
        if (userID.length>0){
            userInfoData(userID)
        }

        const extractFavorites = async () =>{
            const url = `http://${import.meta.env.VITE_PERSONAL_IP}:8000/returnFavorites`

            if (favorited.length <= 0){
                console.log("The user does not have favorites")
                return
            }
    
            try{
                console.log(favorited)
                const response = await fetch(url, 
                {method: "POST",
                headers: {"content-type": "application/json",

                        'Access-Control-Allow-Headers': "*",
                        'Access-Control-Allow-Methods': "*"},
                body: JSON.stringify({arrFavorites: favorited})
                    }
                )

                const data = await response.json()
                setFavoritesData(data)
            }
                catch (error) {console.log(error)}
            
            }
            extractFavorites()
    }, [userID])



//FUNCTIONS --------------------------------------------------------------

    //WHEN LOGGED OUT
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
        console.log(showRegisterBox)
    }

    //LOGIN AND REGISTER
    const userLogin = async (e)=>{
        e.preventDefault()
        const url = `http://${import.meta.env.VITE_PERSONAL_IP}:8000/login`

        let uemail = emaillogininput.value
        let upasswd = passwdlogininput.value


        try{
        const response = await fetch(url, 
            {method: "POST",
                headers: {
                    "content-type": "application/json"},
            body: JSON.stringify({email: uemail, passwd: upasswd, ticked: ticked})
            }
            
        )

        const data = await response.json()
        console.log(data)

        if (data.message === true){
            setUserID(data.userID)
            setLogged(true)
            setUserName(data.userName)

            localStorage.setItem("access_token", data.access_token)
            
        }
        else{
            console.log("Sorry, something has gone wrong. This is the reason: ", data.elaborate)
            alert(data.elaborate)
        }
        }
        catch (error){
            console.log("Something has gone wrong: ", error)
        }

    }

    const userRegister = async(e)=>{
        e.preventDefault()
        const url = `https://${import.meta.env.VITE_LAMBDA_DOMAIN}/register`
        
        setLoadingcredentials(true)
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "content-type": "application/json",},
            body: JSON.stringify({email: emailquery, passwd: passwordquery, username: usernamequery, ticked: ticked})
            })

        const data = await response.json()

        if (data.message === true){
            alert(data.elaborate)
            setUserID(data.userID)
            setLogged(true)
            setUserName(usernamequery)
            setLoadingcredentials(false)

            localStorage.setItem("access_token", data.access_token)
        }
    }
    //END OF LOGIN AND REGISTER


    //API CALLS

    async function userInfoData(userID){

        //Extracts user info for the profile page
        const url = `http://${import.meta.env.VITE_PERSONAL_IP}:8000/returnUserInfo/${userID}`
    try{
        const response = await fetch(url, {method: "GET"})
        const data = await response.json()

        console.log("Data: ", data)
        setUserData(data)
        setUserIcon(data.userIcon)
        setUserRole(data.role)
        setUserName(data.userName)
        setLogged(true)

        setUserData((prevdata) =>({...prevdata, DateCreated: new Date(prevdata.DateCreated).toLocaleDateString()}))




        
    }
    catch (error){
        console.log("An unforseen error has occured")
    }
        
    }

    //WHEN LOGGED IN



    const togglestats = ()=>{
        setShowstats(!showstats)
    }

    const logout = async () =>{
        setLogged(!logged)
        setUserID("")
        setUserIcon("")
        localStorage.removeItem("access_token")
        console.log("Thank you for using the service. Bye!")
    }
    const [showsaved, setShowsaved] = useState(false)
    const returnSavedSearch = ()=>{
        const searchinfo = localStorage.getItem("savedsearch")

        if (!searchinfo || searchinfo === null || searchinfo === undefined || searchinfo === "null"){
            return []
        }

        const arr = JSON.parse(searchinfo)
        console.log(arr)

        return arr
    }
//JSX ---------------------------------------------------

if (!userData){ return (<div className='spinning-circle-container'></div>)}

    return(

        <div className="main-content profile-page-area" style={{position: "relative"}}>
            <Topnav>
                <li className='menulinks sidebar-to-topnav'><Link to={`/profile/${userID}/uploads`}><h3 style={{cursor: "pointer"}}>Upload</h3></Link></li>
                {userRole === "ADMIN" && (<li className='menulinks sidebar-to-topnav'><Link to={`/profile/${userID}/deletions`}><h3 style={{cursor: "pointer", color: "#c21237 "}}>Deletions</h3></Link></li>)}
               
                <li className='menulinks sidebar-to-topnav'><h3><Link to={"/favorites"} >Show My Favorites</Link></h3></li>
                <li className='menulinks sidebar-to-topnav'><h3 onClick={logout} style={{cursor: "pointer"}}>Logout</h3></li>
            </Topnav> 

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
                <form className="userauthbox" id='login' ref={LoginBoxRef} style={{transform: "translate(-50%, -50%)"}} onSubmit={userLogin}> {/*Swoops in from the left - Login */}

                <span>Login with</span> 
                <div className="userinputs" >
                
                    <input type="text" id='emaillogin' value={emailquery} onChange={(e) => setEmailquery(e.target.value)} placeholder='Type your email or username'/>
                    <input type="text" id='passwdlogin'  value={passwordquery} onChange={(e) => setPasswordquery(e.target.value)} placeholder='Type your password'/>
                    
                    <div style={{display: "flex", flexDirection: "row", margin: "0 auto 0 3rem", width: "75%"}}>
                    
                    <input type="checkbox" id='plsremember' onClick={()=> setTicked(!ticked)} value={"Remember me"}/>
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
            <form onSubmit={userRegister} ref={RegisterBoxRef} className="userauthbox" id='register' style={{transform: "translate(-50%, -50%)"}} > {/*Swoops in from the right - Register*/}
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
             <div className='profile-page-container hide-it'>
                <div className="anouncement-ppage">
                    <h3>My Profile Information and Settings</h3>

                    <ul className="islogged-container">
                        <li><Link to={`/profile/${userID}/uploads`}><h3 style={{cursor: "pointer", color: "var(--base-text-dark)"}}>Upload</h3></Link></li>
                        {userRole === "ADMIN" && (<li><Link to={`/profile/${userID}/${userRole}/deletions`}><h3 style={{cursor: "pointer", color: "#c21237 "}}>Deletions</h3></Link></li>)}
                        {userRole === "ADMIN" && (<li><Link to={`/profile/${userID}/${userRole}/users/deletions`}><h3 style={{cursor: "pointer", color: "#c21237 "}}>Bans</h3></Link></li>)}
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
                
                <div  className="banner-container" style={{backgroundImage: `url(${userData.userBanner})`}}></div>
        
                <section className="profile-user-display">
                    <img className="profile-icon" src={userData.userIcon} alt='user profile picture'/>
                    <span className='user-title'><strong>{userData.userName}</strong> - {userData.role}</span>
                </section>

                <div className="profile-content">

                <section id="mysig"> 
                    <span className='user-sig' style={{fontFamily: "Verdana, Arial"}}>
                        ~<strong>{userData.signature}</strong>~
                    </span>
                </section>

                <section id="btnsection">
                    <button type='button' className='profile-button' onClick={()=> {navigate(`/profile/${userData.userID}/update`)}}>Edit Profile</button>
                    <button type='button' className='profile-button' onClick={()=> setShowsaved(!showsaved)}>View Saved Searches</button>
                    <button type='button' className='profile-button' onClick={()=> setShowstats(!showstats)}>Toggle Statistics</button>
                </section>

          
                <section id='myfavorites'>
                    <h1 className='header-section' style={{fontSize: "2rem"}}>Favorites:</h1>
                    <ul className="show-my-favs-container">
                        {favoritesData.length >0 && (favoritesData.map((e, index)=>(<li key={index}><img className='img-unit-favs' src={e.thumbnail} alt="" /></li>)))}
                    </ul>


                </section>

                <section id="myself">
                    <h1 className="header-section" style={{fontSize: "2rem"}}>About Myself:</h1>
                    <p> {userData.userabout}
                    </p>
                </section>

                {showsaved && (<section id="savedsrch">
                    <h1 className="header-section" style={{fontSize: "2rem"}}>Saved Searches:</h1>
                    <p>You can copy and paste your saved searches into the search bar if you want to search something you wanted to get back to later again.</p>
                    
                    <SavedSearch data={returnSavedSearch()}></SavedSearch>
                </section>)}
                

                </div>
             </div>  {/*END OF MAIN Profile Page CONTENT */}

            
             
            </> 
           
            )}

            <Footer></Footer>
        </div>
        
        
    )
    
}

export default Profile