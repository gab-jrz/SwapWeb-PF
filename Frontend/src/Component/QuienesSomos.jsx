import React from "react";
import "../styles/QuienesSomos.css";

const QuienesSomos = () => (
  <section className="quienes-somos-container">
    <div className="qs-inner">
      <h2 className="qs-title">SWAPWEB.COM</h2>
      <p className="qs-subtitle">
        <strong>SwapWeb es una plataforma de intercambios totalmente gratis.</strong>
      </p>
      <p>
        En nuestra plataforma, podés <span className="qs-green">intercambiar</span> productos de manera <strong>segura</strong> y <strong>sencilla</strong>. 
      </p>
      <p>
        <strong>Intercambiá todo tipo de objetos</strong>: tecnología, ropa, electrodomésticos y mucho más. ¡Dale una segunda vida a lo que ya no usás!
      </p>
      <p className="qs-highlight">
        <strong>Sumate a la comunidad y proponé tu intercambio. ¡Publicar es gratis!</strong>
      </p>
      <p className="qs-footer">
        SwapWeb conecta personas que quieren dar una segunda oportunidad a sus objetos.
      </p>
    </div>
  </section>
);

export default QuienesSomos;
