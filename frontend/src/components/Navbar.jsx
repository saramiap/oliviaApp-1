import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close"; // Pour fermer le menu mobile
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone"; // Version "outline" pour un look plus léger
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import HeadphonesOutlinedIcon from "@mui/icons-material/HeadphonesOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SpaOutlinedIcon from "@mui/icons-material/SpaOutlined"; // Pour "Détente"
import WorkOutlineIcon from "@mui/icons-material/WorkOutline"; // Pour "Trouver un pro"
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ExitToAppIcon from "@mui/icons-material/ExitToApp"; // Pour "Déconnexion"
import EmergencyButton from "./EmergencyButton";
import TaskIcon from "@mui/icons-material/Task";
import Logo from '../../public/LogoSerenisBig.png'; // Décommente et ajuste si tu as un logo

// import '../styles/_navbar.scss'; // Assure-toi d'importer le bon fichier SCSS

function Navbar() {
  const [navBlack, setNavBlack] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const lastScrollY = useRef(0);
  const navRef = useRef(); // Pour le menu mobile
  const dropdownRef = useRef(); // Pour le dropdown du profil
  // État pour le thème : true pour clair, false pour sombre (par défaut)
  const [isLightTheme, setIsLightTheme] = useState(false);


  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    setNavBlack(currentScrollY > 50); // Se colore plus vite
    if (isOpen) return; // Ne cache pas la nav si le menu mobile est ouvert
    setNavVisible(currentScrollY < lastScrollY.current || currentScrollY < 50);
    lastScrollY.current = currentScrollY;
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOpen]); // Ajout de isOpen pour re-évaluer si on peut cacher la nav

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        navRef.current &&
        !navRef.current.contains(event.target) &&
        !event.target.closest(".nav__burger")
      ) {
        setIsOpen(false);
      }
      if (
        showDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !event.target.closest(".nav__profile-avatar-wrapper")
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, showDropdown]);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const toggleDropdown = (e) => {
    e.stopPropagation(); // Empêche le clic de se propager au document et de fermer immédiatement
    setShowDropdown(!showDropdown);
  };

  const closeAllMenus = () => {
    setIsOpen(false);
    setShowDropdown(false);
  };
  const toggleTheme = () => {
    setIsLightTheme((prevTheme) => {
      const newThemeIsLight = !prevTheme;
      localStorage.setItem("navbarTheme", newThemeIsLight ? "light" : "dark");
      return newThemeIsLight;
    });
  };
  return (
    <div
      ref={navRef} // Ref sur le conteneur global de la nav pour le menu mobile
      className={`nav ${navBlack || isOpen ? "nav--black" : ""} ${
        // isOpen force aussi nav--black
        navVisible ? "nav--visible" : "nav--hidden"
      } ${isOpen ? "nav--mobile-open" : ""}${
        isLightTheme ? "nav--light-theme" : "nav--dark-theme"
      }`} // Ajout de la classe de thème`}
    >
      <div className="nav__content-wrapper">
        {" "}
        {/* Wrapper pour le contenu de la nav */}
        <div className="nav__left">
          <Link to="/" className="nav__logo-link" onClick={closeAllMenus}>
             <img src={Logo} alt="Logo" className="nav__logo-img" /> 
            
            {/* Placeholder */}
          </Link>
          {/* Menu desktop (déplacé à gauche après le logo) */}
          <nav className="nav__links-desktop">
            <Link to="/podcast" onClick={closeAllMenus}>
              Podcast
            </Link>
            <Link to="/detente" onClick={closeAllMenus}>
              Détente
            </Link>
            <Link to="/chat" onClick={closeAllMenus}>
              Chat
            </Link>
            <Link to="/preparer-seance" onClick={closeAllMenus}>
              Préparer ma séance
            </Link>
            <Link to="/sante" onClick={closeAllMenus}>
              Trouver un pro
            </Link>
          </nav>
        </div>
        <div className="nav__right">
          {/* Actions / Profil pour Desktop */}
          <div className="nav__actions-desktop">
            <Link
              to="/search"
              className="nav__action-icon"
              title="Rechercher"
              onClick={closeAllMenus}
            >
              <SearchIcon />
            </Link>
            <Link
              to="/notifications"
              className="nav__action-icon"
              title="Notifications"
              onClick={closeAllMenus}
            >
              <NotificationsNoneIcon />
            </Link>
            <EmergencyButton />
            <div
              className="nav__profile-avatar-wrapper"
              onClick={toggleDropdown}
              ref={dropdownRef}
            >
              <img
                src={/* user?.avatar || */ "/images/default-avatar.png"}
                alt="Profil"
                className="nav__profile-avatar"
              />
              <ArrowDropDownIcon
                className={`nav__profile-arrow ${showDropdown ? "open" : ""}`}
              />
              {showDropdown && (
                <div className="nav__dropdown-menu">
                  <Link to="/profil" onClick={closeAllMenus}>
                    Mon profil
                  </Link>
                  <Link to="/parametres" onClick={closeAllMenus}>
                    Paramètres
                  </Link>
                  <Link to="/logout" onClick={closeAllMenus}>
                    Déconnexion
                  </Link>
                </div>
              )}
            </div>
          </div>
          {/* Burger pour Mobile */}
          <button
            className="nav__burger"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      <div className={`nav__mobile-menu ${isOpen ? "open" : ""}`}>
        <nav className="nav__mobile-links">
          <Link to="/podcast" onClick={handleLinkClick}>
            <HeadphonesOutlinedIcon />
            <span>Podcast</span>
          </Link>
          <Link to="/detente" onClick={handleLinkClick}>
            <SpaOutlinedIcon />
            <span>Détente</span>
          </Link>
          <Link to="/chat" onClick={handleLinkClick}>
            <ChatBubbleOutlineIcon />
            <span>Chat</span>
          </Link>
          <Link to="/preparer-seance" onClick={handleLinkClick}>
            <TaskIcon />
            <span>Préparer ma séance</span>
          </Link>
          <Link to="/sante" onClick={handleLinkClick}>
            <WorkOutlineIcon />
            <span>Trouver un pro</span>
          </Link>
          <hr className="nav__mobile-divider" />
          <Link to="/search" onClick={handleLinkClick}>
            <SearchIcon />
            <span>Rechercher</span>
          </Link>
          <Link to="/notifications" onClick={handleLinkClick}>
            <NotificationsNoneIcon />
            <span>Notifications</span>
          </Link>
          <Link to="/profil" onClick={handleLinkClick}>
            <PersonOutlineIcon />
            <span>Mon profil</span>
          </Link>
          <Link to="/parametre" onClick={handleLinkClick}>
            <SettingsOutlinedIcon />
            <span>Paramètres</span>
          </Link>
          {/* Changé la route pour être distincte */}
          <Link to="/logout" onClick={handleLinkClick}>
            <ExitToAppIcon />
            <span>Déconnexion</span>
          </Link>{" "}
          {/* Changé la route */}
          <div className="nav__mobile-emergency">
            <EmergencyButton />
          </div>
        </nav>
      </div>
    </div>
  );
}

export default Navbar;
