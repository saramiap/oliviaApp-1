import React from "react";

import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";
import YouTubeIcon from "@mui/icons-material/YouTube";

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__socials">
          <a href="/" className="footer__social">
            <FacebookIcon />
          </a>
          <a href="/" className="footer__social">
            <InstagramIcon />
          </a>
          <a href="/" className="footer__social">
            <XIcon />
          </a>
          <a href="/" className="footer__social">
            <YouTubeIcon />
          </a>
        </div>
        <ul className="footer__links">
          <li className="footer__link">
            <a href="">lien footer</a>
          </li>
          <li className="footer__link">
            <a href="">lien footer</a>
          </li>
          <li className="footer__link">
            <a href="">lien footer</a>
          </li>
          <li className="footer__link">
            <a href="">lien footer</a>
          </li>
          <li className="footer__link">
            <a href="">lien footer</a>
          </li>
          <li className="footer__link">
            <a href="">lien footer</a>
          </li>
          <li className="footer__link">
            <a href="">lien footer</a>
          </li>
          <li className="footer__link">
            <a href="">lien footer</a>
          </li>
        </ul>
        <div className="footer__copy">Exemple droit réservé</div>
      </div>
    </footer>
  );
}

export default Footer;
