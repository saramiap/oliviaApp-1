import React from "react";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X"; // Assure-toi que c'est l'icône X de Twitter ou une icône générique si c'est ce que tu veux
import YouTubeIcon from "@mui/icons-material/YouTube";
// import '../styles/_footer.scss'; // Assure-toi d'importer le bon fichier SCSS

function Footer() {
  // Tu pourrais rendre ces liens dynamiques ou les configurer ailleurs
  const footerLinkColumns = [
    ["À propos", "Carrières", "Presse", "Blog"],
    ["Aide", "FAQ", "Contactez-nous", "Politique de retour"],
    ["Confidentialité", "Conditions d'utilisation", "Préférences cookies", "Accessibilité"],
    
  ];


  return (
    <footer className="footer">
      <div className="footer__container"> {/* Renommé pour clarté et éviter conflit avec .container global si existant */}
        <div className="footer__top-section">
          <div className="footer__socials">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Facebook">
              <FacebookIcon />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Twitter X">
              <XIcon />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="YouTube">
              <YouTubeIcon />
            </a>
          </div>
          {/* Optionnel: Espace pour un petit logo ou un slogan dans le footer */}
          {/* <div className="footer__brand">
            <span>MonLogo Footer</span>
          </div> */}
        </div>

        <div className="footer__links-grid">
          {/* Exemple de rendu des colonnes de liens dynamiquement */}
          {footerLinkColumns.map((column, colIndex) => (
            <ul key={colIndex} className="footer__links-column">
              {column.map((linkText, linkIndex) => (
                <li key={linkIndex} className="footer__link-item">
                  <a href={`/${linkText.toLowerCase().replace(/\s+/g, '-')}`}>{linkText}</a>
                </li>
              ))}
            </ul>
          ))}
        </div>
        
        <div className="footer__bottom-section">
          <p className="footer__copyright">
            © {new Date().getFullYear()} TonNomDeProjet. Tous droits réservés.
          </p>
          {/* Optionnel: Liens de bas de page (ex: plan du site) */}
          {/* <div className="footer__bottom-links">
            <a href="/plan-du-site">Plan du site</a>
          </div> */}
        </div>
      </div>
    </footer>
  );
}

export default Footer;