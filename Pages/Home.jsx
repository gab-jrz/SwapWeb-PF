import React from "react";
import Header from "../src/Component/Header";
import Search from "../src/Component/SearchBar";
import ProductCard from "../src/Component/ProductCard";
import ProductList from "../src/Component/ProductLis";
import Footer from "../src/Component/Footer";


const Home = ()=>{
    return (
        <div>
       <Header/>
       <Search/>
       <ProductCard/>
       <ProductList/>
       <Footer/>
        </div>
    );
};
export default Home;