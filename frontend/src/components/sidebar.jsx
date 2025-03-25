import React from "react"
import "../style/Posts.css"
import {useState, useContext, createContext} from 'react'
import PostItemsContext from "../contexts/postItemContext"

function Sidebar({data}){
    const {setPosts} = useContext(PostItemsContext)
    const searchbar = document.getElementById("SearchInput")
    const listoftags = document.querySelectorAll(".tagoutput")

    const linktotag = async (e) => {
        searchbar.value = e.target.textContent
        let url = `http://localhost:8000/extracttag/?tag=${encodeURIComponent(e.target.textContent)}`

        const response = await fetch(url, {method: "GET"})
        const data = await response.json()
        console.log(data)

        if (data){
            setPosts(data.url)
            
        }
        else{
            console.log("You did not return any data")
        }
        
   


    }



    return (
            <div className="sidenav-container"> 
               <h3 className="tag-header">Tags</h3>
                    <ul className="tag-container">{
                    data.map((e, index)=>(
data[index].includes("shonen") || data[index].includes("seinen") || data[index].includes("shounen") || data[index].includes("shoujo")  ?
                        
                        (<li key={index} onClick={linktotag} className="tagoutput demographic-tag">{data[index]}</li>):(
                        <li key={index} onClick={linktotag} className="tagoutput generic-tag">{data[index]}</li>
                        )
                        
                        
                    ))}
                    </ul>
            </div>
    
            )
}

export default Sidebar