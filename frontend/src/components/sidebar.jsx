import React from "react"
import "../style/Posts.css"
import {useState, useContext, createContext} from 'react'
import PostItemsContext from "../contexts/postItemContext"

function Sidebar({data}){
    const {setPosts} = useContext(PostItemsContext)
    const searchbar = document.getElementById("SearchInput")

    const linktotag = async (e) => {
        searchbar.value = e.target.textContent
        let url = `http://localhost:8000/extracttag/?tag=${encodeURIComponent(e.target.textContent)}`

        const response = await fetch(url, {method: "GET"})
        const data = await response.json()

        setPosts(data.url)
   


    }



    return (
            <div className="sidenav-container">
               <p>Tags:</p> 
                    <ul className="tag-container">
                        {data.map((e, index)=>(<li key={index} onClick={linktotag} className="tagoutput">{data[index]}</li>))}
                    </ul>
            </div>
    
    )
}

export default Sidebar