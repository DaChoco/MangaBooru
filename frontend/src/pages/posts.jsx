import { SearchBar, Topnav, Sidebar, PostBox, Footer } from "../components"
import { createContext, useState, useContext} from "react"
import { PageNumContext } from "../contexts/pageNumContext"
import "../style/Posts.css"
function Posts(){

    return (
        
    <div className="main-content">
 
            <Topnav></Topnav> 
            <PostBox></PostBox>
            <Footer></Footer>
    
    </div>
        
 
        
    )
}

export default Posts