import React from "react";  


const Header = ()=>{
    return(
        <header className="header">
            <div className="logo">
                <h1>SwapWeb</h1>
            </div>
            <nav className="nav">
                <ul>
                    <li><a href="/">Hogar</a></li>
                    <li><a href="/">Buscar</a></li>
                    <li><a href="/">Iniciar Sesion</a></li>
                    <li><a href="/">Sobre Nosotros</a></li>


                </ul>
            </nav>
        </header>
    )
}
export default Header;