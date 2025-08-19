import React, { useState, useEffect, useRef } from "react";
import "../styles/CustomCarousel.css";

const slides = [
  {
    img: "/images/f3.avif",
    title: "Bienvenido a SwapWeb",
    subtitle: `SwapWeb es una aplicación web orientada exclusivamente al intercambio de productos
entre usuarios
`,
  },
  {
    img: "/images/foto4.avif",
    title: "¡Dale valor a lo que tenés!",
    subtitle:
      "Lo que para vos ya no es útil, puede ser el tesoro de otra persona. ¡Intercambiá y sorprendete!\n",
  },
  {
    img: "/images/f2.webp",
    title: "Explora productos únicos",
    subtitle: "Publica lo que ya no usas y encuentra lo que buscas",
  },
];

const CustomCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const carouselRef = useRef(null);

  const next = () => setCurrent((current + 1) % slides.length);
  const prev = () => setCurrent((current - 1 + slides.length) % slides.length);

  // Efecto flotante sutil
  useEffect(() => {
    const handleScroll = () => {
      if (carouselRef.current) {
        const rect = carouselRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Solo aplicar efecto cuando el carrusel está visible
        if (rect.top < windowHeight && rect.bottom > 0) {
          const scrollProgress = (windowHeight - rect.top) / (windowHeight + rect.height);
          setScrollY(scrollProgress);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={carouselRef} className="custom-carousel-container">
      <button className="custom-carousel-arrow left" onClick={prev}>
        &lt;
      </button>
      <div className="custom-carousel-slide">
        <img 
          src={slides[current].img} 
          alt={`slide-${current}`}
          style={{
            transform: `translateY(${(scrollY - 0.5) * 20}px)`,
          }}
        />
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
