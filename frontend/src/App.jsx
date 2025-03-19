import './App.css'
import {Routes, Route} from "react-router-dom"
import {Favorites, Home, SavedSearch, Profile} from "./pages"
import { useState, useEffect } from 'react'


function App() {


  return (
    <div className='main-content'>
    <Routes>
      <Route path="/" element={<Home></Home>}></Route>
      <Route path="/favorites" element={<Favorites></Favorites>} ></Route>
      <Route path="/profile" element={<Profile></Profile>} ></Route>
      <Route path="/savedsearch" element={<SavedSearch></SavedSearch>} ></Route>  
    </Routes>
    </div>
  )
}

export default App
