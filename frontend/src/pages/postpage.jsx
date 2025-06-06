import { SearchBar, Topnav, Footer, Sidebar } from "../components"
import { useEffect, useState, useContext, useRef } from "react"
import { favoritesitems } from "../contexts/favoritesContext"
import { LoggedInContext } from "../contexts/loggedinContext"
import { loggedIn } from "../contexts/loggedinContext"
import { handleJWT } from "../general_utils/jwthandle"
import "../style/LoadingBG.css"
import "../style/Profile.css"


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
    const {userIcon, setUserIcon, setUserRole} = useContext(loggedIn)
    const {loadingcredentials, setLoadingcredentials} = useContext(loggedIn)
    
    const commentarearef = useRef()
    const [uploader, setUploader] = useState("")


    const {userID, setUserID, logged, setLogged} = useContext(loggedIn)
    const {userName, setUserName} = useContext(loggedIn)

    async function userInfoData(userID){

        //Extracts user info for the profile page
        const url = `https://${import.meta.env.VITE_LAMBDA_DOMAIN}/returnUserInfo/${userID}`
    try{
        const response = await fetch(url, {method: "GET"})
        const data = await response.json()

        console.log("Data: ", data)
        setUserIcon(data.userIcon)
        setUserRole(data.role)

    }
    catch (error){
        console.log("An unforseen error has occured")
    }
        
    }

    //Special Use Effect. Login via cookies:
    useEffect(()=>{
        const getLoginCreds = async () =>{
            //before the user ID is even set we can see if the end user has the tokens to log in automatically. Skipping the filler
            const token = localStorage.getItem("access_token")

            if (userID && userIcon && userName){
                //if the info is here. don't call the function
                return
            }

            setLoadingcredentials(true)

            if (!token || token == "null") {
                console.log("No token found");
                setLoadingcredentials(false)
                setLogged(false);
                return;
            }
            
            const decodeToken = handleJWT(token)

            if (decodeToken === false) {
                setLoadingcredentials(false)
                setLogged(false);
                return
            }

            const url = `https://${import.meta.env.VITE_LAMBDA_DOMAIN}/getuser`

            const response = await fetch(url, {method: "GET", headers: {"Authorization": `Bearer ${token}`}})

            if (!response.ok) {
                console.warn("Token is invalid or expired");
                localStorage.removeItem("access_token"); 
                setLoadingcredentials(false)
                setLogged(false);
                return;
            } else{
                const data = await response.json()

                if (data.reply == false){
                    console.log(data.instruction)
                    return
                }
                console.log("USER DATA: ", data)
                setUserID(data.userID)
                setLogged(true)
                setUserName(data.userName)
                await userInfoData(data.userID)
                setLoadingcredentials(false)
                
            }
     
        }
        getLoginCreds()
    }, [])

    

    const addedbox = document.getElementById("ADDFAV")

    const [userComment] = useState({username: userName, userID: userID, userIcon: userIcon, seriesID: url_ID})
    const [commentlist, setCommentlist] = useState([])

    function convertDatetoLocal(userDate){
        if (!userDate){
            return null
        }
        const convertedDate = new Date(userDate + "Z")
        
        if (isNaN(convertedDate)) {
            const backup = new Date(userDate)
            return backup.toLocaleString().replace("/", "-").replace("/","-")

        }
        const finaltime = convertedDate.toLocaleString(undefined, 
            {year: "numeric", hour12: false, day: "2-digit", month: "2-digit", minute: "2-digit", hour: "2-digit"})

        return finaltime.replace("/", "-").replace("/","-")
    }

    async function handleAddingTags(tagInput) {
        const url = `
        https://${import.meta.env.VITE_LAMBDA_DOMAIN}/tagseriesrelations?taginput=${encodeURIComponent(tagInput)}&seriesinput=${encodeURIComponent(mangaName)}`

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
        const url =   `https://${import.meta.env.VITE_LAMBDA_DOMAIN}/flagfordelete/${url_ID}?userID=${userID}`

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
            let url = `https://${import.meta.env.VITE_LAMBDA_DOMAIN}/returnMangaInfo/${urlID}`
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
                setUploader(data[0].uploaderId)
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
        const url = `https://${import.meta.env.VITE_LAMBDA_DOMAIN}/retrieveUserComments/${url_ID}`
        
        setLoadingcredentials(true)
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

        const url = `https://${import.meta.env.VITE_LAMBDA_DOMAIN}/inputUserComments/${userComment.seriesID}?userID=${userID}&comment=${encodeURIComponent(commentarearef.current.value)}&userIcon=${encodeURIComponent(userIcon)}&userName=${encodeURIComponent(userName)}`

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
        setLoadingcredentials(true)
        retrieveCommentList()
        setLoadingcredentials(false)
        console.log("Data list: ", commentlist)

    },[])

    async function incrementVotes(time, vote_type){
        if (userID === null || userID === undefined || userID === ""){
            return
        }
        const url = `https://${import.meta.env.VITE_LAMBDA_DOMAIN}/changecommentvotes/${url_ID}?timestamp=${encodeURIComponent(time)}&category=${vote_type}&userID=${userID}`

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
        {loadingcredentials === true && (<div className='spinning-circle-container'></div>)}
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
            
            {Array.isArray(tags) && tags.length > 0 && (
                <Sidebar data={tags}>
                <h2 className="seriestitle">{typeof mangaName === "string" ? mangaName.replace(/_/g, " "): ""}</h2>
                </Sidebar>)}
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
                <li className="other-tag">Uploader: {uploader ?? ""}</li>
            </ul>


        </article>

        <div className="user-comments">
            <div className="say-comment">
            <p>Leave a comment: </p>
            <textarea ref={commentarearef} name="" id="textbox" className="about-me-text"></textarea>
            {logged === true && (<button className="profile-button comment-sect" onClick={handleCreateComment}>Add comment</button>)}
            </div>
            { commentlist &&  commentlist.length>0 ? (
                <ul className="comment-list">
                {commentlist.map((comment, index)=> (<li key={index} className="comment">
                        <img src={comment.usericon ?? null} className="user-spoke-icon for-small-screens"></img>
                        <div className="user-spoke-content">
                            <span><strong>{comment.userName ?? "Anonymous"}</strong> commented at {convertDatetoLocal(comment.timestamp) ?? "00:00"}</span>
                            <p>{comment.commentText ?? "The comment"}</p>
                            <p>

                                <svg xmlns="http://www.w3.org/2000/svg" height="36px" viewBox="0 -960 960 960" width="36px" style={{fill: "#FFF"}}><path d="m280-400 200-200 200 200H280Z" onClick={async ()=> {
                                    const upvotes = await incrementVotes(comment.timestamp, "upvotes");
                                    setCommentlist(prevdata => {
                                        const newList = [...prevdata];
                                        newList[index] = {...newList[index], upvotes: upvotes };
                                        return newList;
                                    })
                                    }}/></svg>Upvotes: {comment.upvotes ?? 0} 
                                <svg xmlns="http://www.w3.org/2000/svg" height="36px" viewBox="0 -960 960 960" width="36px" style={{fill: "#FFF"}}><path d="M480-360 280-560h400L480-360Z" onClick={async ()=> {
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