import { SearchBar, Topnav, Footer, Sidebar } from "../components"
import { useEffect, useState, useContext } from "react"
import { favoritesitems } from "../contexts/favoritesContext"
import { LoggedInContext } from "../contexts/loggedinContext"
import { loggedIn } from "../contexts/loggedinContext"


function PostPage(){
    const mangaimage = document.getElementById("mangaimage")

    const [thumbnail, setThumbnail] = useState(null)
    const [tags, setTags] = useState([])
    const [bigseriesImage, setBigseriesImage] = useState("") //higher res option if available
    const [mangaName, setMangaName] = useState("")

    const [flagged, setFlagged] = useState(0)

    const [highres, setHighres] = useState(false)
    const {favorited} = useContext(favoritesitems)
    const {setFavorited} = useContext(favoritesitems)

    const {userID} = useContext(loggedIn)
    const FULL_URL = new URL(window.location.href)
    const url_path = FULL_URL.pathname
    const url_ID = url_path.substring(7, url_path.length)

    const addedbox = document.getElementById("ADDFAV")

    const addtofavorites = () =>{
        if (favorited.indexOf(url_ID) !== -1){
            console.log("This is already in your favorites")
            return
        }

        setFavorited(url_ID)
        localStorage.setItem("favorites", JSON.stringify(favorited))

        addedbox.style.display = "block"
        setTimeout(function(){
            addedbox.style.display = "none"
       
        }, 1000)
    }
    
    const flagforDeletion = async () =>{
        const url =   `http://${import.meta.env.VITE_PERSONAL_IP}:8000/flagfordelete/${url_ID}?userID=${userID}`

        if (userID == null){
            alert("You must be logged in to flag this series for deletion")
            return
        }

    try{
        const response = await fetch(url, {method: "GET"})
        const data = await response.json()
        console.log(data)
        setFlagged(data.flagged)
}
    catch (error)
    {
        console.log("An error has occured: ", error)
        
    }
    }

    const seeFullnewTab = () => {

        if (bigseriesImage != ""){
            window.open(bigseriesImage)
        }
        else{
            window.open(thumbnail)
        }
        
    }



    const toBig = () =>{
        mangaimage.setAttribute("src", bigseriesImage)
        setHighres(true)
        

    }
    useEffect(()=>{


        const returnMangaInfo = async (urlID) =>{
            let url = `http://${import.meta.env.VITE_PERSONAL_IP}:8000/returnMangaInfo/${urlID}`
            console.log(urlID)
            let tagarray = []

            try{
                const response = await fetch(url, {method: "GET"})
                const data = await response.json()
  

                
                for (let i = 0; i<data.length; i++){
                    tagarray.push(data[i].tagName)
                }

                if (!data){
                    console.log("Apologies. But this series does not have further information. Since this page is a stub. Your assitance would be appreciated")
                    return
                }

                setThumbnail(data[0].thumbnail)
                setTags(tagarray)
                setBigseriesImage(data[0].url)
                setMangaName(data[0].seriesName)


            }
            catch(error){
                console.log("An error has occured: ", error)
            }
        }

         returnMangaInfo(url_ID)
    

    }, [])



    
    return(
        <div className="main-content series-page">
        <Topnav></Topnav>
        <SearchBar data={{ lenoutput: 0, setLenoutput: () => {} }}></SearchBar>
        {highres == false && bigseriesImage != false && (
                <div className="high-res-question">
                    <p onClick={toBig}>Click here to see original size</p>
                </div>
            )}
        <div className="postpage-itemcontainer">
            
            <img id="mangaimage" src={thumbnail} alt={mangaName} />

        </div>
        
        <article>
            
            <Sidebar data={tags}>
                <h2 className="seriestitle">{mangaName.replace(/_/g, " ")}</h2>

                
            </Sidebar>
            <h2 className="seriestitle">Options:</h2>

            <div id="ADDFAV">Manga series has been added to your favorites!</div>
            <ul className="tag-container">
                <li className="other-tag" onClick={addtofavorites}>Add to Favorites</li>
                <li className="other-tag">Add tags</li>
                <li className="other-tag" onClick={flagforDeletion}>Flagged for Deletion: {flagged}</li>
                <strong><li className="tagoutput other-tag" onClick={seeFullnewTab}>See original</li></strong>
            </ul>

            <h2 className="seriestitle">Statistics</h2>
            <ul className="tag-container">
                <li className="other-tag">Year First Published: </li>
                <li className="other-tag">Image Resolution: </li>
            </ul>
        </article>

        <div className="user-comments">
            <div className="say-comment">
            <p>Leave a comment: </p>
            <textarea name="" id="textbox"></textarea>
            </div>
            <ul className="comment-list">
                <li className="comment">
                    <div className="user-spoke-icon for-small-screens"></div>
                    <div className="user-spoke-content">
                        <span>Anonymous commented at TIME #THECOMMENTID</span>
                        <p>The user's comment</p>
                        <p>Upvotes: Downvotes: </p>
                    </div>
                </li>
            </ul>
        </div>

        
        
        <Footer></Footer>
        </div>
    )
}


export default PostPage