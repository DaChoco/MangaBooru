import './style/App.css'
import {Routes, Route} from "react-router-dom"
import {Favorites, Home, SavedSearch, Profile, Posts, PostPage} from "./pages"
import PostContext from './contexts/postContext'
import PageContext from './contexts/pageContext'
import { useEffect } from 'react'



function App() {
  const htmlpage = document.documentElement;

  useEffect(()=>{
    htmlpage.setAttribute("data-theme", "light")
  }, [])
  


  return (
<PageContext>
  <PostContext>
      <Routes>
        <Route path="/" element={<Home></Home>}></Route>
        
        <Route path="/posts" element={<Posts></Posts>}></Route>
        <Route path="/posts/:seriesID" element={<PostPage></PostPage>} ></Route>
       
        <Route path="/profile" element={<Profile></Profile>} ></Route>
        <Route path="/favorites" element={<Favorites></Favorites>} ></Route>
        <Route path="/savedsearch" element={<SavedSearch></SavedSearch>} ></Route>  
      </Routes>
  </PostContext>
</PageContext>

  )
}

export default App
