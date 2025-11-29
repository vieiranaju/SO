import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import dogosBackground from '../assets/dogos.jpg';

const API_URL = 'http://localhost:8080';

// Auxiliar: Formatar hora
const formatarHora = (dataString) => {
  return new Date(dataString).toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit', timeZone: 'UTC'
  });
};

function PaginaPainel() {

  // Estados
  const [pets, setPets] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [vacinas, setVacinas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Efeito: Carregar dados
  useEffect(() => {
    const carregarTudo = async () => {
      setIsLoading(true);
      try {
        const [petsRes, agendamentosRes, vacinasRes] = await Promise.all([
          fetch(`${API_URL}/pets`),
          fetch(`${API_URL}/agendamentos`),
          fetch(`${API_URL}/vacinas`)
        ]);

        const petsData = petsRes.ok ? await petsRes.json() : [];
        const agendamentosData = agendamentosRes.ok ? await agendamentosRes.json() : [];
        const vacinasData = vacinasRes.ok ? await vacinasRes.json() : [];

        setPets(petsData);
        setAgendamentos(agendamentosData);
        setVacinas(vacinasData);

      } catch (err) {
        console.warn('Erro ao carregar dados do dashboard:', err);
        alert('Erro ao carregar o painel. O seu back-end (Docker) está rodando?');
      } finally {
        setIsLoading(false);
      }
    };
    carregarTudo();
  }, []);

  // Cálculos do Dashboard
  const estatisticas = useMemo(() => {
    const hoje = new Date();
    hoje.setUTCHours(0, 0, 0, 0);
    const hojeISO = hoje.toISOString().split('T')[0];

    const semanaQueVem = new Date(hoje);
    semanaQueVem.setUTCDate(hoje.getUTCDate() + 7);

    // Card: Agendamentos
    const agendamentosDeHoje = agendamentos.filter(a =>
      a.dataHora.startsWith(hojeISO)
    );

    // Card: Vacinas
    const vacinasAVencer = vacinas.filter(v => {
      if (!v.proximaDose) return false;
      const dataDose = new Date(v.proximaDose);
      return dataDose >= hoje && dataDose <= semanaQueVem;
    });

    // Card: Clientes
    const donos = new Set(pets.map(p => p.dono));
    const totalClientes = donos.size;
    const totalPets = pets.length;

    // Card: Próximos Horários
    const proximosHorarios = [...agendamentosDeHoje]
      .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora))
      .slice(0, 3);

    return {
      agendamentosDeHoje,
      vacinasAVencer,
      totalClientes,
      totalPets,
      proximosHorarios
    };
  }, [pets, agendamentos, vacinas]);


  const heroStyle = {
    background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${dogosBackground}) center/cover no-repeat`,
    height: '70vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    color: 'var(--cor-branca)',
    padding: '0 1rem',
  };

  return (
    <>
      <main className="hero" style={heroStyle}>
        <div className="conteudo-hero">
          <h1>Bem-vindo, Gerente!</h1>
          <p style={{ margin: '1rem auto 2rem', maxWidth: '600px' }}>
            Acesse seus módulos de gestão ou veja um resumo do dia abaixo.
          </p>
          <Link to="/agenda" className="botao-principal">Ir para a Agenda</Link>
        </div>
      </main>

      <section className="dashboard-secao">
        <div className="conteiner">
          <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem' }}>Resumo do Dia</h2>

          {isLoading ? (
            <p style={{ textAlign: 'center' }}>Carregando estatísticas...</p>
          ) : (

            <div className="dashboard-grid">

              <div className="dash-card">
                <h3>Agendamentos de Hoje</h3>
                <div className="dash-numero">{estatisticas.agendamentosDeHoje.length}</div>
                <p>Agendamentos para hoje</p>
                <Link to="/agenda" className="botao-card" style={{ background: 'var(--cor-primaria)', color: 'var(--cor-branca)', border: 'none' }}>
                  Ver Agenda Completa
                </Link>
              </div>

              <div className="dash-card">
                <h3>Vacinas a Vencer</h3>
                <div className="dash-numero">{estatisticas.vacinasAVencer.length}</div>
                <p>Próximos 7 dias</p>
                <Link to="/vacinas" className="botao-card" style={{ background: 'var(--cor-primaria)', color: 'var(--cor-branca)', border: 'none' }}>
                  Ver Controle de Vacinas
                </Link>
              </div>

              <div className="dash-card">
                <h3>Total de Clientes</h3>
                <div className="dash-numero">{estatisticas.totalClientes}</div>
                <p>{estatisticas.totalClientes} clientes e {estatisticas.totalPets} pets cadastrados.</p>
                <Link to="/clientes" className="botao-card" style={{ background: 'var(--cor-primaria)', color: 'var(--cor-branca)', border: 'none' }}>
                  Gerenciar Clientes
                </Link>
              </div>

              <div className="dash-card dash-card-grande">
                <h3>Próximos Horários</h3>
                <div className="dash-lista-resumo">

                  {estatisticas.proximosHorarios.length === 0 && (
                    <p style={{ opacity: 0.7, padding: '1rem' }}>Nenhum agendamento hoje.</p>
                  )}

                  {estatisticas.proximosHorarios.map(agendamento => {
                    const pet = pets.find(p => p.id === agendamento.petId);
                    return (
                      <div className="agendamento-item" key={agendamento.id}>
                        <span className="hora">{formatarHora(agendamento.dataHora)}</span>
                        <span className="nome-pet">{pet ? pet.nome : 'Carregando...'}</span>
                        <span className="servico">{agendamento.servico.nome}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default PaginaPainel;