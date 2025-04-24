import React, { useEffect, useRef } from "react";
import "../styles/Home.scss";

const items = [
  {
    title: "Podcast YouTube – Sérénité du soir",
    type: "youtube",
    src: "https://www.youtube.com/embed/Ba2iUcKp4oU",
  },
  {
    title: "Podcast Spotify – Motivation matinale",
    type: "spotify",
    src: "https://open.spotify.com/embed/episode/6kYzHziG5ADt5rWBv4ZUTP?utm_source=generator",
  },
  {
    title: "Podcast Deezer – Relaxation intense",
    type: "deezer",
    src: "https://widget.deezer.com/widget/dark/episode/2300011827",
  },
];

function Carousel() {
  const carouselRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        carouselRef.current.scrollBy({
          left: 340, // faire défilé a 340px sur le coté
          behavior: "smooth", // avec une animation fluid
        });
      }
    }, 5000); // toutes les 5 secondes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="carousel" ref={carouselRef}>
      {items.map((item, index) => (
        <div key={index} className="carousel__item">
          {item.type === "youtube" && (
            <iframe
              src={item.src}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
          {item.type === "spotify" && (
            <iframe
              src={item.src}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title={item.title}
            ></iframe>
          )}
          {item.type === "deezer" && (
            <iframe
              title={item.title}
              src={item.src}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
          <h4>{item.title}</h4>
        </div>
      ))}
    </div>
  );
}

export default Carousel;
