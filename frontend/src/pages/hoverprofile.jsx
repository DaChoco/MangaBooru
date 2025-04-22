import {loggedIn} from "../contexts/loggedinContext"
import { useContext } from "react"
import "../style/Posts.css"
function HoverProfile(){
    const {
        userName, setUserName,loadingcredentials, setLoadingcredentials,
        logged, setLogged, userID, setUserID, 
        userIcon, setUserIcon, userRole, setUserRole} = useContext(loggedIn)
    
        const logout = async () =>{
            setLogged(!logged)
            setUserID("")
            setUserIcon("")
            localStorage.removeItem("access_token")
            console.log("Thank you for using the service. Bye!")
        }
    return (<>
        {userIcon && userIcon !== "" && (<div className="hover-box-container">
            <img src={userIcon} alt="user-icon" className="user-spoke-icon" />

            <p>{userName}</p>
            <p>{userRole}</p>
            <p onClick={logout}>Logout</p>


        </div>)}
        </>
    )

}

export default HoverProfile