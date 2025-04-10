import { Footer, SearchBar, Sidebar, Topnav } from '../components'
import { useContext, useState, useEffect } from 'react'
import { favoritesitems } from '../contexts/favoritesContext'
import { useNavigate } from 'react-router-dom'


function Favorites(){
    const {favorited} = useContext(favoritesitems)
    const {setFavorited} = useContext(favoritesitems)

    const [thumbnails, setThumbnails] = useState([])
    const [title, setTitle] = useState([])

    const navigate = useNavigate()

    const [seriesID, setSeriesID] = useState([])

    const [tags, setTags] = useState([])

    function extractSeriesID(index){
        const selectedSeries = seriesID[index]
        navigate(`/posts/${selectedSeries}`)
    }

    function removefav(index){
        let new_arr = favorited.filter(item => item !== seriesID[index])
        setFavorited(new_arr)
        localStorage.setItem("favorites", JSON.stringify(favorited))

    }

    

    useEffect(()=>{

        const extractFavorites = async () =>{
            const url = `http://127.0.0.1:8000/returnFavorites`

            if (favorited.length <= 0){
                console.log("The user does not have favorites")
                return
            }
    
            try{
                console.log(favorited)
                const response = await fetch(url, 
                {method: "POST",
                headers: {"content-type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                        'Access-Control-Allow-Headers': "*",
                        'Access-Control-Allow-Methods': "*"},
                body: JSON.stringify({arrFavorites: favorited})
                    }
                )

                const data = await response.json()

                let appthumbnails = []
                let apptitles = []
                let appseriesID = []

                for (let i = 0; i < data.length; i++){
                    appthumbnails.push(data[i].thumbnail)
                    apptitles.push(data[i].seriesName)
                    appseriesID.push(data[i].seriesID)


                }

                setThumbnails(appthumbnails)
                setTitle(apptitles)
                setSeriesID(appseriesID)



    
            } 
            catch(error){
                console.log(error)
            }
        }

        const extractFavTags = async () => {
            const url = `http://127.0.0.1:8000/returnFavoriteTagList`

            if (favorited.length <= 0){
                console.log("The user does not have favorites")
                return
            }

            try{
                let arrtags = []
                const response = await fetch(url, 
                    {method: "POST",
                    headers: {"content-type": "application/json",
                            "Access-Control-Allow-Origin": "*",
                            'Access-Control-Allow-Headers': "*",
                            'Access-Control-Allow-Methods': "*"},
                    body: JSON.stringify({arrFavorites: favorited})
                        }
                    )

                const data = await response.json()

                if (data.length<=0){
                    console.log("Nothing was returned")
                    return
                }
                else{
                    
                    
                    console.log(data[0])
                    console.log(arrtags)
                    for (let i = 0; i<data.length; i++){
                        arrtags.push(data[i].tagName)
                    }

                    setTags(arrtags)
                }

            }
            catch(error){
                console.log("Something has gone wrong: ", error)
            }


        }

        extractFavorites()

        extractFavTags()

    },[])

    if (favorited.length>0){

        return(

            <div className="main-content favs-page">
            <Topnav></Topnav>
            <SearchBar data={{ lenoutput: 0, setLenoutput: () => {} }}></SearchBar>
            <div className="postcontent-container">
        {//produces all the posts and their images
        thumbnails.map((e, index) => (
        <div key={index} className="postitem">

         <div className="imgwrap">
            <img loading="lazy" onClick={() => extractSeriesID(index)} src={e} alt="Post"/>
            
            {favorited.indexOf(seriesID[index]) !== -1  && (//remove favorite
            
            <svg version="1.1" onClick={()=> removefav(index)} className="favorite-btn" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" 
	            viewBox="0 0 455 455" xmlSpace="preserve">
                <path d="M329.579,3.592c-42.087,0-79.329,20.732-102.079,52.539C204.75,24.324,167.508,3.592,125.421,3.592
	            C56.153,3.592,0,59.745,0,129.013c0,30.111,10.612,57.741,28.299,79.36L227.5,451.408l199.201-243.035
	            C444.388,186.754,455,159.124,455,129.013C455,59.745,398.847,3.592,329.579,3.592z"/>
            </svg>
        
            )}
           
        
        </div>
        
        </div>
    )) 
            } 
            
        </div>
            <Sidebar data={tags}></Sidebar>


            

            <Footer></Footer>
            
            
        </div>
       
        )

    }


    return(

        <div className="main-content">
        <Topnav></Topnav>
        <SearchBar data={{ lenoutput: 0, setLenoutput: () => {} }}></SearchBar>
            <div className="no-favs">
                <p>You appear not to have any favorites, go favorite some things and come back to us! Bye</p>
            </div>
        <Footer></Footer>
        
        </div>
        
    )
}

export default Favorites