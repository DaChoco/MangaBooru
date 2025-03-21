import './style/App.css'
import {Routes, Route} from "react-router-dom"
import {Favorites, Home, SavedSearch, Profile, Posts} from "./pages"



function App() {


  return (

    <Routes>
      <Route path="/" element={<Home></Home>}></Route>
      <Route path="/posts" element={<Posts></Posts>}></Route>
      <Route path="/favorites" element={<Favorites></Favorites>} ></Route>
      <Route path="/profile" element={<Profile></Profile>} ></Route>
      <Route path="/savedsearch" element={<SavedSearch></SavedSearch>} ></Route>  
    </Routes>

  )
}

export default App
