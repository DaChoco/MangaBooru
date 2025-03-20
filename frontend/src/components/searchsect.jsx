import React, {useState} from 'react'

function SearchBar(){
    const [query, setQuery] = useState("")
    let arrSplitTerms = []
    const srhinput = document.getElementById("SearchInput")

    const fullSearch = async (e) =>{
        e.preventDefault()

        const url = 'http://127.0.0.1:8000/search'

        try{
            const response = await fetch(url, {method: "GET",
                headers: {
                    "content-type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    'Access-Control-Allow-Headers': "*",
                    'Access-Control-Allow-Methods': "*"
                },
                body: {"arruserinput": arrSplitTerms}
            })

            const data = await response.json()
            console.log(data)
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
        arrSplitTerms = userInput.trim().split(/\s+/)
        console.log(arrSplitTerms)

        if (arrSplitTerms[arrSplitTerms.length-1] < 1){ 
            return 
        }
        const url = `http://127.0.0.1:8000/autocomplete?query=${encodeURIComponent(arrSplitTerms[arrSplitTerms.length -1])}`
        try{
           const response = await fetch(url, {method: "GET"})
           const data = await response.json()
           console.log(data)
        }
        catch (error){
            console.log("An error has occured: ", error)
        }

        }, 400)

        
        }
        
    }

    return (
        <form className="search-container" onSubmit={fullSearch}>
            <input type="text" onKeyDown={autocomplete}
            id='SearchInput'
            className="searchbar" 
            placeholder="Eg. weekly_shonen_jump kohei_horikoshi"
            value={query.toLowerCase()} onChange={(e) => setQuery(e.target.value)}/>
            <button className="search-btn" type="submit">Search</button>
        </form>
    )
    
}

export default SearchBar