import React from 'react';
import { Link, NavLink } from 'react-router-dom';

function Navbar() {
  const getNavLinkClass = ({ isActive }) => {
    return isActive ? 'ativo' : ''; // Usa a sua classe CSS .ativo
  };

  return (
    <header className="navbar">
      <div className="conteiner">
        <Link to="/" className="logo">Petshop</Link>
        <nav>
          <ul>
            <li><NavLink to="/" end className={getNavLinkClass}>Painel</NavLink></li>
            <li><NavLink to="/agenda" className={getNavLinkClass}>Agenda</NavLink></li>
            <li><NavLink to="/vacinas" className={getNavLinkClass}>Vacinas</NavLink></li>
            <li><NavLink to="/clientes" className={getNavLinkClass}>Clientes</NavLink></li>
            <li><NavLink to="/servicos" className={getNavLinkClass}>Serviços</NavLink></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
export default Navbar;