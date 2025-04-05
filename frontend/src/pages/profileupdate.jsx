import { useContext, useEffect, useState, useRef } from "react";
import { Topnav, Footer } from "../components";
import { loggedIn } from "../contexts/loggedinContext";

import "../style/Posts.css"
import "../style/Profile.css"
import { useNavigate } from "react-router-dom";

function ProfileUpdate(){
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

   const updatepromptref = useRef(null)

    //ADMIN BANNERS

    //ADMIN + PATREONS

    const [showupdatepic, setShowupdatepic] = useState(false)
    
    const { userID } = useContext(loggedIn)
    const { userIcon } = useContext(loggedIn)

    const navigate = useNavigate()

    async function updateProfile(username, signature, banner, aboutsection){
        const url = `http://127.0.0.1:8000/updatemyprofile/${userID}`


        //come up with the backend body structure later
        try{
        const response = await fetch(url, 
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    'Access-Control-Allow-Headers': "*",
                    'Access-Control-Allow-Methods': "*"
                },
                body: JSON.stringify({uname: username, sig: signature, ubanner: banner, aboutthem: aboutsection})
            })

        const data = await response.json()

        if (data.message === true){
            alert("Congrats, your profile has been updated")
        }
        else{
            alert("Apologies, for whatever reason, this process has failed, please try again later")
        }

    } catch (error) {console.log("An error has occured: ", error)}

    }

    useEffect(()=>{

        const handleclickoutside = (e)=>{
            console.log(updatepromptref)
            if (updatepromptref.current && !updatepromptref.current.contains(e.target))
            {
                console.log("Hmm")
                setShowupdatepic(!showupdatepic)
                console.log(showupdatepic)
            }

        }

        document.addEventListener("click", handleclickoutside);
        return () => {document.removeEventListener("click", handleclickoutside)};

    }, [])


    return (
        <>
            <Topnav></Topnav>

            <div className="update-profile-container">
                <h1>Update Profile</h1>
                <p style={{maxWidth: "60%", margin: "1rem auto", fontSize: "1.15rem"}}>Keep all your personal details to yourself. As information seen here can be seen to anyone who visits your profile. Thus, no effort will be made by us to secure said info</p>

                <div className="photo-update-container">
                    <div className="profile-icon" style={{position: "static", backgroundImage: `url(${userIcon})`}}></div>
                    <button className='profile-button' onClick={()=> setShowupdatepic(!showupdatepic)}>Update your Profile Pic</button>
                </div>

                <form className="other-update-container">
                    

                    <label htmlFor="updatename">Username</label>
                    <input type="text" name="" id="updatename" placeholder="New Username..."/>

                    <label htmlFor="updatesig">Signature</label>
                    <input type="text" name="" id="updatesig" placeholder="New Signature... Should be less than 10 words"/>

                    <label htmlFor="updatebanner">Banner</label>
                    <select name="" id="updatebanner" className="dropbox-select">
                        <option value="Select">Select an Option below: </option>

                        <option value="Misaka Mikoto">Mikasa Mikoto</option>
                        <option value="Citlali">Citlali</option>
                        <option value="Default Banner">Default Banner</option>

                        <option value="Kiana and Mei">Kiana Kaslana & Raiden Mei</option>
                        <option value="Bankai Ichigo">Bankai Ichigo Kurosaki (Soul Society Arc)</option>
                        <option value="Hoshimi Miyabi">Hoshimi Miyabi</option>
                        
                        
                        {/*Premium Banners. For users of role Patreon or ADMIN */}
                        <option value="R1999Carnival">Reverse 1999: Mystery Box Concert</option>
                        <option value="The Herrschers">The Herrschers of Honkai Impact</option>
                        <option value="ZZZ1.4">Version 1.4: Zenless Zone Zero Promotion Cover</option>

                        {/*ADMIN ONLY*/}
                        <option value="Silly Kiana">Finality Kiana</option>

                    </select>

                    <label htmlFor="aboutmeInput">About</label>
                    <div className="about-me-text">
                        <textarea name="" id="aboutmeInput" placeholder="Talk about yourself"></textarea>
                    </div>

                    <div className="btn-container-updates" style={{display: "flex", flexDirection: "row"}}>
                        <button className="profile-button" onClick={()=> navigate(`/profile/${userID}`)}>Cancel</button>
                        <button className="profile-button">Submit</button>
                    </div>
                </form>

               
            </div>

            {showupdatepic === true && (
                <div className="new-pic-container" id="updatebox" ref={updatepromptref}>
                <h1 style={{fontSize: "2rem"}}>Select a New Icon! </h1>
                <input style={{margin: "0 auto",}} type="file" placeholder="Input a new file" />
            </div>)}
            

            <Footer></Footer>

        </>
    )
}

export default ProfileUpdate