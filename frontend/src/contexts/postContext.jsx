import { useState } from "react";
import PostItemsContext from "./postItemContext";

function PostContext({children}){
    const [posts, setPosts] = useState([])
    const [seriesID, setSeriesID] = useState([])
    const [tags, setTags] = useState([])

    return (
        <PostItemsContext.Provider value={{posts, setPosts, seriesID, setSeriesID, tags, setTags}}>
            {children}
        </PostItemsContext.Provider>
    )
}

export default PostContext