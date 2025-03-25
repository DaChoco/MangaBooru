import { SearchBar, Topnav, Footer, Sidebar } from "../components"
import { useEffect, useState } from "react"


function PostPage(){

    const [seriesImage, setSeriesImage] = useState("")
    const [tags, setTags] = useState([])
    const [bigseriesImage, setBigseriesImage] = useState("") //higher res option if available
    const [mangaName, setMangaName] = useState("")


    useEffect(()=>{
        const FULL_URL = new URL(window.location.href)
        const url_path = FULL_URL.pathname
        const url_ID = url_path.substring(7, url_path.length)

        const returnMangaInfo = async (urlID) =>{
            let url = `http://127.0.0.1:8000/returnMangaInfo/${urlID}`
            console.log(urlID)
            let tagarray = []

            try{
                const response = await fetch(url, {method: "GET"})
                const data = await response.json()

                
                for (let i = 0; i<data.length; i++){
                    tagarray.push(data[i].tagName)
                }
                console.log(data)
                setSeriesImage(data[0].thumbnail)
                setTags(tagarray)
                setBigseriesImage(data[0].url)
                setMangaName(data[0].seriesName)


            }
            catch(error){
                console.log("An error has occured")
            }
        }

        returnMangaInfo(url_ID)
    

    }, [mangaName])



    
    return(
        <div className="main-content">
        <Topnav></Topnav>
        <SearchBar data={{ lenoutput: 0, setLenoutput: () => {} }}></SearchBar>
       
        <Footer></Footer>
        </div>
    )
}

export default PostPage