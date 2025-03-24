
import { useEffect, useState, useContext } from "react"
import { PostItemsContext } from "../contexts/postItemContext"
import { PageNumContext } from "../contexts/pageNumContext"
import Sidebar from "./sidebar"


function PostBox(){
    const [seriesImg, setSeriesImg] = useState([])
    const {posts} = useContext(PostItemsContext)

    const {page} = useContext(PageNumContext)
    const {setPage} = useContext(PageNumContext)

    const [lenoutput, setLenoutput] = useState(0)
    const [tags, setTags] = useState([])

    const extractNum = (e) =>{
        //extracts the number from the box icon clicked which is used to change the page we are on.
        const extractedNum = e.target.textContent
        console.log(extractedNum)
        setPage(extractedNum)
    }

    function incFunction(){
        console.log(page)
        setPage(page + 1)
    }

    function decFunction(){
        if (page - 1 != 0){
            setPage(page-1)
        }
        else{
            return
        }
    }

    

    const seriesPostPics = posts.length > 0 ? posts : seriesImg

    useEffect(()=>{
        const returnBooruPics = async () =>{ //On page load or when page changes, it extracts series
            const url = `http://127.0.0.1:8000/returnBooruPics/${page}`
            
            const response = await fetch(url, {method: "GET"})
            const data = await response.json()
    
            setSeriesImg(data.urls)
            setLenoutput(data.numpages) //used to calc number of page num boxes needed
            setTags(data.tags)
            sessionStorage.setItem("pagenumber", `${page}`) //set the item regardless

            console.log(data)
        }

        returnBooruPics()


    },[page, posts])//make tag names unique next.
    return (
        <> 
        <Sidebar data={tags}></Sidebar>
        <div className="postcontent-container">
        {//produces all the posts and their images
        seriesPostPics.map((e, index) => (<img loading="lazy" onClick={() => console.log(posts)} key={index} src={e} alt="Post" className="postitem"/>))
            }
            
        </div>

        <div className="footer-container">
            <div className="page-nums-container">
                <ul className="list-num-page">
                {lenoutput>1 ? (//conditionally prints the previous button
                    <li className="pageboxes"><svg onClick={()=> decFunction()}  className="next-page-arrow" xmlns="http://www.w3.org/2000/svg"  viewBox="0 -960 960 960" >
                        <path d="M640-80 240-480l400-400 71 71-329 329 329 329-71 71Z"/>
                    </svg>
                </li>): null}
                

                   {lenoutput > 0 && 6 ? (Array.apply(null, Array(lenoutput)).map((e, index) => 
                   (<li onClick={extractNum} className="pageboxes" key={index}>{index + 1}</li>
                   ))
                    ): null} 

                    
                <li className="pageboxes"><svg onClick={() => incFunction()} className='next-page-arrow' xmlns="http://www.w3.org/2000/svg"  viewBox="0 -960 960 960">
                    <path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z"/>
                    </svg>
                </li>   

                </ul>
            </div>
        </div>
        </>
    )
}

export default PostBox