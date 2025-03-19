import { useState, useEffect } from 'react'
import {SearchBar} from "../components"
import {Link} from "react-router-dom"
function Home(){
    return(
        
        <div className="home-container">
            <h1>MangaBooru</h1>
            <ul className="optionslist">
                <li><Link to="/posts">Browse Posts</Link></li>
                <li><Link to="/account">My Account</Link></li>
                <li><Link to="/tagspage">All Tags</Link></li>
            </ul>
            <SearchBar></SearchBar>
        </div>
    

    )
}

export default Home