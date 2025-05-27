// src/components/SidebarProfil.js
import React from "react";
import { NavLink } from "react-router-dom";
import { MessageCircle, Calendar, User, Settings as SettingsIcon } from "lucide-react"; // Ajout de SettingsIcon
import "../styles/_sidebarProfil.scss";

const SidebarProfil = () => {
  return (
    <aside className="sidebar">
      <h2 className="sidebar__title">Mon espace</h2>
      <nav className="sidebar__nav">
        <NavLink
          to="/profil/messages" // Ou la route que tu utilises
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <MessageCircle size={20} /> Messages
        </NavLink>
        <NavLink
          to="/profil/rendez-vous" // Ou la route que tu utilises
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <Calendar size={20} /> Rendez-vous
        </NavLink>
        <NavLink
          to="/profil"
          end // 'end' est important pour que /profil ne matche pas /profil/parametres
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <User size={20} /> Mon profil
        </NavLink>
        {/* Nouveau lien vers les Paramètres */}
        <NavLink
          to="/parametres" // La route pour ta nouvelle page de paramètres
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <SettingsIcon size={20} /> Paramètres
        </NavLink>
      </nav>
    </aside>
  );
};

export default SidebarProfil;