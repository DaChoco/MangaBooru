import { useState, useEffect } from 'react'
import {SearchBar} from "../components"
import {Link} from "react-router-dom"
import "../style/Home.css"
function Home(){
    return(
        
        <div className="home-container">
            <h1>MangaBooru</h1>
            <ul className="optionslist">
                <li><strong><Link to="/posts">Browse Posts</Link></strong></li>
                <li><Link to="/profile">My Account</Link></li>
                <li><Link to="/tagspage">All Tags</Link></li>
            </ul>
            <SearchBar></SearchBar>

            <p className='small-home-txt'>Contact here - About me</p>
        </div>
    

    )
}

export default Home