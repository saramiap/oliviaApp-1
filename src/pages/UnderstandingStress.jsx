// src/pages/UnderstandingStressPage.js
import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpCircle } from 'lucide-react'; // Icône pour remonter
import '../styles/_understandingStress.scss'; // Nouveau fichier SCSS

// Exemple de contenu structuré. Tu remplaceras cela par ton propre texte et images.
const contentSections = [
  {
    id: 'introduction',
    title: 'Qu\'est-ce que le Stress, au Juste ?',
    image: '/public/stress/le-stress-rouge.jpg', // Chemin vers ton image
    paragraphs: [
      "Le stress est une réaction naturelle de notre corps face à une demande ou un défi. C'est une sonnette d'alarme qui nous prépare à l'action. Imagine nos ancêtres face à un danger : le cœur s'accélère, les muscles se tendent, l'attention est maximale... C'est le fameux mode 'combat ou fuite'.",
      "Aujourd'hui, les 'dangers' sont souvent différents – une présentation importante, des embouteillages, des soucis financiers – mais notre corps peut réagir de manière similaire."
    ],
  },
  {
    id: 'good-bad-stress',
    title: 'Le Bon Stress (Eustress) vs. le Mauvais Stress (Distress)',
    image: '/public/stress/bon-et-mauvais-stress.jpg',
    paragraphs: [
      "Tout stress n'est pas négatif ! Un peu de stress peut être stimulant : c'est l'eustress. Il nous motive à performer, à nous dépasser lors d'un examen ou d'une compétition sportive.",
      "Le problème survient lorsque le stress devient chronique, intense ou que nous avons l'impression de ne plus avoir les ressources pour y faire face. C'est le distress, celui qui peut nous bloquer et nuire à notre bien-être."
    ],
  },
  {
    id: 'body-mind-effects',
    title: 'L\'Impact du Stress sur Notre Corps et Esprit',
    // Pas d'image principale pour cette section, peut-être des petites icônes dans le texte plus tard
    image: null, 
    subSections: [ // On peut avoir des sous-sections
        {
            subTitle: "Physiquement :",
            points: [
                "Tensions musculaires (dos, nuque, mâchoires)",
                "Maux de tête, troubles digestifs",
                "Fatigue persistante, troubles du sommeil",
                "Système immunitaire affaibli"
            ]
        },
        {
            subTitle: "Mentalement et Émotionnellement :",
            points: [
                "Difficulté à se concentrer, pertes de mémoire",
                "Irritabilité, anxiété, sautes d'humeur",
                "Sentiment d'être dépassé·e, perte de motivation",
                "Tendance à l'isolement"
            ]
        }
    ]
  },
  {
    id: 'blocking-mechanisms',
    title: 'Comment le Stress Nous Bloque-t-il ?',
    image: '/public/stress/bloqué-par-le-stress.jpg',
    paragraphs: [
      "Lorsque le stress devient chronique, notre cerveau peut rester en mode 'alerte'. Cela peut entraîner plusieurs mécanismes de blocage :",
      "**1. Le Tunnel de Vision Cognitif :** Sous stress, notre capacité à penser de manière créative et à envisager des solutions alternatives diminue. On se focalise sur la menace (réelle ou perçue), ce qui nous empêche de voir les issues.",
      "**2. L'Évitement :** Face à une source de stress, une réaction courante est de l'éviter. Si cela peut soulager à court terme, l'évitement constant peut nous empêcher d'affronter les problèmes et de développer notre résilience.",
      "**3. La Procrastination :** Le sentiment d'être dépassé·e peut mener à repousser les tâches, ce qui augmente le stress à long terme.",
      "**4. Le Brouillard Cérébral :** Une surcharge cognitive due au stress peut rendre difficile la prise de décision, l'organisation et la clarté mentale."
    ],
  },
  {
    id: 'first-steps',
    title: 'Premières Pistes pour Mieux Gérer le Stress',
    image: '/public/stress/sortir-du-stress.jpg',
    paragraphs: [
      "Comprendre le stress est le premier pas. Voici quelques pistes initiales :",
      "Identifier ses stresseurs, pratiquer des techniques de relaxation (comme celles proposées dans notre espace détente !), prendre soin de son hygiène de vie (sommeil, alimentation, exercice), et ne pas hésiter à parler et chercher du soutien."
    ],
  }
];

