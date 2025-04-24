import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.scss";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

function Navbar() {
  const [navBlack, setNavBlack] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [toggleMenu, setToggleMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const lastScrollY = useRef(0);

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

  const handleClick = () => {
    setToggleMenu((prev) => !prev);
    setNavVisible(true);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className={`nav ${navBlack || toggleMenu ? "nav--black" : ""} ${navVisible ? "nav--visible" : "nav--hidden"} ${toggleMenu ? "show" : ""}`}>
      <button className="nav__burger" onClick={handleClick}>
        <MenuIcon />
      </button>

      <nav className="nav__links">
        <Link to="/">Podcast</Link>
        <Link to="/">Détente</Link>
        <Link to="/chat">Chat</Link>

        <div className="nav__mobile-actions">
          <Link to="/"><SearchIcon /> Rechercher</Link>
          <Link to="/"><NotificationsIcon /> Notifications</Link>
          <Link to="/">Profil</Link>
        </div>
      </nav>

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
