import React from 'react';
import Header from './assets/Component/Hearder';
import ProductCard from './assets/Component/ProductCard';
import ProductList from './assets/Component/ProductLis';
import Footer from './assets/Component/Footer';
import Search from './assets/Component/SearchBar';

function App() {
  return (
    <div>
      <h1>¡SwapWeb está vivo!</h1>
      < Header />
      < ProductCard/>
      <ProductList/>
      <Footer/>
      <Search/>
    </div>
  );
}

export default App;

