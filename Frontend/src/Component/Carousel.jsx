import React, { useState } from "react";
import "../styles/CustomCarousel.css";

const slides = [
  {
    img: "/images/f3.avif",
    title: "Bienvenido a SwapWeb",
    subtitle: `SwapWeb es una aplicación web orientada exclusivamente al intercambio de productos
entre usuarios, dejando de lado la funcionalidad de donaciones para enfocarse en una
experiencia de trueque moderna, segura y eficiente. El objetivo principal es facilitar el
contacto entre personas interesadas en intercambiar bienes, promoviendo el consumo
responsable, la reutilización y la economía colaborativa`,
  },
  {
    img: "/images/foto4.avif",
    title: "Bienvenido a SwapWeb",
    subtitle: "¡Descubre y comparte!",
  },
  {
    img: "/images/f2.webp",
    title: "Explora productos únicos",
    subtitle: "Publica lo que ya no usas y encuentra lo que buscas",
  },
];

const CustomCarousel = () => {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((current + 1) % slides.length);
  const prev = () => setCurrent((current - 1 + slides.length) % slides.length);

  return (
    <div className="custom-carousel-container">
      <button className="custom-carousel-arrow left" onClick={prev}>
        &lt;
      </button>
      <div className="custom-carousel-slide">
        <img src={slides[current].img} alt={`slide-${current}`} />
        <div className="custom-carousel-overlay">
          <div className="carousel-text-group">
            <div className="carousel-title">{slides[current].title}</div>
            <div className="carousel-subtitle">{slides[current].subtitle}</div>
          </div>
        </div>
      </div>
      <button className="custom-carousel-arrow right" onClick={next}>
        &gt;
      </button>
    </div>
  );
};

export default CustomCarousel;
