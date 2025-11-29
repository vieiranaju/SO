import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Estilos Globais
import './style.css';

// Layout e Páginas
import App from './App.jsx';
import PaginaPainel from './pages/PaginaPainel.jsx';
import PaginaAgenda from './pages/PaginaAgenda.jsx';
import PaginaVacinas from './pages/PaginaVacinas.jsx';
import PaginaClientes from './pages/PaginaClientes.jsx';
import PaginaServicos from './pages/PaginaServicos.jsx';

// Configuração de Rotas
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // Layout Principal
    children: [
      { path: "/", element: <PaginaPainel /> },
      { path: "agenda", element: <PaginaAgenda /> },
      { path: "vacinas", element: <PaginaVacinas /> },
      { path: "clientes", element: <PaginaClientes /> },
      { path: "servicos", element: <PaginaServicos /> },
    ],
  },
]);

// Renderização
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);