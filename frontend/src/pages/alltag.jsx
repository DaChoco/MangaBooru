import { useNavigate } from "react-router-dom";
import { Topnav, SearchBar, Footer } from "../components";
import { useState, useEffect, use } from "react";
function AllTags(){

    const [tags, setTags] = useState([])
    const [tagDesc, setTagDesc] = useState([])
    const [pagenumber, setPageNumber] = useState(1)

    const navigate = useNavigate()

    const searchbar = document.getElementById("SearchInput")


    const linktotag = async (e) => {
        searchbar.value = e.target.textContent
        let url = `http://localhost:8000/extracttag/?tag=${encodeURIComponent(e.target.textContent)}`

        const response = await fetch(url, {method: "GET"})
        const data = await response.json()
        console.log(data)

        if (data){
            navigate("/posts")
            setPosts(data.url)
            
            
        }
        else{
            console.log("You did not return any data")
        }
        
   


    }

    const extractNum = (e) =>{
        //extracts the number from the box icon clicked which is used to change the page we are on.
        const extractedNum = e.target.textContent
        setPageNumber(extractedNum)
    }

    function incFunction(){
        let newPage = pagenumber + 1
        setPageNumber(newPage)
    }

    function decFunction(){
        let newPage = pagenumber - 1
        setPageNumber(newPage)
    }

    useEffect(()=>{
        const extractTags = async () => {
            const url = `http://127.0.0.1:8000/everytag?page=${pagenumber}`

            try{
                let arrtags = []
                let arrdesc = []
                const response = await fetch(url, {method: "GET"})
                const data = await response.json()

                for (let i = 0; i<data.length; i++){
                    arrtags.push(data[i].tagName)
                    arrdesc.push(data[i].tagDesc)
                }
                setTags(arrtags)
                setTagDesc(arrdesc)
                

                //calc page nums
        


            }
            catch (error){
                console.log("Something has gone wrong: ", error)
            }
        }

        extractTags()
    }, [pagenumber])


    return (
        <div className="main-content">
            <Topnav></Topnav>
            <SearchBar data={{ lenoutput: 0, setLenoutput: () => {} }}></SearchBar>

            <table className="my-table">
                <thead className="tag-page-header">
                    <tr>
                        <th>Index</th>
                        <th>Tag</th>
                        <th>Description</th>
                    </tr>
                </thead>

                <tbody>{/*Map to an array */}
                    {tags.map((e, index) =>
                        (
                            <tr key={index}>
                            <td>{index+1}</td>
                            <td className="generic-tag" onClick={linktotag}>{e}</td>
                            <td>{tagDesc[index]}</td>
                            </tr>
                        ))}

                    </tbody>
            </table>

            <div className="footer-container">
            <div className="page-nums-container">
                <ul className="list-num-page">
            
                <li className="pageboxes"><svg onClick={()=> decFunction()}  className="next-page-arrow" xmlns="http://www.w3.org/2000/svg"  viewBox="0 -960 960 960" >
                        <path d="M640-80 240-480l400-400 71 71-329 329 329 329-71 71Z"/>
                    </svg>
                </li>
            
                    (<>
                        {Array.apply(null, Array(3)).map((e, index) => 
                        (
                        pagenumber -1 == index ? (<li onClick={extractNum} className="pageboxes highlight" key={index}>{index + 1}</li>):(<li onClick={extractNum} className="pageboxes" key={index}>{index + 1}</li>)
                        ))
                        }
                        </>
                        
                    )

                    
                <li className="pageboxes"><svg onClick={() => incFunction()} className='next-page-arrow' xmlns="http://www.w3.org/2000/svg"  viewBox="0 -960 960 960">
                    <path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z"/>
                    </svg>
                </li>   

                </ul>

                
            </div>
        </div>
            <Footer></Footer>
        </div>
    )

}

export default AllTags