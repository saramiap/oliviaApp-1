
import React from "react";
import { NavLink } from "react-router-dom";
import { MessageCircle, Calendar, User } from "lucide-react";
import "../styles/_sidebarProfil.scss"

const SidebarProfil = () => {
  return (
    <aside className="sidebar">
      <h2 className="sidebar__title">Mon espace</h2>
      <nav className="sidebar__nav">
        <NavLink
          to="/profil/messages"
          className={({ isActive }) => isActive ? "active" : ""}
        >
          <MessageCircle size={20} /> Messages
        </NavLink>
        <NavLink
          to="/profil/rendez-vous"
          className={({ isActive }) => isActive ? "active" : ""}
        >
          <Calendar size={20} /> Rendez-vous
        </NavLink>
        <NavLink
          to="/profil"
          end
          className={({ isActive }) => isActive ? "active" : ""}
        >
          <User size={20} /> Mon profil
        </NavLink>
      </nav>
    </aside>
  );
};

export default SidebarProfil;
