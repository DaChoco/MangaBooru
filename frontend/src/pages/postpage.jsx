import { SearchBar, Topnav, Footer, Sidebar } from "../components"
import { useEffect, useState } from "react"


function PostPage(){

    const [seriesImage, setSeriesImage] = useState("")
    const [tags, setTags] = useState([])
    const [bigseriesImage, setBigseriesImage] = useState("") //higher res option if available
    const [mangaName, setMangaName] = useState("")

    const [highres, setHighres] = useState(false)

    const seeFullnewTab = () => {
        window.open(seriesImage)
    }
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
                console.log(data)

                
                for (let i = 0; i<data.length; i++){
                    tagarray.push(data[i].tagName)
                }

                if (!data){
                    console.log("Apologies. But this series does not have further information. Since this page is a stub. Your assitance would be appreciated")
                    return
                }
                console.log(data)
                setSeriesImage(data[0].thumbnail)
                setTags(tagarray)
                setBigseriesImage(data[0].url)
                setMangaName(data[0].seriesName)


            }
            catch(error){
                console.log("An error has occured: ", error)
            }
        }

         returnMangaInfo(url_ID)
    

    }, [mangaName])



    
    return(
        <div className="main-content">
        <Topnav></Topnav>

        <div className="postpage-itemcontainer">
            {highres == false && bigseriesImage != false && (
                <div className="high-res-question">

                </div>
            )}
            <img src={seriesImage} alt={mangaName} />

        </div>
        <SearchBar data={{ lenoutput: 0, setLenoutput: () => {} }}></SearchBar>
        <article>
            
            <Sidebar data={tags}><h2 className="seriestitle">Copyright: {mangaName}</h2></Sidebar>
            <h2 className="seriestitle">Options:</h2>
            <ul>
                <li>Add to Favorites</li>
                <li>Flag for Deletion</li>
                <strong><li className="tagoutput" onClick={seeFullnewTab}>See original</li></strong>
            </ul>

            <h2 className="seriestitle">Statistics</h2>
            <ul>
                <li>Year First Published: </li>
                <li>Image Resolution: </li>
            </ul>
        </article>

        <div className="user-comments">
            <div className="say-comment">
            <p>Leave a comment: </p>
            <textarea name="" id="textbox"></textarea>
            </div>
            <ul className="comment-list">
                <li className="comment">
                    <div className="user-spoke"></div>
                    <div className="user-said"></div>
                </li>
            </ul>
        </div>

        
        
        <Footer></Footer>
        </div>
    )
}

export default PostPage