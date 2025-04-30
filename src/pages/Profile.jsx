import React, { useEffect, useState } from "react";


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

  return (
    
    <div className="profile">
      <div className="profile__header">
        <img
          src="/public/image/LMavatar.jpg"
          alt="Avatar"
          className="profile__avatar"
        />
        <h2 className="profile__username">@olivia.pope</h2>
        <button className="profile__edit">Modifier le profil</button>
      </div>

      <div className="profile__tabs">
        <button onClick={() => setActiveTab("likes")} className={activeTab === "likes" ? "active" : ""}>
          ❤️ Likes
        </button>
        <button onClick={() => setActiveTab("favorites")} className={activeTab === "favorites" ? "active" : ""}>
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
