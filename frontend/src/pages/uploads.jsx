import { Topnav, Footer } from "../components"
import { useState, useContext } from "react"
import { loggedIn } from "../contexts/loggedinContext"
import { useNavigate } from "react-router-dom"

import "../style/Profile.css"
function UploadPosts(){
    const navigate = useNavigate()
    const [file, setFile] = useState(null)
    const [fileurl, setFileUrl] = useState(null)

    const [forminfo, setForminfo] = useState({seriestitle: "", seriestags: "", seriesdescription: "", filedata: null})

    const {userID} = useContext(loggedIn)


    const previewFiles = (e)=>{
        setFile(e.target.files[0])
        const fileread = new FileReader()

        fileread.addEventListener("load", ()=>{
            console.log("activated")
            setFileUrl(fileread.result)
        }, false,)

        fileread.readAsDataURL(e.target.files[0])
        
    }

    const uploadSeries = async (e) => {
        //used on submit
        e.preventDefault()
        console.log(forminfo.seriestitle)

        const url = `http://${import.meta.env.VITE_PERSONAL_IP}:8000/uploadSeries`

        const formDataprocessing = new FormData()

        const tags = forminfo.seriestags.split(" ");
        

        formDataprocessing.append("file", file)
        formDataprocessing.append("seriesname", forminfo.seriestitle)
        formDataprocessing.append("seriesdesc", forminfo.seriesdescription)
        tags.forEach(tag => formDataprocessing.append("tags", tag));
        formDataprocessing.append("userID", userID)

        console.log(tags)

        const response = await fetch(url, {method: "POST", body: formDataprocessing})
        const data = await response.json()

        console.log(data)
        alert(data.message)
        navigate("/profile")
      
    }



    return(

        

        <>
            <Topnav></Topnav>

                <form className="upload-container" onSubmit={uploadSeries}>
                    <h1>Upload Post Page</h1>

                    <ul className="terms">
                        <li>The Theme of this website is mangas. Aka comics published in Japan. So stick witht that.</li>
                        <li>If you list a western comic (Like an X-men run). It will be removed. So will Korean Manwha comics or Chinese Manhua</li>
                        <li>You will be banned if you are a repeat offender by tagging incorrectly</li>
                        <li>Do not upload covers with large watermarks, edits of any kind or clear signs of compression. Stick to the official Japanese or English covers.</li>
                    </ul>
                    
                    <label htmlFor="InputFile">File:</label>
                    <input type="file" name="" id="InputFile" onChange={previewFiles}/>
                    <img src={fileurl} alt="" className="preview-container" />

                    <label htmlFor="seriesNameupload">Series Title:</label>
                    <input type="text" value={forminfo.seriestitle.toLowerCase()} onChange={(e)=>{setForminfo(prev => ({...prev, seriestitle: e.target.value}))}} id="seriesNameupload" placeholder="Preferably use the common English localization, but Romanji is ok..."/>

                    <label htmlFor="tags-cont">Tags:</label>
                    <input type="text" id="tags-cont" value={forminfo.seriestags.toLowerCase()} onChange={(e)=>{setForminfo(prev => ({...prev, seriestags: e.target.value}))}} placeholder="Seperate with spaces to add multiple tags" />
                    <p>Ensure that you seperate your tags with spaces. An example of this is magical_girls action comedy would be sufficient. Don't include manual spaces. Underscores for tags with multiple words.</p>


                    <label htmlFor="series-desc">Description: </label>
                    <div className="about-me-text">
                    <textarea name="" value={forminfo.seriesdescription} onChange={(e)=>{setForminfo(prev => ({...prev, seriesdescription: e.target.value}))}} id="series-desc" placeholder="Description for a series. Be as detailed as you wish. But do not give blatant spoilers." />
                    </div>
                    <button type="submit" className="profile-button">Upload</button>
                </form>

            <Footer></Footer>
        </>
    )
}

export default UploadPosts