const WORDS_PER_MINUTE = 200; // Vitesse de lecture moyenne

const UnderstandingStress = () => {
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const [estimatedReadingTime, setEstimatedReadingTime] = useState(0);
  const [remainingReadingTime, setRemainingReadingTime] = useState(0);
  
  const pageContentRef = useRef(null); // Référence au conteneur du contenu principal pour calculer la hauteur

  // Calcul du temps de lecture initial
  useEffect(() => {
    if (pageContentRef.current) {
      const textContent = Array.from(pageContentRef.current.querySelectorAll('p, li, h2, h3, h4')) // Sélectionne les éléments textuels
                             .map(el => el.textContent || '')
                             .join(' ');
      const wordCount = textContent.split(/\s+/).filter(Boolean).length;
      const time = Math.ceil(wordCount / WORDS_PER_MINUTE);
      setEstimatedReadingTime(time);
      setRemainingReadingTime(time);
    }
  }, []); // Calculé une seule fois au montage

  // Gestion de l'affichage du bouton "Retour en haut" et mise à jour du temps de lecture restant
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const pageHeight = pageContentRef.current?.scrollHeight || document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;

      if (scrollY > 300) {
        setShowScrollTopButton(true);
      } else {
        setShowScrollTopButton(false);
      }
      
      // Mise à jour du temps de lecture restant
      if (pageContentRef.current && estimatedReadingTime > 0) {
        const scrolledPercentage = Math.min(1, (scrollY + viewportHeight) / pageHeight) ; // Pourcentage scrollé de la page visible
        const timeRead = Math.floor(estimatedReadingTime * scrolledPercentage);
        setRemainingReadingTime(Math.max(0, estimatedReadingTime - timeRead));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Appel initial pour vérifier la position
    return () => window.removeEventListener('scroll', handleScroll);
  }, [estimatedReadingTime]); // Recalculer si estimatedReadingTime change (ne devrait pas ici)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="understanding-stress-page">
      <header className="usp-header">
        <h1>Pourquoi le Stress Nous Bloque</h1>
        <p className="usp-intro">
          Plongez dans une exploration simple et claire des mécanismes du stress et découvrez comment il peut parfois nous paralyser, mais aussi comment commencer à y faire face.
        </p>
        {estimatedReadingTime > 0 && (
          <div className="usp-reading-time">
            Temps de lecture estimé : ~{estimatedReadingTime} minute{estimatedReadingTime > 1 ? 's' : ''}
          </div>
        )}
      </header>

      <div className="usp-sticky-reading-time">
        {remainingReadingTime > 0 && `~${remainingReadingTime} min restantes`}
      </div>

      <main className="usp-content" ref={pageContentRef}>
        {contentSections.map((section) => (
          <section key={section.id} className="usp-section" id={section.id}>
            {section.image && (
              <div className="usp-section-image-container">
                <img src={section.image} alt={section.title} className="usp-section-image" />
              </div>
            )}
            <div className="usp-section-text">
              <h2>{section.title}</h2>
              {section.paragraphs && section.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
              {section.subSections && section.subSections.map((sub, subIndex) => (
                  <div key={subIndex} className="usp-subsection">
                      {sub.subTitle && <h4>{sub.subTitle}</h4>}
                      {sub.points && (
                          <ul>
                              {sub.points.map((point, pointIndex) => <li key={pointIndex}>{point}</li>)}
                          </ul>
                      )}
                  </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {showScrollTopButton && (
        <button onClick={scrollToTop} className="usp-scroll-top-button" title="Retour en haut">
          <ArrowUpCircle size={32} />
        </button>
      )}

      <footer className="usp-footer">
        <p>Vous avez maintenant une meilleure compréhension du stress. Explorez nos autres sections pour des outils concrets de relaxation et de gestion du stress.</p>
        {/* Liens vers d'autres sections pertinentes */}
      </footer>
    </div>
  );
};

export default UnderstandingStress;