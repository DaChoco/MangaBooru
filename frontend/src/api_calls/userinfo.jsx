import { loggedIn } from "../contexts/loggedinContext"
import { useContext } from "react"

export async function userInfoData(userID){
    const {
        userName, setUserName,
        loadingcredentials, setLoadingcredentials,
        logged, setLogged, 
        userID, setUserID, 
        userIcon, setUserIcon, 
        showLoginBox, setShowLoginBox, 
        showRegisterBox, setShowRegisterBox, 
        userRole, setUserRole
    } = useContext(loggedIn)

    //Extracts user info for the profile page
    const url = `http://${import.meta.env.VITE_PERSONAL_IP}:8000/returnUserInfo/${userID}`
try{
    const response = await fetch(url, {method: "GET"})
    const data = await response.json()

    console.log("Data: ", data)
    setUserIcon(data.userIcon)
    setUserRole(data.role)

}
catch (error){
    console.log("An unforseen error has occured")
}
    
}
