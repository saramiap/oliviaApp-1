// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chat from './pages/Chat';
import Profil from './pages/Profile';
import Detente from './pages/Detente';
import Podcasts from './pages/Podcast';
import Navbar from './components/Navbar';
import './App.css';
import Home from './components/Home';
import Footer from './components/Footer';
import ProfileSelect from './pages/ProfileSelect';
import Sante from './pages/Sante';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="page-container">
        <Routes>
        <Route path="/" element={<ProfileSelect />} />
          <Route path="/home" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/detente" element={<Detente />} />
          <Route path="/podcasts" element={<Podcasts />} />
          <Route path="/sante" element={<Sante />} />

        </Routes>
      </div>
      < Footer/>
    </Router>
  );
}

export default App;
