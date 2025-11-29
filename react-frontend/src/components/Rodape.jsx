import React from 'react';
import { Link } from 'react-router-dom';

function Rodape() {
  return (
    <footer className="rodape" id="contato">
      <div className="conteiner">
        <div className="rodape-grid">

          <div className="rodape-coluna">
            <Link to="/" className="logo">Petshop</Link>
            <p>Cuidado e carinho para seu melhor amigo.</p>
          </div>

          <div className="rodape-coluna">
            <h4>Links Rápidos</h4>
            <ul>
              <li><Link to="/">Painel</Link></li>
              <li><Link to="/agenda">Agenda</Link></li>
              <li><Link to="/vacinas">Vacinas</Link></li>
              <li><Link to="/clientes">Clientes</Link></li>
            </ul>
          </div>

          <div className="rodape-coluna">
            <h4>Entre em Contato</h4>
            <p>Estamos na (Sua Rua), número 123.</p>
            <p>contato@petshop.com</p>
          </div>

        </div>
        <div className="rodape-copyright">
          <p>© 2025 - Sistema de Gerenciamento Petshop</p>
        </div>
      </div>
    </footer>
  );
}

export default Rodape;