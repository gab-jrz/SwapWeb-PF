import React from "react";
const Search = ({searchTerm,setSearchTerm}) =>{
    return(
        <div className="search-bar">
            <input type="text" placeholder="Buscar Productos"
            value="{searchTerm}
            onChange={(e)=> setSearchTerm(e.target.value)}" className="input-busqueda">

            </input>
        </div>
    )
}
export default Search;