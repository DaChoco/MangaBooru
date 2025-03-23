
import { useEffect, useState, useContext } from "react"
import { PostItemsContext } from "../contexts/postItemContext"
import { PageNumContext } from "../contexts/pageNumContext"


function PostBox(){
    const [seriesImg, setSeriesImg] = useState([])
    const {posts} = useContext(PostItemsContext)

    const {page} = useContext(PageNumContext)

    const returnBooruPics = async () =>{
 

        const url = `http://127.0.0.1:8000/returnBooruPics/${page}`
        const response = await fetch(url, {method: "GET"})
        const data = await response.json()

        setSeriesImg(data.urls)
    

    }
  



    const seriesPostPics = posts.length > 0 ? posts : seriesImg

    useEffect(()=>{
        returnBooruPics()
 
        

    },[page])
    return(
        <>
        <div className="postcontent-container">
        {
        seriesPostPics.map((e, index) => (<img onClick={() => console.log(posts)} key={index} src={e} alt="Post" className="postitem"/>))
            }
            
        </div>
        </>
    )
}

export default PostBox