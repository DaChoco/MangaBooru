import { SearchBar, Topnav, Sidebar, PostBox } from "../components"
import { createContext, useState, useContext} from "react"
import { PageNumContext } from "../contexts/pageNumContext"
import "../style/Posts.css"
function Posts(){
    const {setPage} = useContext(PageNumContext)
    const {page} = useContext(PageNumContext)

   

 
    return (
        
    <div className="main-content">
 
            <Topnav></Topnav> 
            <PostBox></PostBox>
    
    </div>
        
 
        
    )
}

export default Posts