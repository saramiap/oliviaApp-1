// src/pages/SettingsPage.js
import React, { useState, useEffect } from 'react';

import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import SidebarProfil from '../components/SidebarProfil'; // Réutiliser la sidebar pour la cohérence
import '../styles/_settings.scss'; // Nouveau fichier SCSS
import AccountSettings from '../components/settings/AccountSettings';
import PrivacySettings from '../components/settings/PrivacySettings';


// Sous-composants pour chaque section de paramètres (exemples)

const NotificationSettings = () => <div>Contenu des paramètres de notification...</div>;
const SupportSettings = () => <div>Contenu de l'aide et du support...</div>;
// Ajoute d'autres sections comme Apparence, Sécurité, etc.

const Settings = () => {
  const location = useLocation();
  // Détermine la section active basée sur l'URL ou un état local
  // Pour cet exemple, on se base sur le hash de l'URL pour la simplicité des onglets
  const getActiveSection = () => {
    // Par défaut à 'account' si aucun hash ou hash non reconnu
    if (location.hash === '#privacy') return 'privacy';
    if (location.hash === '#notifications') return 'notifications';
    if (location.hash === '#support') return 'support';
    return 'account'; // Section par défaut
  };

  const [activeSection, setActiveSection] = useState(getActiveSection());

  // Met à jour la section active si le hash de l'URL change
  useEffect(() => {
    setActiveSection(getActiveSection());
  }, [location.hash]);


  const renderSection = () => {
    switch (activeSection) {
      case 'account':
        return <AccountSettings />;
      case 'privacy':
        return <PrivacySettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'support':
        return <SupportSettings />;
      default:
        return <AccountSettings />;
    }
  };

  return (
    <div className="settings-page-layout"> {/* Layout global */}
      <SidebarProfil /> {/* La même sidebar que pour le profil */}
      <main className="settings-page-main-content">
        <header className="settings-header">
          <h1>Paramètres</h1>
        </header>
        <div className="settings-content-wrapper">
          <nav className="settings-navigation">
            {/* Utilisation de Link avec des #hash pour naviguer entre les sections sans recharger la page */}
            <Link 
              to="#account" 
              className={`settings-nav-item ${activeSection === 'account' ? 'active' : ''}`}
              onClick={() => setActiveSection('account')}
            >
              Compte
            </Link>
            <Link 
              to="#privacy" 
              className={`settings-nav-item ${activeSection === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveSection('privacy')}
            >
              Confidentialité
            </Link>
            <Link 
              to="#notifications" 
              className={`settings-nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveSection('notifications')}
            >
              Notifications
            </Link>
            <Link 
              to="#support" 
              className={`settings-nav-item ${activeSection === 'support' ? 'active' : ''}`}
              onClick={() => setActiveSection('support')}
            >
              Aide & Support
            </Link>
            {/* Ajoute d'autres liens de navigation pour d'autres sections */}
          </nav>
          <section className="settings-section-content">
            {renderSection()}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Settings;