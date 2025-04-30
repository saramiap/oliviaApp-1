// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/main.scss';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Detente from './pages/Detente';
import Podcast from './pages/Podcast';
import Navbar from './components/Navbar';
import './App.css';
import Home from './components/Home';
import Footer from './components/Footer';
import ProfileSelect from './pages/ProfileSelect';
import Sante from './pages/Sante';
import EmergencyButton from "./components/EmergencyButton";
import Urgence from './pages/Urgence';
function App() {
  return (
    <Router>
      <Navbar />
      <div className="page-container">
        <Routes>
        <Route path="/" element={<ProfileSelect />} />
          <Route path="/home" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profil" element={<Profile />} />
          <Route path="/detente" element={<Detente />} />
          <Route path="/podcast" element={<Podcast />} />
          <Route path="/sante" element={<Sante />} />
          
          <Route path="/urgence" element={<Urgence />} />
        </Routes>
        <EmergencyButton />
      </div>
      < Footer/>
    </Router>
  );
}

export default App;
