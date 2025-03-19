import React, {useState} from 'react'

function SearchBar(){
    const [query, setQuery] = useState("")


    const searchTagSeries = async (e) => {
        e.preventDefault()
        let userInput = e.target.value

        const arrSplitTerms = userInput.split(" ")
        const url = `http://127.0.0.1/search?query=${encodeURIComponent(userInput)}`
        try{
           const response = await fetch(url, {method: "GET",
            credentials: "include",
            headers: {"content-type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    'Access-Control-Allow-Headers': "*",
                    'Access-Control-Allow-Methods': "*"
            }
           })
           const data = await response.json()
           console.log(data)
        }
        catch (error){
            console.log("An error has occured: ", error)
        }
    }

    return (
        <form className="search-container" onSubmit={searchTagSeries}>
            <input type="text" 
            id='SearchInput'
            className="searchbar" 
            placeholder="Eg. weekly_shonen_jump kohei_horikoshi"
            value={query.toLowerCase()} onChange={(e) => setQuery(e.target.value)}/>
            <button className="search-btn" type="submit">Search</button>
        </form>
    )
    
}

export default SearchBar