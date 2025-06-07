import React, { useEffect, useState } from "react";
import "../styles/_profile.scss"; // Vérifie bien ce chemin si tu as une structure de dossier différente pour les styles compilés
import SidebarProfil from "../components/SidebarProfil";
import { availableAvatars } from "../data/availableAvatars";


const podcasts = {
  "Développement personnel": [
    {
      id: "podcast1",
      title: "Les habitudes des gens heureux",
      src: "https://open.spotify.com/embed/episode/6kYzHziG5ADt5rWBv4ZUTP?utm_source=generator",
    },
    {
      id: "podcast2",
      title: "Confiance et mindset",
      src: "https://www.youtube.com/embed/f3d4zQQv5Jc",
    },
  ],
  Relaxation: [
    {
      id: "podcast3",
      title: "Respiration guidée",
      src: "https://widget.deezer.com/widget/dark/episode/2300011827",
    },
    {
      id: "podcast4",
      title: "Méditation du matin",
      src: "https://www.youtube.com/embed/KeKg1IjA5BI",
    },
  ],
};

function Profile() {
  const [likes, setLikes] = useState({});
  const [favorites, setFavorites] = useState({});
  const [activeTab, setActiveTab] = useState("likes");

  const [showEditModal, setShowEditModal] = useState(false); // Renommé pour plus de clarté
  const [username, setUsername] = useState("@olivia.pope");
  const [bio, setBio] = useState("Bienvenue sur mon profil !");
  const [avatar, setAvatar] = useState("/image/LMavatar.jpg"); // Assure-toi que ce chemin est correct ou gère-le dynamiquement


    // L'avatar peut maintenant être un chemin vers un avatar prédéfini ou une image uploadée (Data URL)
    const [avatarSrc, setAvatarSrc] = useState(availableAvatars[0].src); // Avatar par défaut de ta liste
    const [selectedPredefinedAvatar, setSelectedPredefinedAvatar] = useState(availableAvatars[0].id); // Pour suivre l'avatar prédéfini sélectionné

    useEffect(() => {
      const storedAvatar = localStorage.getItem("userAvatar");
      const storedUsername = localStorage.getItem("username");
      const storedBio = localStorage.getItem("userBio");
  
      if (storedAvatar) {
        setAvatarSrc(storedAvatar);
        // Vérifier si l'avatar stocké est l'un des prédéfinis pour le sélectionner
        const predefined = availableAvatars.find(av => av.src === storedAvatar);
        if (predefined) {
          setSelectedPredefinedAvatar(predefined.id);
        } else {
          setSelectedPredefinedAvatar(null); // C'est une image uploadée
        }
      }
      if (storedUsername) setUsername(storedUsername);
      if (storedBio) setBio(storedBio);
  
      setLikes(JSON.parse(localStorage.getItem("likes")) || {});
      setFavorites(JSON.parse(localStorage.getItem("favorites")) || {});
    }, []);

    const handleAvatarUpload = (e) => { // Renommé pour distinguer de la sélection prédéfinie
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          setAvatarSrc(reader.result); // Ceci sera une Data URL
          setSelectedPredefinedAvatar(null); // Désélectionne tout avatar prédéfini
        }
        reader.readAsDataURL(file);
      }
    };

    const handlePredefinedAvatarSelect = (avatar) => {
      setAvatarSrc(avatar.src);
      setSelectedPredefinedAvatar(avatar.id);
    };

  // useEffect(() => {
  //   const storedAvatar = localStorage.getItem("userAvatar");
  //   if (storedAvatar) {
  //     setAvatar(storedAvatar);
  //   }
  //   setLikes(JSON.parse(localStorage.getItem("likes")) || {});
  //   setFavorites(JSON.parse(localStorage.getItem("favorites")) || {});
  // }, []);

  const getFilteredPodcasts = (filterObj) => {
    return Object.values(podcasts)
      .flat()
      .filter((p) => filterObj[p.id]);
  };

  const renderPodcastCards = (list) =>
    list.map((podcast) => (
      <div key={podcast.id} className="profile__card">
        <iframe
          src={podcast.src}
          title={podcast.title}
          frameBorder="0"
          allowFullScreen
        ></iframe>
        <p>{podcast.title}</p>
      </div>
    ));

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    setShowEditModal(false);
    localStorage.setItem("userAvatar", avatarSrc);
    localStorage.setItem("username", username);
    localStorage.setItem("userBio", bio);
  };


  return (
    <div className="profile">
      <SidebarProfil />
      <main className="profile__content-area">
        <div className="profile__header">
          <img src={avatarSrc} alt="Avatar" className="profile__avatar" />
          <h2 className="profile__username">{username}</h2>
          <p className="profile__bio">{bio}</p>
          <button className="profile__edit" onClick={() => setShowEditModal(true)}>
            Modifier le profil
          </button>
        </div>

        {showEditModal && (
          <div className="profile__modal">
            <div className="modal__content">
              <h3>Modifier mon profil</h3>
              <label htmlFor="username-input">Nom d'utilisateur :</label>
              <input
                id="username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <label htmlFor="bio-textarea">Bio :</label>
              <textarea id="bio-textarea" value={bio} onChange={(e) => setBio(e.target.value)} />
              
              <fieldset className="avatar-selection-fieldset">
                <legend>Choisir un avatar :</legend>
                <div className="predefined-avatars-container">
                  {availableAvatars.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button" // Important pour ne pas soumettre un formulaire parent
                      className={`avatar-option-button ${selectedPredefinedAvatar === avatar.id ? 'selected' : ''}`}
                      onClick={() => handlePredefinedAvatarSelect(avatar)}
                      title={avatar.name}
                      aria-pressed={selectedPredefinedAvatar === avatar.id}
                    >
                      <img src={avatar.src} alt={avatar.name} />
                    </button>
                  ))}
                </div>
                <label htmlFor="avatar-upload" className="avatar-upload-label">Ou téléchargez votre image :</label>
                <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} />
              </fieldset>
              
              <div className="modal__buttons">
                <button onClick={handleSaveProfile} className="btn-save">Enregistrer</button>
                <button onClick={() => setShowEditModal(false)} className="btn-cancel">Annuler</button>
              </div>
            </div>
          </div>
        )}

<div className="profile__tabs">
          <button
            onClick={() => setActiveTab("likes")}
            className={activeTab === "likes" ? "active" : ""}
          >
            ❤️ Likes
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={activeTab === "favorites" ? "active" : ""}
          >
            ⭐ Favoris
          </button>
        </div>

        <div className="profile__grid">
          {activeTab === "likes"
            ? renderPodcastCards(getFilteredPodcasts(likes))
            : renderPodcastCards(getFilteredPodcasts(favorites))}
        </div>
      </main>
    </div>
  );
}

export default Profile;