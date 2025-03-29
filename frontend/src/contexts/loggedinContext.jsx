import { useState, useContext, createContext } from "react";

export const loggedIn = createContext(false)

export function LoggedInContext({children}){

    const [showLoginBox, setShowLoginBox] = useState(false)
    const [showRegisterBox, setShowRegisterBox] = useState(false)

    //design your useState to extract log in status later
    const [logged, setLogged] = useState(false)
    const [userID, setUserID] = useState("") //set this in tandem with a get user esque api call on load with a use effect

    return (
        <loggedIn.Provider value={{logged, setLogged, userID, setUserID, showLoginBox, setShowLoginBox, showRegisterBox, setShowRegisterBox}}>
            {children}
        </loggedIn.Provider>
    )
}