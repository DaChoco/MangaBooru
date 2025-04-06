import { useContext, useEffect, useState, useRef } from "react";
import { Topnav, Footer } from "../components";
import { loggedIn } from "../contexts/loggedinContext";

import "../style/Posts.css"
import "../style/Profile.css"
import { useNavigate } from "react-router-dom";



function ProfileUpdate(){

    const navigate = useNavigate()
    const updatepromptref = useRef(null)
    const [mountedref, setMountref] = useState(false)

    const [file, setFile] = useState(null)
    const [forminfo, setForminfo] = useState({uname: "", sig: "", ubanner: "", aboutthem: ""})

    const handleref = (node)=>{
        updatepromptref.current = node;
        setMountref(!!node)
    }

    const [showupdatepic, setShowupdatepic] = useState(false)

    const normal_banners_urls = [
        "https://publicboorufiles-01.s3.af-south-1.amazonaws.com/userIcons/userBanners/8acc4628408cb4ecf0a1bc6c225f85b2.jpg",
        "https://publicboorufiles-01.s3.af-south-1.amazonaws.com/userIcons/userBanners/d3ff89457850e066d28f7eb84179d583.jpg",
        "https://publicboorufiles-01.s3.af-south-1.amazonaws.com/userIcons/userBanners/image_2025-04-01_193059632.png",

        "https://i.pinimg.com/1200x/63/1f/18/631f18d68cee0131c9cf3d63b0516fec.jpg",
        "https://publicboorufiles-01.s3.af-south-1.amazonaws.com/userIcons/userBanners/BankaiIchigoBanner.JPG",
        "https://publicboorufiles-01.s3.af-south-1.amazonaws.com/userIcons/userBanners/HoshimiBasic.jpeg"
    ]

    const premium_banner_urls = [
        "https://publicboorufiles-01.s3.af-south-1.amazonaws.com/userIcons/userBanners/c89734be542b0afb6b0c88a3eda15713.jpg",
        "https://publicboorufiles-01.s3.af-south-1.amazonaws.com/userIcons/userBanners/f4cdf028b0f557665f5bc26733343a95.png",
        "https://publicboorufiles-01.s3.af-south-1.amazonaws.com/userIcons/userBanners/52abcdfcc055425f4d65672bb7e7f338.jpg"
    ]

    const admin_banner_url = "https://publicboorufiles-01.s3.af-south-1.amazonaws.com/userIcons/userBanners/GoofyKiana.JPG"

    
    
    const { userID } = useContext(loggedIn)
    const { userIcon, setUserIcon } = useContext(loggedIn)
    const { userRole } = useContext(loggedIn)

    const handleFilechange = (event)=>{
        setFile(event.target.files[0])
        console.log(event.target.files[0])

    }

    const handleupload = async ()=>{
        if (!file){
            console.log("NO FILE SELECTED!")
            return
        }

        const url = `http://127.0.0.1:8000/updatemypage/${userID}/uploads`

        const formdata = new FormData()
        formdata.append("file", file)

        const response = await fetch(url, {method: "POST", body: formdata})
        const data = await response.json()

        if (data.message === true){
            console.log("Upload success: ", data)
            setUserIcon(data.publicurl)

            
        }
        else{
            console.log("Upload Failed: ", data)
        }

    }

    const handleoptionchange = (e) =>{
        setForminfo(prev =>({...prev, ubanner: e.target.value}))
    }

    const  updateProfile = async(e)=>{
        e.preventDefault()
        const url = `http://127.0.0.1:8000/updatemypage/${userID}`


        //come up with the backend body structure later
        try{
        const response = await fetch(url, 
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({uname: forminfo.uname, sig: forminfo.sig, ubanner: forminfo.ubanner, aboutthem: forminfo.aboutthem})
            })
        
            if (!response.ok) {
                const errorData = await response.json(); // Try to read error body
                throw new Error(`HTTP ${response.status}: ${errorData.elaborate || "Unknown error"}`)};
        
            const data = await response.json()

        if (data.message === true){
            alert("Congrats, your profile has been updated")
            navigate("/profile")
        }
        else{
            alert("Apologies, for whatever reason, this process has failed, please try again later: ", data.elaborate)
        }

    } catch (error) {console.log("An error has occured: ", error)}

    }

    useEffect(()=>{

        if (mountedref === false){
          return  
        }

        const handleclickoutside = (event) => {
            
            if (updatepromptref.current && !updatepromptref.current.contains(event.target)) {
            console.log(userRole)
            setShowupdatepic(false);
            }
          };
        
          document.addEventListener("mousedown", handleclickoutside);
          return () => {
            document.removeEventListener("mousedown", handleclickoutside);
          };

    }, [mountedref])


    return (
        <>
            <Topnav></Topnav>

            <div className="update-profile-container">
                <h1>Update Profile</h1>
                <p style={{maxWidth: "60%", margin: "1rem auto", fontSize: "1.15rem"}}>Keep all your personal details to yourself. As information seen here can be seen to anyone who visits your profile. Another note. To avoid distortion. Keep your icon images around a 1:1 ratio</p>

                <div className="photo-update-container">
                    <div className="profile-icon" style={{position: "static", backgroundImage: `url(${userIcon})`}}></div>
                    <button className='profile-button' onClick={()=> setShowupdatepic(true)}>Update your Profile Pic</button>
                </div>

                <form className="other-update-container" onSubmit={updateProfile}>
                    

                    <label htmlFor="updatename">Username</label>
                    <input type="text" name="" id="updatename" placeholder="New Username..." value={forminfo.uname} onChange={(e)=>{setForminfo(prev=>({...prev, uname: e.target.value}))}}/>

                    <label htmlFor="updatesig">Signature</label>
                    <input type="text" name="" id="updatesig" placeholder="New Signature... Should be less than 10 words" value={forminfo.sig} onChange={(e)=>{setForminfo(prev=>({...prev, sig: e.target.value}))}}/>

                    <label htmlFor="updatebanner">Banner</label>
                    <select name="" id="updatebanner" className="dropbox-select" onChange={handleoptionchange}>
                        <option value="Select">Select an Option below: </option>

                        <option value={normal_banners_urls[0]}>Mikasa Mikoto</option>
                        <option value={normal_banners_urls[1]}>Citlali</option>
                        <option value={normal_banners_urls[2]}>Default Banner</option>

                        <option value={normal_banners_urls[3]}>Kiana Kaslana & Raiden Mei</option>
                        <option value={normal_banners_urls[4]}>Bankai Ichigo Kurosaki (Soul Society Arc)</option>
                        <option value={normal_banners_urls[5]}>Hoshimi Miyabi</option>
                        
                        
                        {/*Premium Banners. For users of role Patreon or ADMIN */}
                    {userRole === "PATREON" || userRole === "ADMIN" ? (<option value={premium_banner_urls[0]}>Reverse 1999: Mystery Box Concert</option>):(null)}
                    {userRole === "PATREON" || userRole === "ADMIN" ? (<option value={premium_banner_urls[1]}>The Herrschers of Honkai Impact</option>): (null)}
                    {userRole === "PATREON" || userRole === "ADMIN" ? (<option value={premium_banner_urls[2]}>Version 1.4: Zenless Zone Zero Promotion Cover</option>): (null)}
                    {userRole === "ADMIN" && (
                        <option value={admin_banner_url}>Finality Kiana</option>
                    )}
                        {/*ADMIN ONLY*/}
                    
                        

                    </select>

                    <label htmlFor="aboutmeInput">About</label>
                    <div className="about-me-text">
                        <textarea name="" id="aboutmeInput" placeholder="Talk about yourself" value={forminfo.aboutthem} onChange={(e)=>{setForminfo(prev=>({...prev, aboutthem: e.target.value}))}}></textarea>
                    </div>

                    <div className="btn-container-updates" style={{display: "flex", flexDirection: "row"}}>
                        <button className="profile-button" type="button" onClick={(e)=> {e.preventDefault(); navigate(`/profile`)}}>Cancel</button>
                        <button className="profile-button" type="submit" >Submit</button>
                    </div>
                </form>

               
                

               
            </div>

            {showupdatepic && (
            <div className="new-pic-container" id="updatebox" ref={handleref}>
                <h1 style={{fontSize: "2rem"}}>Select a New Icon! </h1>
                <input style={{margin: "0 auto"}} type="file" placeholder="Input a new file" onChange={handleFilechange} />
                <button className="profile-button" style={{margin: "0 auto", width: "70%"}} onClick={handleupload}>Upload</button>
            </div>
            )}

           
            

            <Footer></Footer>

        </>
    )
}

export default ProfileUpdate