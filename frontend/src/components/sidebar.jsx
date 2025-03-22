import React from "react"
import "../style/Posts.css"

function Sidebar({data, index}){

    const returnTags = async () => {

        const url = 'http://localhost:8000/returnMangaInfo'
    }
    return (
            <div className="sidenav-container">
               <p>Tags:</p> 
                    <ul className="tag-container">
                        <li className="tagoutput">{data.results[index].tagName}</li>
                    </ul>
                <p>Statistics</p>
                    <ul className="statistics-container">
                        <li className="statsoutput">{data.results[index].dataPosted}</li>
                    </ul>
            </div>
    
    )
}

export default Sidebar