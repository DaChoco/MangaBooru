import { SearchBar, Topnav, Footer, Sidebar } from "../components"
import { useEffect, useState, useContext, useRef } from "react"
import { favoritesitems } from "../contexts/favoritesContext"
import { LoggedInContext } from "../contexts/loggedinContext"
import { loggedIn } from "../contexts/loggedinContext"
import "../style/LoadingBG.css"


function PostPage(){
    const FULL_URL = new URL(window.location.href)
    const url_path = FULL_URL.pathname
    const url_ID = url_path.substring(7, url_path.length)

    const mangaimage = document.getElementById("mangaimage")

    const [thumbnail, setThumbnail] = useState(null)
    const [tags, setTags] = useState([])
    const [bigseriesImage, setBigseriesImage] = useState("") //higher res option if available
    const [mangaName, setMangaName] = useState("")
    
    const [flagged, setFlagged] = useState(0)

    const [highres, setHighres] = useState(false)
    const {favorited} = useContext(favoritesitems)
    const {setFavorited} = useContext(favoritesitems)
    const {userIcon} = useContext(loggedIn)
    const {loadingcredentials, setLoadingcredentials} = useContext(loggedIn)
    
    const commentarearef = useRef()


    const {userID, setUserID, logged, setLogged} = useContext(loggedIn)

    //Special Use Effect. Login via cookies:
    useEffect(()=>{
        const getLoginCreds = async () =>{
            //before the user ID is even set we can see if the end user has the tokens to log in automatically. Skipping the filler
            const token = localStorage.getItem("access_token")

            setLoadingcredentials(true)

            if (!token) {
                console.log("No token found");
                setLoadingcredentials(false)
                setLogged(false);
                return;
            }
            else if (token === null || token === undefined){
                console.log("No token found");
                setLoadingcredentials(false)
                setLogged(false);
                return;
            }
            const url = `http://${import.meta.env.VITE_PERSONAL_IP}:8000/getuser`

            const response = await fetch(url, {method: "GET", headers: {"Authorization": `Bearer ${token}`}})

            if (!response.ok) {
                console.warn("Token is invalid or expired");
                localStorage.removeItem("access_token"); 
                setLoadingcredentials(false)
                setLogged(false);
                return;
            } else{
                const data = await response.json()
                console.log("USER DATA: ", data)
                setUserID(data.userID)
                setLogged(true)
                setUserName(data.userName)
                setLoadingcredentials(false)
                
            }
     
               
            

        }
        getLoginCreds()
    }, [])
    const {userName, setUserName} = useContext(loggedIn)
    

    const addedbox = document.getElementById("ADDFAV")

    const [userComment] = useState({username: userName, userID: userID, userIcon: userIcon, seriesID: url_ID})
    const [commentlist, setCommentlist] = useState([])

    async function handleAddingTags(tagInput) {
        const url = `
        http://${import.meta.env.VITE_PERSONAL_IP}:8000/tagseriesrelations?taginput=${encodeURIComponent(tagInput)}&seriesinput=${encodeURIComponent(mangaName)}`

        try{
            const response = await fetch(url, {method: "PUT"})
            const data = await response.json()

            if (data.reply === true){
                alert(data.message)
                setTags(data.tags)
            }
            else{
                console.log(data)
                alert(data.message)
            }
        }
        catch (error){
            console.log(error)
        }
    }

    const addtofavorites = () =>{
        if (favorited.indexOf(url_ID) !== -1){
            alert("This is already in your favorites")
            return
        }

        setFavorited(prev => ([...prev, url_ID]))
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
    const retrieveCommentList = async () =>{
        const url = `http://${import.meta.env.VITE_PERSONAL_IP}:8000/retrieveUserComments/${url_ID}`
        

        try{
            const response = await fetch(url, {method: "GET"})
            const data = await response.json()
            console.log("GENERIC DATA: ", data)

            
            setCommentlist(data)
            console.log("Data list: ", commentlist)
            setLoadingcredentials(false)
        }
        catch (error){
            console.log(error)
            
        }
        

    
    }

    const handleCreateComment = async() =>{
        if (!commentarearef.current){
            return
        }

        if (commentarearef.current.value === "" || commentarearef.current.value === undefined || commentarearef.current.value === null){
            return
        }

        if (userComment.userID === null || userComment.userID === undefined){
            alert("You are not logged in. Sorry")
            return
        }

        const url = `http://${import.meta.env.VITE_PERSONAL_IP}:8000/inputUserComments/${userComment.seriesID}?userID=${userID}&comment=${encodeURIComponent(commentarearef.current.value)}&userIcon=${encodeURIComponent(userIcon)}&userName=${encodeURIComponent(userName)}`

        setLoadingcredentials(true)
        try{
            const response = await fetch(url, {method: "PUT"})
            const data = await response.json()
            console.log("GENERIC DATA: ", data)
            console.log("Data list: ", commentlist)

            await retrieveCommentList()
            setLoadingcredentials(false)
            commentarearef.current.value = ""
        }
        catch (error){
            console.log(error)
            setLoadingcredentials(false)
        }
    }

    useEffect(()=>{
        console.log(commentlist)
    },[commentlist])

    useEffect(()=>{
        setLoadingcredentials(true)
        retrieveCommentList()
        setLoadingcredentials(false)
        console.log("Data list: ", commentlist)

    },[])

    async function incrementVotes(time, vote_type){
        if (userID === null || userID === undefined || userID === ""){
            return
        }
        const url = `http://${import.meta.env.VITE_PERSONAL_IP}:8000/changecommentvotes/${url_ID}?timestamp=${encodeURIComponent(time)}&category=${vote_type}&userID=${userID}`

        try{

            const response = await fetch(url, {method: "PUT"})
            const data = await response.json()

            if (data.reply === false){
                return
            }
            else{
                return data.new_votes
            }


        }
        catch (error){
            console.log(error)
        }

    }
    
    
    
    return(
        <div className="main-content series-page">
        <Topnav></Topnav>
        {loadingcredentials && (<div className='spinning-circle-container'></div>)}
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
            
            {Array.isArray(tags) && tags.length > 0 && (<Sidebar data={tags}><h2 className="seriestitle">{typeof mangaName === "string" ? mangaName.replace(/_/g, " "): ""}</h2></Sidebar>)}
            <h2 className="seriestitle">Options:</h2>

            <div id="ADDFAV">Manga series has been added to your favorites!</div>
            <ul className="tag-container">
                <li className="other-tag" onClick={addtofavorites}>Add to Favorites</li>
                <li className="other-tag" onClick={async ()=>{
                    let userInput = prompt("Type in a tag you would like to add to a series")
                    await handleAddingTags(userInput.toLowerCase())
                    console.log("transaction complete")
                }}>Add tags</li>
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
            <textarea ref={commentarearef} name="" id="textbox" ></textarea>
            {logged === true && (<button className="comment-sect" onClick={handleCreateComment}>Add comment</button>)}
            </div>
            { commentlist &&  commentlist.length>0 ? (
                <ul className="comment-list">
                {commentlist.map((comment, index)=> (<li key={index} className="comment">
                        <img src={comment.usericon ?? null} className="user-spoke-icon for-small-screens"></img>
                        <div className="user-spoke-content">
                            <span><strong>{comment.userName ?? "Anonymous"}</strong> commented at {comment.timestamp.substring(0, 19) ?? "00:00"}</span>
                            <p>{comment.commentText ?? "The comment"}</p>
                            <p>

                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" style={{fill: "#FFF"}}><path d="m280-400 200-200 200 200H280Z" onClick={async ()=> {
                                    const upvotes = await incrementVotes(comment.timestamp, "upvotes");
                                    setCommentlist(prevdata => {
                                        const newList = [...prevdata];
                                        newList[index] = {...newList[index], upvotes: upvotes };
                                        return newList;
                                    })
                                    }}/></svg>Upvotes: {comment.upvotes ?? 0} 
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" style={{fill: "#FFF"}}><path d="M480-360 280-560h400L480-360Z" onClick={async ()=> {
                                    const downvotes = await incrementVotes(comment.timestamp, "downvotes");
                                    setCommentlist(prevdata =>{
                                        const newList = [...prevdata];
                                        newList[index] = {...newList[index], downvotes: downvotes};
                                        return newList;

                                    })
                                
                                }}/></svg>Downvotes: {comment.downvotes ?? 0} </p>

                        </div>
                    </li>)) }
                    
                </ul>
            ): (null)}
            
        </div>

        
        
        <Footer></Footer>
        </div>
    )
}


export default PostPage