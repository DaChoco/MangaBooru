import { useState, useContext, createContext } from "react";

export const loggedIn = createContext(null)

export function LoggedInContext({children}){

    const [showLoginBox, setShowLoginBox] = useState(false)
    const [showRegisterBox, setShowRegisterBox] = useState(false)

    //design your useState to extract log in status later
    const [logged, setLogged] = useState(false)
    const [userID, setUserID] = useState("cdbaf1d8-044d-11f0-9458-b48c9d5f0a08") //set this in tandem with a get user esque api call on load with a use effect
    const [userIcon, setUserIcon] = useState("")
    const [userBanner, setUserBanner] = useState("")
    return (
        <loggedIn.Provider value={{logged, setLogged, userID, setUserID, userIcon, setUserIcon, showLoginBox, setShowLoginBox, showRegisterBox, setShowRegisterBox}}>
            {children}
        </loggedIn.Provider>
    )
}