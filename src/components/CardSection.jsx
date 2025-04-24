import React from "react";
import "../styles/Home.scss";
import { Link } from "react-router-dom";

const cards = [
  {
    title: "Espace Chat",
    image: "/images/chat.jpg",
    link: "/chat",
  },
  {
    title: "Relaxation",
    image: "/images/relax.jpg",
    link: "/detente",
  },
  {
    title: "Podcasts",
    image: "/images/podcast.jpg",
    link: "/podcasts",
  },
  {
    title: "Espace Pro",
    image: "/images/pro.jpg",
    link: "/espace-pro",
  },
];

function CardSection() {
  return (
    <div className="cards">
      {cards.map((card, i) => (
        <Link to={card.link} key={i} className="card">
          <img src={card.image} alt={card.title} />
          <div className="card__info">
            <h3>{card.title}</h3>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default CardSection;
