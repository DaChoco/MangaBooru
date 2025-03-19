
function SearchBar(){
    return (
        <form onSubmit={handleSearch} className="search-container">
            <input type="text" className="searchbar" placeholder="Eg. weekly_shonen_jump kohei_horikoshi"/>
            <button className="search-btn">Search</button>
        </form>
    )
    
}

export default SearchBar