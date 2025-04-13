import { useState, useEffect, useContext } from "react";
import { Topnav, Footer } from "../components";
import { useNavigate } from "react-router-dom";
import {loggedIn} from "../contexts/loggedinContext"

function Deletions(){
    const navigate = useNavigate()

    const {setUserID, setLogged, setUserRole} = useContext(loggedIn)
    //this is the context that stores the userID and logged in state. We will use this to check if the user is logged in and if they are an admin

    useEffect(()=>{
        const getLoginCreds = async () =>{
            //before the user ID is even set we can see if the end user has the tokens to log in automatically. Skipping the filler
            const token = localStorage.getItem("access_token")

            if (!token) {
                console.log("No token found");
                setLogged(false);
                return;
            }
            const url = "http://127.0.0.1:8000/getuser"

            const response = await fetch(url, {"method": "GET", headers: {"Authorization": `Bearer ${token}`}})

            if (!response.ok) {
                console.warn("Token is invalid or expired");
                localStorage.removeItem("access_token"); 
                setLogged(false);
                return;
            } else{
                const data = await response.json()
                console.log("USER DATA: ", data)
                setUserID(data.userID)
                setUserRole(data.role)
                setLogged(true)
                //if the user is not an admin, redirect them to the profile page

                if (data.role !== "ADMIN"){
                    console.log("Your role: ", data.role)
                    alert("You are not authorized to view this page")
                    navigate("/profile")
                }
            }
     
               
            

        }
        getLoginCreds()
    }, [])

    const [forminfo, setForminfo] = useState({seriesID: "", seriesName: ""})
    //this page is for deleting posts. The structure is almost the same as uploads, but the functionality is different. So we will reuse the css

    const deleteRequest = async (e) => {
        e.preventDefault()
        if (forminfo.seriesID === "" && forminfo.seriesName === ""){
            alert("You must provide a seriesID or series name to delete")
            return
        }
        const url = `http://127.0.0.1:8000/deleteSeries?seriesID=${forminfo.seriesID}&seriesName=${forminfo.seriesName}`
        

        try{
            const response = await fetch(url, {method: "DELETE"})
            const data = await response.json()  

            if (data.reply === true){
            alert(data.message)
            console.log("The series has been deleted")
            navigate("/profile")
            }
            else{
            alert(data.message)
            console.log("The series has not been deleted")
            }
        }
        catch (error){
            console.log("An error has occured: ", error)
        }   
    }
    return (<>
    <Topnav></Topnav>

    <form className="upload-container delete-page" onSubmit={deleteRequest} >
        <h1>Deletions Page</h1>

        <ul className="terms">
            <li>You are the admin and only you have access to this page.</li>
            <li>Deletes are irreversible, so keep that in mind as you do them</li>
            <li>You can delete with either seriesID or the series title. Or both, but both is much safer for the sql db</li>
            <li>Don't worry about the database, it'll cascade and remove the fluff</li>
            
        </ul> 

        <label htmlFor="seriesNameDelete">Series Title:</label>
        <input type="text" id="seriesNameDelete" value={forminfo.seriesName} onChange={(e)=> setForminfo(prev =>({...prev, seriesName: e.target.value}))}  />

        <label htmlFor="seriesIDDelete">Series ID:</label>
        <input type="text" id="seriesIDDelete" value={forminfo.seriesID} onChange={(e)=> setForminfo(prev =>({...prev, seriesID: e.target.value}))}/>

        <button className="deletion-btns" onClick={()=> navigate(`/profile`)}>Cancel</button>
        <button className="deletion-btns" type="submit">Delete</button>


    </form>
    <Footer></Footer>

    </>)}

export default Deletions