import { loggedIn } from "../contexts/loggedinContext"
import { useContext } from "react"

export async function userInfoData(userID){
    //Extracts user info for the profile page
    const url = `https://${import.meta.env.VITE_LAMBDA_DOMAIN}/returnUserInfo/${userID}`
try{
    const response = await fetch(url, {method: "GET"})
    const data = await response.json()

    console.log("Data: ", data)
    return data

}
catch (error){
    console.log("An unforseen error has occured")
}
    
}
