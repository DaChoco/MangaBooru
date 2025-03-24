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

    const {setPage} = useContext(PageNumContext)
    const {page} = useContext(PageNumContext)

    const navigate = useNavigate()

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

        const url = `http://localhost:8000/search/${page}`
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
            setPosts(data.url)

            setLenoutput(data.numpages)

            navigate("/posts")
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
        const url = `http://localhost:8000/autocomplete?query=${encodeURIComponent(splitTerms[splitTerms.length -1])}`
        try{
           const response = await fetch(url, {method: "GET"})
           const data = await response.json()
           console.log(data)
           setAuto(data)
        }
        catch (error){
            console.log("An error has occured: ", error)
        }

        }, 400)

        
        }
        
    }

    return (
        <>
        <form className="search-container" onSubmit={fullSearch}>
            <input type="text" onKeyUp={autocomplete}
            id='SearchInput'
            className="searchbar" 
            placeholder="Eg. weekly_shonen_jump kohei_horikoshi"
            value={query.toLowerCase()} onChange={(e) => setQuery(e.target.value)}/>
            <button className="search-btn" type="submit">Search</button>

         

            {auto.length > 0 && (
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

            
            )}    
            
        </form>

        </>

       

  
    )
    
}

export default SearchBar