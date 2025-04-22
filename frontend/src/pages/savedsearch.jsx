function SavedSearch({data}){
    return(
        <>
        <ul>
        {data.map((item, index)=> (
            <li key={index}>{item}</li>
            ))}
        </ul>
        
        </>
    )
}

export default SavedSearch