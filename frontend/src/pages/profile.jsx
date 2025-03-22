import { useState, useEffect } from 'react'
import { SearchBar, Topnav } from "../components"
import "../style/Posts.css"
function Profile(){
    return(

        <div className="main-content">
        
            <Topnav></Topnav> 
            <SearchBar></SearchBar>
        

       
        </div>
        
        
    )
}

export default Profile