import React from "react";
import { useNavigate } from "react-router-dom";


const themes = [
  {
    title: "Apprendre à respirer",
    description: "Découvre des exercices de respiration simples et efficaces.",
    image: "/images/respirer.jpg",
    route: "/detente/respirer",
  },
  {
    title: "Pourquoi le stress nous bloque",
    description: "Comprendre les mécanismes du stress pour mieux l'apprivoiser.",
    image: "/images/stress.jpg",
    route: "/detente/stress",
  },
  {
    title: "Se dépasser en respirant",
    description: "Utilise ta respiration pour dépasser tes blocages intérieurs.",
    image: "/images/depasser.jpg",
    route: "/detente/depasser",
  },
];

const Detente = () => {
  const navigate = useNavigate();

  return (
    <div className="detente">
      <h1>🌿 Espace de Détente</h1>
      <p className="intro">
        Respire profondément, prends un moment pour toi. Choisis un thème :
      </p>
      <div className="detente__cards">
        {themes.map((theme, index) => (
          <div
            key={index}
            className="detente__card"
            onClick={() => navigate(theme.route)}
          >
            <img src={theme.image} alt={theme.title} />
            <div className="detente__card-content">
              <h3>{theme.title}</h3>
              <p>{theme.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Detente;
