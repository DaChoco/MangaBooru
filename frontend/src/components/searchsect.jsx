import React, {useState, useContext, createContext} from 'react'
import { PostItemsContext } from '../contexts/postItemContext'
import { PageNumContext } from '../contexts/pageNumContext'
import { useNavigate } from 'react-router-dom'
import PostBox from './postbox'


function SearchBar({data}){
    const { lenoutput, setLenoutput } = data;
    const {setPosts} = useContext(PostItemsContext)
    const [query, setQuery] = useState("")
    const [auto, setAuto] = useState([])
    
    const [splitTerms, setSplitTerms] = useState([])
    const {seriesID, setSeriesID} = useContext(PostItemsContext)
    const {tags, setTags} = useContext(PostItemsContext)

    const {setPage} = useContext(PageNumContext)
    const {page} = useContext(PageNumContext)

    const navigate = useNavigate()

    let savedSearches = []

    function incFunction(){
        console.log(page)
        setPage(page + 1)
    }
    

    const pasteInput = (i) =>{
        let suggesttxt = i.target.textContent

        let subbedsuggest = 
        suggesttxt.substring(
            splitTerms[splitTerms.length -1].length, 
            splitTerms[splitTerms.length -1].length + suggesttxt.length) //ensures we will always get the last word
        
        console.log(subbedsuggest)
        setQuery(query + subbedsuggest)
        setAuto([])
        
    }

    const fullSearch = async (e) =>{
        e.preventDefault()
        setPage(1) //when someone searches, they should start from page 1

        const url = `http://${import.meta.env.VITE_LAMBDA_DOMAIN}:8000/search/${page}`
        console.log(splitTerms)

        try{
            if (splitTerms.length != 0 && splitTerms.length != []){
            const response = await fetch(url, {method: "POST",
                headers: {
                    "content-type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    'Access-Control-Allow-Headers': "*",
                    'Access-Control-Allow-Methods': "*"
                },
                body: JSON.stringify({inputtxt: splitTerms})
            })

            const data = await response.json()  
            console.log(data)
            if (data.communication === false){
                alert(data.message)
                setQuery("")
                return
            }
            setPosts(data.url)
            setSeriesID(data.seriesID)
            setLenoutput(data.numpages)

            let noncleanArr = []

            data.tags.forEach((item)=>{
                noncleanArr.push(item.split(",")) 
            })

            const uniqueArr = [... new Set(noncleanArr.flat())]
            
            setTags(uniqueArr)
            

            navigate("/posts")
            setAuto([])
            }
            else{
                location.reload()
            }   
        }
        catch (error){
            console.log("Apologies, an error has occured:", error)
        }
    }

    let debounceTimeout;
    const autocomplete = async (e) => {
        if (e.key != "Enter"){
        clearTimeout(debounceTimeout)

        debounceTimeout = setTimeout(async ()=>{
        let userInput = e.target.value
        setSplitTerms(userInput.trim().split(/\s+/))
        console.log(splitTerms)

        if (splitTerms[splitTerms.length-1] < 1){
            setAuto([]) 
            return 
        }
        const url = `https://${import.meta.env.VITE_LAMBDA_DOMAIN}/autocomplete?query=${encodeURIComponent(splitTerms[splitTerms.length -1])}`
        try{
           const response = await fetch(url, {method: "GET"})
           const data = await response.json()
           setAuto(data)
           
        }
        catch (error){
            console.log("An error has occured: ", error)
        }

        }, 250)

        
        }
        
    }

    const saveSearchTerm = ()=>{
        savedSearches.push(query)
        localStorage.setItem("savedsearch", JSON.stringify(savedSearches))
    }

    return (
        <>
        
        <form className="search-container" onSubmit={fullSearch}>
        <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 -960 960 960"  className='svglightdark star' style={{padding: 0, marginRight: "0.25rem", fill: "var(--base-text-dark)", width: "4rem", cursor: "pointer"}}>
            <path d="m354-287 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-350Z"/>
        </svg>
        <div className="autowrap">
            <input type="text" onKeyUp={autocomplete}
            id='SearchInput'
            className="searchbar" 
            placeholder="Eg. weekly_shonen_jump kohei_horikoshi"
            value={query.toLowerCase()} onChange={(e) => setQuery(e.target.value)}/>

{auto.length > 0 ? (
                <ul className='dropdown-container'>
                {auto.map((item, index) => 
                item.source === "series" ?
                (
                    <li className="series-auto" key={index} onClick={pasteInput}>{item.result}</li>
                ): (
                    <li className="tag-auto" key={index} onClick={pasteInput}>{item.result}</li>
                )) 
                }
            </ul>

            
            ): (null)} 
        </div>

            <button className="search-btn" type="submit">Search</button>

         

               
            
        </form>

        </>

       

  
    )
    
}

export default SearchBar