import React from "react";
// Importer une icône de téléphone si tu utilises une librairie d'icônes,
// sinon on peut utiliser un emoji ou un SVG simple.
// Par exemple, avec lucide-react:
import { PhoneOutgoing } from 'lucide-react';
// import '../styles/_urgencePage.scss'; // Assure-toi d'importer tes styles

const urgenceContacts = [
  {
    id: "europe", // Ajout d'un id pour des clés plus robustes si besoin
    label: "Urgences (Police, Pompiers, SAMU)",
    number: "112",
    description: "Numéro d'appel d'urgence européen accessible gratuitement partout en UE.",
  },
  {
    id: "suicide",
    label: "Prévention du Suicide",
    number: "3114", // Numéro national de prévention du suicide
    description: "Écoute professionnelle, confidentielle et gratuite, 24h/24 et 7j/7.",
  },
  {
    id: "violences-femmes",
    label: "Violences Femmes Info",
    number: "3919",
    description: "Écoute, informe et oriente les femmes victimes de violences.",
  },
  {
    id: "enfance-danger",
    label: "Enfance en Danger",
    number: "119",
    description: "Service national d'accueil téléphonique pour l'enfance en danger (SNATED).",
  },
{
  id:"harcèlement",
  label:"Harcelement",
  number: "3020",
  description: "le numéro national contre toutes les formes de harcèlement, y compris cyberharcèlement à l'école",
},

];

const Urgence = () => {
  return (
    <div className="urgence-page-container"> {/* Conteneur global pour le fond */}
      <div className="urgence-page-content"> {/* Conteneur pour le contenu centré */}
        <header className="urgence-header">
          <h1 className="urgence-title">Vous n'êtes pas seul·e <span role="img" aria-label="cœur jaune">💛</span></h1>
          <p className="urgence-subtitle">
            Si vous traversez une période difficile ou si vous avez besoin d'aide immédiate, 
            des professionnels sont là pour vous écouter, gratuitement et anonymement.
          </p>
        </header>

        <section className="urgence-list">
          {urgenceContacts.map((contact) => (
            <article key={contact.id} className="urgence-card">
              <div className="urgence-card-icon-wrapper">
                {/* Ici, tu pourrais mettre une icône thématique si tu en as */}
                {/* Pour l'instant, on laisse vide ou on met un placeholder */}
              </div>
              <div className="urgence-card-info">
                <h2 className="urgence-card-label">{contact.label}</h2>
                <p className="urgence-card-description">{contact.description}</p>
              </div>
              <a href={`tel:${contact.number.replace(/\s/g, '')}`} className="urgence-card-call-button">
                <PhoneOutgoing size={18} className="call-icon" />
                <span>Appeler le {contact.number}</span>
              </a>
            </article>
          ))}
        </section>

        <footer className="urgence-footer-message">
          <p>Tendre la main est un signe de courage. Vous êtes important·e.</p>
        </footer>
      </div>
    </div>
  );
};

export default Urgence;