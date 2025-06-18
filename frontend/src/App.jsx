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
import StressProgramPage from './pages/StressProgramPage';
import Urgence from './pages/Urgence';
import JournalPage from "./pages/Journal"; 
import PreparerSeance from './pages/PreparerSeance';
import Settings from './pages/Settings';
import SoundJourney from './pages/SoundJourney';
import YogaProgram from './pages/YogaProgram';
import UnderstandingStress from './pages/UnderstandingStress';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="page-container">
        <Routes>
        <Route path="/home" element={<ProfileSelect />} />
        <Route path="/" element={<Dashboard />} />
          {/* <Route path="/home" element={<Home />} /> */}
          <Route path="/chat" element={<Chat />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/profil" element={<Profile />} />
          <Route path="/detente" element={<Detente />} />
          <Route path="/detente/programme" element={<StressProgramPage />} />
          <Route path="/detente/voyage-sonore" element={<SoundJourney />} />
          <Route path="/detente/programme-yoga" element={<YogaProgram />} />
          <Route path="/detente/comprendre-stress" element={<UnderstandingStress />} />
          <Route path="/podcast" element={<Podcast />} />
          <Route path="/sante" element={<Sante />} />
          <Route path="/preparer-seance" element={<PreparerSeance />} />
          <Route path="/urgence" element={<Urgence />} />
          <Route path="/parametres" element={<Settings />} />
        </Routes>
        
      </div>
      < Footer/>
    </Router>
  );
}

export default App;
