import { SearchBar, Topnav, Sidebar, PostBox } from "../components"
import "../style/Posts.css"
function Posts(){
    const data = {
        results: [
            { tagName: "React", dataPosted: "2024-03-21" },
            { tagName: "JavaScript", dataPosted: "2024-03-20" },
            { tagName: "CSS", dataPosted: "2024-03-19" }
        ]
    };

    return (
    <div className="main-content">
        
            <Topnav></Topnav> 
            <SearchBar></SearchBar>
            <PostBox></PostBox>
        

        <main className="post-board-container">

        </main>
    </div>
        
 
        
    )
}

export default Posts