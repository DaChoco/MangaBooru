import { useContext, useState } from "react";
import { Topnav, Footer } from "../components";
import { loggedIn } from "../contexts/loggedinContext";

import "../style/Posts.css"
import "../style/Profile.css"
import { useNavigate } from "react-router-dom";

function ProfileUpdate(){

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
                        <option value="Kiana and Mei">Kiana Kaslana & Raiden Mei</option>
                        <option value="Bankai Ichigo">Bankai Ichigo Kurosaki (Soul Society Arc)</option>
                        <option value="True Shikai Ichigo">True Shikai Ichigo Kurosaki</option>
                        <option value="Default Banner">Default Banner</option>
                        
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

            <Footer></Footer>

        </>
    )
}

export default ProfileUpdate