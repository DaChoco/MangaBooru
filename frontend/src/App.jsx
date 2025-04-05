import './style/App.css'
import {Routes, Route} from "react-router-dom"
import {Favorites, Home, SavedSearch, Profile, Posts, PostPage, ProfilePage} from "./pages"
import PostContext from './contexts/postContext'
import PageContext from './contexts/pageContext'
import { FavContext } from './contexts/favoritesContext'
import { useEffect } from 'react'
import AllTags from './pages/alltag'
import { LoggedInContext } from './contexts/loggedinContext'



function App() {
  const htmlpage = document.documentElement;

  useEffect(()=>{
    htmlpage.setAttribute("data-theme", "light")
  }, [])
  


  return (
<LoggedInContext>
<PageContext>
  <FavContext>
    <PostContext>
      <Routes>
        <Route path="/" element={<Home></Home>}></Route>
        
        <Route path="/posts" element={<Posts></Posts>}></Route>
        <Route path="/posts/:seriesID" element={<PostPage></PostPage>} ></Route>
       
        <Route path="/profile" element={<Profile></Profile>}></Route>
        <Route path="/profile/:userID/update" element={<ProfilePage></ProfilePage>} ></Route>

        <Route path="/favorites" element={<Favorites></Favorites>} ></Route>
        <Route path="/savedsearch" element={<SavedSearch></SavedSearch>} ></Route>  
        <Route path='/tags' element={<AllTags></AllTags>}></Route>
      </Routes>
    </PostContext>
  </FavContext>
</PageContext>
</LoggedInContext>

  )
}

export default App
