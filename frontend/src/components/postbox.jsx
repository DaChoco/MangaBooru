import React from "react"
import { useEffect, useState } from "react"

function PostBox(){
    const [seriesImg, setSeriesImg] = useState([])
    const returnBooruPics = async () =>{

        const url = "http://127.0.0.1:8000/returnBooruPics"
        const response = await fetch(url, {method: "GET"})
        const data = await response.json()

        console.log(data.urls)
        setSeriesImg(data.urls)


    }

    useEffect(()=>{
        returnBooruPics()
        

    },[])
    return(
        <>
        <div className="postcontent-container">
        {
        seriesImg.map((e, index) => (<img key={index} src={e} alt="Post" className="postitem"/>))
            }
            
        </div>
        </>
    )
}

export default PostBox