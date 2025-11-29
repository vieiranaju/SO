import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Rodape from './components/Rodape.jsx';

function App() {
  return (
    <div>
      <Navbar />

      {/* O Outlet renderiza o conteúdo da página atual */}
      <main>
        <Outlet />
      </main>

      <Rodape />
    </div>
  );
}

export default App;