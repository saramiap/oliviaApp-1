import React from 'react';
import ConstructionPage from '../components/ConstructionPage'; // Ajuste le chemin si besoin
import { Mic  } from 'lucide-react';

const Podcast = () => {
  // Pour l'instant, on affiche juste la page "en cours de création".
  //décommenter et réutiliser ton code original quand la page sera prête.
  
  return (
    <ConstructionPage 
      pageName="Podcast" 
      featureDescription="de nouveaux épisodes inspirants et relaxants"
      IconComponent={Mic} // <<<< PASSE L'ICÔNE EN PROP
    />
  );
};

export default Podcast;





// import React, { useState, useEffect } from "react";


// const podcasts = {
//   "Développement personnel": [
//     {
//       id: "podcast1",
//       title: "Les habitudes des gens heureux",
//       platform: "spotify",
//       src: "https://open.spotify.com/embed/episode/6kYzHziG5ADt5rWBv4ZUTP?utm_source=generator",
//     },
//     {
//       id: "podcast2",
//       title: "Confiance et mindset",
//       platform: "youtube",
//       src: "https://www.youtube.com/embed/f3d4zQQv5Jc",
//     },
//   ],
//   Relaxation: [
//     {
//       id: "podcast3",
//       title: "Respiration guidée",
//       platform: "deezer",
//       src: "https://widget.deezer.com/widget/dark/episode/2300011827",
//     },
//     {
//       id: "podcast4",
//       title: "Méditation du matin",
//       platform: "youtube",
//       src: "https://www.youtube.com/embed/KeKg1IjA5BI",
//     },
//   ],
// };

// function Podcast() {
//   const [currentPodcast, setCurrentPodcast] = useState(podcasts["Développement personnel"][0]);
//   const [likes, setLikes] = useState({});
//   const [favorites, setFavorites] = useState({});

//   // Charger les likes et favoris au lancement
//   useEffect(() => {
//     const savedLikes = JSON.parse(localStorage.getItem("likes")) || {};
//     const savedFavorites = JSON.parse(localStorage.getItem("favorites")) || {};
//     setLikes(savedLikes);
//     setFavorites(savedFavorites);
//   }, []);

//   // Sauvegarde à chaque changement
//   useEffect(() => {
//     localStorage.setItem("likes", JSON.stringify(likes));
//   }, [likes]);

//   useEffect(() => {
//     localStorage.setItem("favorites", JSON.stringify(favorites));
//   }, [favorites]);

//   const toggleLike = (id) => {
//     setLikes((prev) => ({
//       ...prev,
//       [id]: !prev[id],
//     }));
//   };

//   const toggleFavorite = (id) => {
//     setFavorites((prev) => ({
//       ...prev,
//       [id]: !prev[id],
//     }));
//   };

//   const renderPlayer = () => {
//     if (!currentPodcast) return null;
//     const { platform, src, title } = currentPodcast;

//     switch (platform) {
//       case "youtube":
//         return <iframe src={src} title={title} frameBorder="0" allowFullScreen></iframe>;
//       case "spotify":
//         return <iframe src={src} width="100%" height="152" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media" title={title}></iframe>;
//       case "deezer":
//         return <iframe src={src} width="100%" height="152" frameBorder="0" title={title}></iframe>;
//       default:
//         return <p>Podcast non disponible</p>;
//     }
//   };

//   return (
//     <div className="podcast-page">
//       <div className="podcast-page__player">{renderPlayer()}</div>

//       {Object.entries(podcasts).map(([category, list]) => (
//         <div key={category} className="podcast-page__section">
//           <h2>{category}</h2>
//           <div className="podcast-page__grid">
//             {list.map((podcast) => (
//               <div
//                 key={podcast.id}
//                 className="podcast-page__card"
//                 onClick={() => setCurrentPodcast(podcast)}
//               >
//                 <div className="podcast-page__thumbnail">
//                   <img src="/public/image/podcast.jpg" alt={podcast.title} />
//                 </div>
//                 <p>{podcast.title}</p>
//                 <div className="podcast-page__actions">
//                   <button onClick={(e) => { e.stopPropagation(); toggleLike(podcast.id); }}>
//                     {likes[podcast.id] ? "💖" : "🤍"}
//                   </button>
//                   <button onClick={(e) => { e.stopPropagation(); toggleFavorite(podcast.id); }}>
//                     {favorites[podcast.id] ? "⭐" : "☆"}
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// export default Podcast;
