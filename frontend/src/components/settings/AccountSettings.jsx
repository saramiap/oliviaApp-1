// src/components/settings/AccountSettings.jsx
import React, { useState } from "react";
import '../../styles/_accountSettings.scss';


const AccountSettings = () => {
  const [email, setEmail] = useState("utilisateur@example.com");
  const [name, setName] = useState("Jean Dupont");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailChanged, setEmailChanged] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleNameChange = (e) => setName(e.target.value);

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }
    // Appelle ici ton API pour mettre à jour le mot de passe
    setPasswordChanged(true);
  };

  const handleEmailUpdate = (e) => {
    e.preventDefault();
    // Appelle ici ton API pour mettre à jour l'email
    setEmailChanged(true);
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm("Es-tu sûr(e) de vouloir supprimer ton compte ? Cette action est irréversible.");
    if (confirmed) {
      // Appelle ici ton API pour supprimer le compte
      alert("Compte supprimé (fictivement).");
    }
  };

  return (
    <div className="account-settings">
      <h2>Informations de compte</h2>

      <form onSubmit={handleEmailUpdate} className="settings-form">
        <label>
          Nom complet :
          <input type="text" value={name} onChange={handleNameChange} />
        </label>
        <label>
          Adresse email :
          <input type="email" value={email} onChange={handleEmailChange} />
        </label>
        <button type="submit">Mettre à jour l'email</button>
        {emailChanged && <p className="success-message">Email mis à jour avec succès.</p>}
      </form>

      <hr />

      <form onSubmit={handlePasswordUpdate} className="settings-form">
        <label>
          Nouveau mot de passe :
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label>
          Confirmer le mot de passe :
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>
        <button type="submit">Changer le mot de passe</button>
        {passwordChanged && <p className="success-message">Mot de passe mis à jour avec succès.</p>}
      </form>

      <hr />

      <div className="account-deletion">
        <h3>Suppression du compte</h3>
        <p>Cette action est irréversible. Toutes tes données seront perdues.</p>
        <button onClick={handleDeleteAccount} className="danger">
          Supprimer mon compte
        </button>
      </div>
    </div>
  );
};

export default AccountSettings;
