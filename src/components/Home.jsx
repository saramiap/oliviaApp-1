import React from "react";
import "../styles/Home.scss";
import Carousel from "./Carousel"; // Le carrousel de vidéos/podcasts
import CardSection from "./CardSection"; // Les cards vers les pages

function Home() {
  return (
    <div className="home">
      <Carousel />

      <section className="home__sections">
        <h2>Découvre ton espace bien-être ✨</h2>
        <CardSection />
      </section>
    </div>
  );
}

export default Home;
