
import React, { useEffect, useState, useContext } from "react"
import { PostItemsContext } from "../contexts/postItemContext"
import { PageNumContext } from "../contexts/pageNumContext"
import { useNavigate } from "react-router-dom"
import Sidebar from "./sidebar"
import SearchBar from "./searchsect"


function PostBox(){
    const [seriesImg, setSeriesImg] = useState([])
    const {posts} = useContext(PostItemsContext)

    const navigate = useNavigate()

    const {page} = useContext(PageNumContext)
    const {setPage} = useContext(PageNumContext)

    const [lenoutput, setLenoutput] = useState(0)
    const [tags, setTags] = useState([])

    const [seriesID, setSeriesID] = useState([])

    const extractNum = (e) =>{
        //extracts the number from the box icon clicked which is used to change the page we are on.
        const extractedNum = e.target.textContent
        setPage(extractedNum)
    }

    function incFunction(){
        if (page+1 <= lenoutput){
            const newNum = page + 1
            setPage(newNum)
        }
        else{
            return
        }
        
    }

    function decFunction(){
        if (page - 1 >= 1){
            const newNum = page - 1
            setPage(newNum)
        }
        else{
            return
        }
    }

     function extractSeriesID(index){
        const selectedSeries = seriesID[index]
        navigate(`/posts/${selectedSeries}`)
    }

    const promptedPage = () =>{
        try{
        const userPage = parseInt(prompt("What page would you like to go to?", `${page+1}`))

        if (userPage == null || !userPage){
            console.log("The user entered nothing")
            return
        }
        else{
            setPage(userPage)
        }
    } 
    catch (error){
        setPage(page)
        console.log("This number is not an integer")
    }
    }

    const seriesPostPics = posts?.length > 0 ? posts : seriesImg

    
    let info
    useEffect(()=>{
        const returnBooruPics = async () =>{ //On page load or when page changes, it extracts series
            const url = `http://127.0.0.1:8000/returnBooruPics/${page}`
            
            const response = await fetch(url, {method: "GET"})
            const data = await response.json()
    
            setSeriesImg(data.urls)
            setLenoutput(data.numpages) //used to calc number of page num boxes needed
            setTags(data.tags)
    
            info = data
            setSeriesID(data.series)
            console.log(lenoutput)
            sessionStorage.setItem("pagenumber", `${page}`) //set the item regardless
        }

        returnBooruPics()


    },[page])//make tag names unique next.
    return (
        <> 
        <SearchBar data={{lenoutput, setLenoutput}}></SearchBar>
        <Sidebar data={tags}></Sidebar>
        <div className="postcontent-container">
        {//produces all the posts and their images
        seriesPostPics.map((e, index) => (<img loading="lazy" onClick={() => extractSeriesID(index)} key={index} src={e} alt="Post" className="postitem"/>))
            }
            
        </div>

        <div className="footer-container">
            <div className="page-nums-container">
                <ul className="list-num-page">
                {lenoutput>0 && (//conditionally prints the previous button
                    <li className="pageboxes"><svg onClick={()=> decFunction()}  className="next-page-arrow" xmlns="http://www.w3.org/2000/svg"  viewBox="0 -960 960 960" >
                        <path d="M640-80 240-480l400-400 71 71-329 329 329 329-71 71Z"/>
                    </svg>
                </li>)}
                

                   {lenoutput > 0 && lenoutput <= 6 ? (Array.apply(null, Array(lenoutput)).map((e, index) => 
                   (<li onClick={extractNum} className="pageboxes" key={index}>{index + 1}</li>
                   ))
                    ): 
                    (<>
                        {Array.apply(null, Array(4)).map((e, index) => 
                        (
                        page -1 == index ? (<li onClick={extractNum} className="pageboxes highlight" key={index}>{index + 1}</li>):(<li onClick={extractNum} className="pageboxes" key={index}>{index + 1}</li>)
                        ))
                        }
                        <li className="pageboxes" onClick={promptedPage}>...</li>
                        <li className="pageboxes">{lenoutput}</li>
                        </>
                        
                    )} 

                    
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