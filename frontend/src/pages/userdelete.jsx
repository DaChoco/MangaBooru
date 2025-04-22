import { Footer, Topnav } from "../components";
import { useState, useEffect, useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { loggedIn } from "../contexts/loggedinContext";
import {userInfoData} from "../api_calls/userinfo"


function DeleteUsers(){
    //this is more so a ban. We can make their password = to something completely unguessable to stop them from logging in
    const [forminfo, setForminfo] = useState({userID: "", userName: ""})
    const [user, setUser] = useState({})
    const {userRole, userID} = useContext(loggedIn)

    useEffect(()=>{
        const handleuser = async ()=>{
            const info = await userInfoData(userID)
            setUser(info)
            console.log(info)
            if (info.role !== "ADMIN"){
                alert("You are not the admin")
                navigate("/profile")
            }

            
        }
        
        handleuser()
    },[])

    const deleteRequest = async (e) =>{
        e.preventDefault()
        if (forminfo.userID === "" || forminfo.userID === null){
            alert("You must at least add a userID")
        }
        const url = `https://${VITE_LAMBDA_DOMAIN}/api/v1/ban/users?userID=${forminfo.userID}&userName=${encodeURIComponent(forminfo.userName)}`

        try{
            const response = await fetch(url, {method: "PUT"})
            const data = await response.json()

            if (data.reply === false){
                alert(data.message)
                return
            }

            alert(data.message)
            navigate('/profile')
        }
        catch (error){
            console.log(error)
        }
    }

    const navigate = useNavigate()
    return (
        <>
    <Topnav></Topnav>

    <form className="upload-container delete-page" onSubmit={deleteRequest}  >
        <h1>Deletions Page</h1>

        <ul className="terms">
            <li>You are the admin and only you have access to this page.</li>
            <li>Deletes are irreversible, so keep that in mind as you do them</li>
            <li>You can delete with either userID or the users name or email. Or both, but both is much safer for the sql db</li>
            <li>Don't worry about the database, it'll cascade and remove the fluff</li>
            
        </ul> 

        <label htmlFor="userNameDelete">Username:</label>
        <input type="text" id="userNameDelete" value={forminfo.userName} onChange={(e)=> setForminfo(prev =>({...prev, userName: e.target.value}))}  />

        <label htmlFor="userIDDelete">User ID:</label>
        <input type="text" id="userIDDelete" value={forminfo.userID} onChange={(e)=> setForminfo(prev =>({...prev, userID: e.target.value}))}/>

        <button className="deletion-btns" onClick={()=> navigate(`/profile`)}>Cancel</button>
        <button className="deletion-btns" type="submit">Delete</button>


    </form>
    <Footer></Footer>

    </>
    )
}

export default DeleteUsers