import { useState } from "react";
import PostItemsContext from "./postItemContext";

function PostContext({children}){
    const [posts, setPosts] = useState([])

    return (
        <PostItemsContext.Provider value={{posts, setPosts}}>
            {children}
        </PostItemsContext.Provider>
    )
}

export default PostContext