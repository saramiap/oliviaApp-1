import React, { useEffect, useState } from "react";
import "../styles/_profile.scss"
import SidebarProfil from "../components/SidebarProfil";


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

  const [showEdit, setShowEdit] = useState(false);
  const [username, setUsername] = useState("@olivia.pope");
  const [bio, setBio] = useState("Bienvenue sur mon profil !");
  const [avatar, setAvatar] = useState("/image/LMavatar.jpg");

  useEffect(() => {
    setLikes(JSON.parse(localStorage.getItem("likes")) || {});
    setFavorites(JSON.parse(localStorage.getItem("favorites")) || {});
  }, []);

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

  const handleSave = () => {
    setShowEdit(false);
  };

  return (
    <div className="profile">
      <SidebarProfil />
      <div className="profile__header">
        <img src={avatar} alt="Avatar" className="profile__avatar" />
        <h2 className="profile__username">{username}</h2>
        <p className="profile__bio">{bio}</p>
        <button className="profile__edit" onClick={() => setShowEdit(true)}>
          Modifier le profil
        </button>
      </div>

      {showEdit && (
        <div className="profile__modal">
          <div className="modal__content">
            <h3>Modifier mon profil</h3>
            <label>Nom d'utilisateur :</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <label>Bio :</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
            <label>Photo de profil :</label>
            <input type="file" accept="image/*" onChange={handleAvatarChange} />
            <div className="modal__buttons">
              <button onClick={handleSave}>Enregistrer</button>
              <button onClick={() => setShowEdit(false)}>Annuler</button>
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
    </div>
  );
}

export default Profile;
