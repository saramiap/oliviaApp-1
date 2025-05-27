// src/components/settings/PrivacySettings.jsx
import React, { useState } from 'react';
import '../../styles/_privacySettings.scss'


const PrivacySettings = () => {
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [searchVisibility, setSearchVisibility] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(true);

  return (
    <div className="privacy-settings">
      <h2>Confidentialité</h2>

      <form className="settings-form">
        <label>
          Visibilité du profil :
          <select value={profileVisibility} onChange={(e) => setProfileVisibility(e.target.value)}>
            <option value="public">Tout le monde</option>
            <option value="private">Moi uniquement</option>
            <option value="friends">Mes contacts</option>
          </select>
        </label>

        <label>
          <input
            type="checkbox"
            checked={searchVisibility}
            onChange={() => setSearchVisibility(!searchVisibility)}
          />
          Autoriser l'apparition dans les résultats de recherche
        </label>

        <label>
          <input
            type="checkbox"
            checked={marketingEmails}
            onChange={() => setMarketingEmails(!marketingEmails)}
          />
          Recevoir des emails promotionnels et conseils personnalisés
        </label>
      </form>
    </div>
  );
};

export default PrivacySettings;
