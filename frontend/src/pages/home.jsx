import { useState, useEffect, useContext } from 'react'
import {SearchBar} from "../components"
import {Link} from "react-router-dom"
import { PageNumContext } from '../contexts/pageNumContext'
import "../style/Home.css"
function Home(){
    const [isLoading, setIsLoading] = useState(true)
    const [progressbar, setProgressBar] = useState(0) //will use later
    const htmlpage = document.documentElement;

    const {setPage} = useContext(PageNumContext)

    useEffect(()=>{
        setIsLoading(false)
        setPage(1)
        console.log("Page loaded")

    }, [])

    return(
        <> 
        {isLoading ? (
            <div className='LOADING-CONTAINER'>
                <span className='LOADING-TXT'>Loading...</span>
                <progress value={0.75}></progress>
            </div> 
        ):(
            <div className="home-container">
                <h1>MangaBooru</h1>
                    <ul className="optionslist">
                        <li><strong><Link to="/posts">Browse Posts</Link></strong></li>
                        <li><Link to="/profile">My Account</Link></li>
                        <li><Link to="/tagspage">All Tags</Link></li>
                    </ul>
                <SearchBar data={{ lenoutput: 0, setLenoutput: () => {} }}></SearchBar>

                <p className='small-home-txt'>Contact here - About me</p>
            </div>)}
        
        </>
    

    )
}

export default Home