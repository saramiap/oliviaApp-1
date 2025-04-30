import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import PersonIcon from '@mui/icons-material/Person';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import ChatIcon from '@mui/icons-material/Chat';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import SettingsIcon from '@mui/icons-material/Settings';

function Navbar() {
  const [navBlack, setNavBlack] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const lastScrollY = useRef(0);
  const navRef = useRef();

  // Gère la couleur et la visibilité en scroll
  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    setNavBlack(currentScrollY > 100);
    setNavVisible(currentScrollY < lastScrollY.current);
    lastScrollY.current = currentScrollY;
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Ferme le menu mobile si clic en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && navRef.current && !navRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleLinkClick = () => {
    setIsOpen(false); // Ferme le menu mobile après navigation
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div
      ref={navRef}
      className={`nav ${navBlack || isOpen ? "nav--black" : ""} ${
        navVisible ? "nav--visible" : "nav--hidden"
      } ${isOpen ? "show" : ""}`}
    >
      <button className="nav__burger" onClick={() => setIsOpen(!isOpen)}>
        <MenuIcon />
      </button>

      {/* Menu mobile */}
      {isOpen && (
        <div className="nav__mobile-menu">
          <Link to="/podcast" onClick={handleLinkClick}> <HeadphonesIcon/>Podcast</Link>
          <Link to="/detente" onClick={handleLinkClick}>Détente</Link>
          <Link to="/chat" onClick={handleLinkClick}> <ChatIcon/>Chat</Link>
          <Link to="/sante" onClick={handleLinkClick}> <MedicalServicesIcon/>Trouver un professionnel</Link>
          <Link to="/" onClick={handleLinkClick}>
            <SearchIcon /> Rechercher
          </Link>
          <Link to="/" onClick={handleLinkClick}>
            <NotificationsIcon /> Notifications
          </Link>
          <Link to="/profil" onClick={handleLinkClick}> <PersonIcon/>Mon profil</Link>
          <Link to="/profilSelect" onClick={handleLinkClick}> <SettingsIcon/>Paramétre</Link>
          <Link to="/profilSelect" onClick={handleLinkClick}>Se déconnecter</Link>
        </div>
      )}

      {/* Menu desktop */}
      <nav className="nav__links">
        <Link to="/podcast">Podcast</Link>
        <Link to="/detente">Détente</Link>
        <Link to="/chat">Chat</Link>
        <Link to="/sante">Trouver un professionnel</Link>
      </nav>

      {/* Actions / Profil */}
      <div className="nav__actions">
        <Link to="/"><SearchIcon /></Link>
        <Link to="/"><NotificationsIcon /></Link>
        <div className="nav__profile" onClick={toggleDropdown}>
          😁 <ArrowDropDownIcon />
          {showDropdown && (
            <div className="nav__dropdown">
              <Link to="/profil">👤 Mon profil</Link>
              <Link to="/parametres">⚙️ Paramètres</Link>
              <Link to="/logout">🚪 Déconnexion</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
