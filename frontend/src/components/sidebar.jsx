import React from "react"
import "../style/Posts.css"
import {useState, useContext, createContext} from 'react'
import { useNavigate } from "react-router-dom"
import PostItemsContext from "../contexts/postItemContext"

function Sidebar({data, children}){
    const {setPosts} = useContext(PostItemsContext)
    const searchbar = document.getElementById("SearchInput")
    const listoftags = document.querySelectorAll(".tagoutput")
    const navigate = useNavigate()

    const linktotag = async (e) => {
        searchbar.value = e.target.textContent
        let url = `http://${import.meta.env.VITE_PERSONAL_IP}:8000/extracttag/?tag=${encodeURIComponent(e.target.textContent)}`

        const response = await fetch(url, {method: "GET"})
        const data = await response.json()
        console.log(data)

        if (data){
            setPosts(data.url)
            navigate("/posts")
            
        }
        else{
            console.log("You did not return any data")
        }
        
   


    }



    return (
            <div className="sidenav-container"> 
               <h3 className="tag-header">Tags</h3>
                {children}
                {typeof data[0] === "string" && (
                    <ul className="tag-container">{
                    data.map((e, index)=>(e.includes("shonen") || e.includes("seinen") || e.includes("shounen") || e.includes("shoujo")  ?
                        
                        (<li key={index} onClick={linktotag} className="tagoutput demographic-tag">{data[index]}</li>):(
                        <li key={index} onClick={linktotag} className="tagoutput generic-tag">{data[index]}</li>
                        ) 
                    ))}
                    </ul>)
}

            </div>
    
            )
}

export default Sidebar