import React, {useState} from 'react'

function SearchBar(){
    const [query, setQuery] = useState("")
    const [auto, setAuto] = useState([])
    const [splitTerms, setSplitTerms] = useState([])
  
    let arrSplitTerms = []


    const pasteInput = (i) =>{
        setQuery(i.target.textContent)
        setAuto([])
        
    }

    const fullSearch = async (e) =>{
        e.preventDefault()

        const url = 'http://localhost:8000/search'
        console.log(splitTerms)

        try{
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
            return data
           
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
            return 
        }
        const url = `http://localhost:8000/autocomplete?query=${encodeURIComponent(splitTerms[splitTerms.length -1])}`
        try{
           const response = await fetch(url, {method: "GET"})
           const data = await response.json()
           setAuto(data)
        }
        catch (error){
            console.log("An error has occured: ", error)
        }

        }, 300)

        
        }
        
    }

    return (
        <form className="search-container" onSubmit={fullSearch}>
            <input type="text" onKeyUp={autocomplete}
            id='SearchInput'
            className="searchbar" 
            placeholder="Eg. weekly_shonen_jump kohei_horikoshi"
            value={query.toLowerCase()} onChange={(e) => setQuery(e.target.value)}/>
            <button className="search-btn" type="submit">Search</button>

            {auto.length > 0 && (
                <ul className='dropdown-container'>
                {auto.map((e, index) => (
                    <li key={index} onClick={pasteInput}>{e.result}</li>
                )) 
                }
            </ul>
            )}
            
        </form>
    )
    
}

export default SearchBar