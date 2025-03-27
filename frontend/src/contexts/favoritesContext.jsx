import { useState, useContext, createContext } from "react";

export const favoritesitems = createContext(null)

export function FavContext({children}){
    const [favorited, setFavorited] = useState(()=>{
        const storedFavs = localStorage.getItem("favorites")
        console.log(JSON.parse(storedFavs))
        return storedFavs ? JSON.parse(storedFavs) : []

    })

    return (
        <favoritesitems.Provider value={{favorited, setFavorited}}>
            {children}
        </favoritesitems.Provider>
    )
}