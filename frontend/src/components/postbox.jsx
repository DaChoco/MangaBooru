import React from "react"
import { useEffect, useState, useContext } from "react"
import { PostItemsContext } from "./postItemContext"


function PostBox(){
    const [seriesImg, setSeriesImg] = useState([])
    const {posts} = useContext(PostItemsContext)

    const seriesPostPics = posts.length > 0 ? posts : seriesImg
    console.log(posts)
    
 

    

    useEffect(()=>{
        const returnBooruPics = async () =>{

            const url = "http://127.0.0.1:8000/returnBooruPics"
            const response = await fetch(url, {method: "GET"})
            const data = await response.json()
    
            console.log(data.urls)
            setSeriesImg(data.urls)
        
    
        }

        returnBooruPics()
 
        

    },[])
    return(
        <>
        <div className="postcontent-container">
        {
        seriesPostPics.map((e, index) => (<img onClick={console.log(posts)} key={index} src={e} alt="Post" className="postitem"/>))
            }
            
        </div>
        </>
    )
}

export default PostBox