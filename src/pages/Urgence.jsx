import React from "react";

const urgenceContacts = [
  {
    label: "Police / Urgences",
    number: "112",
    description: "Numéro d'urgence européen (accident, agression, détresse)",
  },
  {
    label: "Viol / Agressions sexuelles",
    number: "0800059595",
    description: "Écoute 24h/24 pour victimes de violences sexuelles",
  },
  {
    label: "Inceste Info",
    number: "0805242400",
    description: "Écoute dédiée aux victimes d’inceste et leurs proches",
  },
  {
    label: "SOS Suicide",
    number: "0145394000",
    description: "Soutien aux personnes en détresse psychologique",
  },
  {
    label: "Enfance en danger",
    number: "119",
    description: "Protection et écoute pour les mineurs",
  },
];

const Urgence = () => {
  return (
    <div className="urgence-page">
      <h1 className="urgence-title">Tu n’es pas seul·e 💛</h1>
      <p className="urgence-subtitle">
        Parler peut soulager. Ces lignes sont là pour t’écouter avec bienveillance, gratuitement et anonymement.
      </p>

      <div className="urgence-list">
        {urgenceContacts.map((contact, index) => (
          <div key={index} className="urgence-card">
            <h2>{contact.label}</h2>
            <p>{contact.description}</p>
            <a href={`tel:${contact.number}`} className="urgence-call">
              📞 Appeler le {contact.number}
            </a>
          </div>
        ))}
      </div>

      <div className="urgence-footer">
        <p>Prendre soin de toi est une force, pas une faiblesse. 🤝</p>
      </div>
    </div>
  );
};

export default Urgence;
