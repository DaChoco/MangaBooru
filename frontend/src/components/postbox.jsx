
import React, { useEffect, useState, useContext } from "react"
import { PostItemsContext } from "../contexts/postItemContext"
import { PageNumContext } from "../contexts/pageNumContext"
import { favoritesitems } from "../contexts/favoritesContext"
import { useNavigate } from "react-router-dom"
import {loggedIn} from "../contexts/loggedinContext"
import Sidebar from "./sidebar"
import SearchBar from "./searchsect"


function PostBox(){
    const {loadingcredentials, setLoadingcredentials} = useContext(loggedIn)
    const [seriesImg, setSeriesImg] = useState([])
    const {posts} = useContext(PostItemsContext)

    const navigate = useNavigate()

    const {page} = useContext(PageNumContext)
    const {setPage} = useContext(PageNumContext)

    const [lenoutput, setLenoutput] = useState(0)
    const {tags, setTags} = useContext(PostItemsContext)

    const {seriesID, setSeriesID} = useContext(PostItemsContext)

    const {favorited} = useContext(favoritesitems)
    const {setFavorited} = useContext(favoritesitems)

    function assignfav(index){
        setFavorited(favorited => [...favorited, seriesID[index]])
        console.log(favorited)
        localStorage.setItem("favorites", JSON.stringify(favorited))
    }

    function removefav(index){
        let new_arr = favorited.filter(item => item !== seriesID[index])
        setFavorited(new_arr)
        localStorage.setItem("favorites", JSON.stringify(favorited))

    }

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
            const url = `http://${import.meta.env.VITE_PERSONAL_IP}:8000/returnBooruPics/${page}`
            setLoadingcredentials(true)
            const response = await fetch(url, {method: "GET"})
            const data = await response.json()
            
            setLoadingcredentials(false)
            setSeriesImg(data.urls)
            setLenoutput(data.numpages) //used to calc number of page num boxes needed
            setTags(data.tags)
    
            info = data
            setSeriesID(data.series)
            console.log(lenoutput)
            sessionStorage.setItem("pagenumber", `${page}`) //set the item regardless
        }

        if (localStorage.getItem("favorites")){
            const storedfavs = localStorage.getItem("favorites")
            setFavorited(JSON.parse(storedfavs))
        }
        returnBooruPics()


    },[page])//make tag names unique next.
    return (
        <> 
        <SearchBar data={{lenoutput, setLenoutput}}></SearchBar>
        
        <div className="postcontent-container">
        {loadingcredentials && <div className="spinning-circle-container"></div>}
        {//produces all the posts and their images
        seriesPostPics.map((e, index) => (
        <div key={index} className="postitem">

         <div className="imgwrap">
            <img loading="lazy" onClick={() => extractSeriesID(index)} src={e} alt="Post"/>
            
            {favorited.indexOf(seriesID[index]) !== -1  ? (//remove favorite
            
            <svg version="1.1" onClick={()=> removefav(index)} className="favorite-btn" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" 
	            viewBox="0 0 455 455" xmlSpace="preserve">
                <path d="M329.579,3.592c-42.087,0-79.329,20.732-102.079,52.539C204.75,24.324,167.508,3.592,125.421,3.592
	            C56.153,3.592,0,59.745,0,129.013c0,30.111,10.612,57.741,28.299,79.36L227.5,451.408l199.201-243.035
	            C444.388,186.754,455,159.124,455,129.013C455,59.745,398.847,3.592,329.579,3.592z"/>
            </svg>
        
        ):(//add favorite
        <svg onClick={()=> assignfav(index)} className="favorite-btn" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
            <path d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Zm0-108q96-86 158-147.5t98-107q36-45.5 50-81t14-70.5q0-60-40-100t-100-40q-47 0-87 26.5T518-680h-76q-15-41-55-67.5T300-774q-60 0-100 40t-40 100q0 35 14 70.5t50 81q36 45.5 98 107T480-228Zm0-273Z"/>
        </svg>
)}
           
        
        </div>
        
        </div>
    )) 
            } 
            
        </div>

        <Sidebar data={tags}></Sidebar>

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