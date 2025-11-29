import React, { useState, useEffect, useMemo, useRef } from 'react';
import imgAgendamento from '../assets/agendamento.png';

const API_URL = 'http://localhost:8080';
const nomeDosMeses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];
const horariosSimulados = [];
for (let h = 9; h <= 17; h++) {
  horariosSimulados.push(`${String(h).padStart(2, '0')}:00`);
  horariosSimulados.push(`${String(h).padStart(2, '0')}:30`);
}
horariosSimulados.push('18:00');

function PaginaAgenda() {

  // Auxiliar: Data zerada (00:00:00) para evitar bugs de comparação
  const getHojeZerado = () => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return hoje;
  };

  // Estados
  const [dataAtual, setDataAtual] = useState(new Date());
  const [petsCache, setPetsCache] = useState([]);
  const [servicosCache, setServicosCache] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [diaSelecionado, setDiaSelecionado] = useState(getHojeZerado());
  const [agendamentoEmEdicao, setAgendamentoEmEdicao] = useState(null);
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    petId: '',
    servicoNome: '',
    data: '',
    hora: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  // Efeito: Carregar dados iniciais
  useEffect(() => {
    const carregarTudo = async () => {
      setIsLoading(true);
      try {
        const [petsRes, servicosRes, agendamentosRes] = await Promise.all([
          fetch(`${API_URL}/pets`),
          fetch(`${API_URL}/servicos`),
          fetch(`${API_URL}/agendamentos`)
        ]);
        setPetsCache(petsRes.ok ? await petsRes.json() : []);
        setServicosCache(servicosRes.ok ? await servicosRes.json() : []);
        setAgendamentos(agendamentosRes.ok ? await agendamentosRes.json() : []);
      } catch (err) {
        console.warn('Erro ao carregar dados iniciais:', err);
      } finally {
        setIsLoading(false);
      }
    };
    carregarTudo();
  }, []);

  // Lógica do Calendário
  const agendamentosDoDia = useMemo(() => {
    if (!diaSelecionado) return [];
    const dataISO = diaSelecionado.toISOString().split('T')[0];
    return agendamentos.filter(a => a.dataHora.startsWith(dataISO));
  }, [agendamentos, diaSelecionado]);

  const gerarDiasDoCalendario = () => {
    const mes = dataAtual.getMonth();
    const ano = dataAtual.getFullYear();
    const hoje = getHojeZerado();

    const primeiroDiaDoMes = new Date(ano, mes, 1).getDay();
    const ultimoDiaDoMes = new Date(ano, mes + 1, 0).getDate();
    const ultimoDiaMesAnterior = new Date(ano, mes, 0).getDate();

    const dias = [];

    // Dias do mês anterior
    for (let i = primeiroDiaDoMes; i > 0; i--) {
      dias.push(<div className="dia-calendario outro-mes" key={`prev-${i}`}>{ultimoDiaMesAnterior - i + 1}</div>);
    }

    // Dias do mês atual
    for (let i = 1; i <= ultimoDiaDoMes; i++) {
      const dataCompleta = new Date(ano, mes, i);
      dataCompleta.setHours(0, 0, 0, 0);

      let classes = 'dia-calendario';

      if (dataCompleta < hoje) {
        classes += ' passado';
      } else {
        if (dataCompleta.getTime() === hoje.getTime()) {
          classes += ' hoje';
        }
        if (diaSelecionado && dataCompleta.getTime() === diaSelecionado.getTime()) {
          classes += ' selecionado';
        }
      }

      dias.push(
        <div className={classes} key={`curr-${i}`} onClick={() => {
          if (dataCompleta >= hoje) {
            setDiaSelecionado(dataCompleta);
            setFormData(prev => ({ ...prev, data: dataCompleta.toISOString().split('T')[0], hora: '' }));
          }
        }}>
          {i}
        </div>
      );
    }
    return dias;
  };

  // Handlers
  const mudarMes = (offset) => {
    setDataAtual(new Date(dataAtual.setMonth(dataAtual.getMonth() + offset)));
  };

  const handleDiaClick = (data) => {
    setDiaSelecionado(data);
    resetFormulario();
  };

  const handleHorarioVagoClick = (hora) => {
    const dataISO = diaSelecionado.toISOString().split('T')[0];
    setFormData({ ...formData, data: dataISO, hora: hora });
    setAgendamentoEmEdicao(null);
    formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(dadosAntigos => ({ ...dadosAntigos, [name]: value }));
  };

  const resetFormulario = () => {
    setFormData({ petId: '', servicoNome: '', data: '', hora: '' });
    setAgendamentoEmEdicao(null);
  };

  // Handler: Submissão (Criar ou Editar)
  const handleSubmit = async (evento) => {
    evento.preventDefault();

    if (!formData.petId || !formData.servicoNome) {
      alert('Selecione um pet e um serviço.');
      return;
    }

    try {
      let servicoObj = servicosCache.find(s => s.nome === formData.servicoNome);

      if (!servicoObj) {
        alert('Serviço não encontrado. Por favor, cadastre o serviço primeiro na página "Serviços".');
        return;
      }

      const dataHora = new Date(`${formData.data}T${formData.hora}`);
      const payload = {
        dataHora: dataHora.toISOString(),
        petId: parseInt(formData.petId),
        servicoId: parseInt(servicoObj.id)
      };

      let url = `${API_URL}/agendamentos`;
      let method = 'POST';

      if (agendamentoEmEdicao) {
        url = `${API_URL}/agendamentos/${agendamentoEmEdicao.id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Falha na operação');
      }

      const agendamentoAtualizado = await res.json();

      if (agendamentoEmEdicao) {
        setAgendamentos(listaAntiga => listaAntiga.map(a =>
          a.id === agendamentoEmEdicao.id ? agendamentoAtualizado : a
        ));
        alert('Agendamento atualizado com sucesso.');
      } else {
        setAgendamentos(listaAntiga => [...listaAntiga, agendamentoAtualizado]);
        alert('Agendamento criado com sucesso.');
      }

      resetFormulario();

    } catch (err) {
      console.error('Erro ao salvar agendamento:', err);
      alert(`Erro ao salvar: ${err.message}`);
    }
  };

  // Handler: Deletar
  const handleDelete = async (idDoAgendamento) => {
    if (confirm("Tem certeza que deseja excluir este agendamento?")) {
      try {
        const res = await fetch(`${API_URL}/agendamentos/${idDoAgendamento}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          alert("Agendamento removido!");
          setAgendamentos(listaAntiga => listaAntiga.filter(a => a.id !== idDoAgendamento));
        } else {
          alert("Erro ao deletar.");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Handler: Editar
  const handleEditarClick = (agendamento) => {
    setAgendamentoEmEdicao(agendamento);

    const dataObj = new Date(agendamento.dataHora);
    const dataISO = dataObj.toISOString().split('T')[0];
    const hora = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });

    setFormData({
      petId: agendamento.petId,
      servicoNome: agendamento.servico.nome,
      data: dataISO,
      hora: hora
    });

    formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };


  if (isLoading) {
    return <div className="conteiner"><p>Carregando agenda...</p></div>
  }

  return (
    <div className="agenda-secao" style={{ padding: '2rem 0' }}>
      <div className="conteiner">

        <div className="agenda-header">...</div>
        <div className="agenda-grid">
          <div className="calendario-container">
            <div className="calendario-header">
              <button className="nav-mes" onClick={() => mudarMes(-1)}>&larr;</button>
              <h3>{`${nomeDosMeses[dataAtual.getMonth()]} ${dataAtual.getFullYear()}`}</h3>
              <button className="nav-mes" onClick={() => mudarMes(1)}>&rarr;</button>
            </div>
            <div className="calendario-dias">
              <div className="dia-semana">Dom</div><div className="dia-semana">Seg</div><div className="dia-semana">Ter</div><div className="dia-semana">Qua</div><div className="dia-semana">Qui</div><div className="dia-semana">Sex</div><div className="dia-semana">Sáb</div>
              {gerarDiasDoCalendario()}
            </div>
          </div>

          {/* Coluna 2: Horários */}
          <div className="lista-agendamentos">
            <h3 id="horarios-titulo">
              {diaSelecionado ? `Horários para ${diaSelecionado.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}` : 'Selecione um dia'}
            </h3>
            <ul id="horarios-lista" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {!diaSelecionado && <li style={{ opacity: 0.7 }}>...</li>}

              {diaSelecionado && horariosSimulados.map(hora => {
                const agendamentoOcupado = agendamentosDoDia.find(a =>
                  a.dataHora.includes(`T${hora}`)
                );

                if (agendamentoOcupado) {
                  const pet = petsCache.find(p => p.id === agendamentoOcupado.petId);
                  const servico = servicosCache.find(s => s.id === agendamentoOcupado.servicoId);

                  return (
                    <div className="agendamento-item ocupado" key={hora}>
                      <span className="hora">{hora}</span>
                      <span className="nome-pet">{pet ? pet.nome : '...'}</span>
                      <span className="servico">{servico ? servico.nome : '...'}</span>
                      <div className="agendamento-acoes">
                        <button onClick={() => handleEditarClick(agendamentoOcupado)} title="Editar">✎</button>
                        <button onClick={() => handleDelete(agendamentoOcupado.id)} title="Excluir">&times;</button>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="agendamento-item vago" key={hora} onClick={() => handleHorarioVagoClick(hora)}>
                      <span className="hora">{hora}</span>
                      <span className="nome-pet">Horário Vago</span>
                    </div>
                  );
                }
              })}
            </ul>
          </div>
        </div>

        {/* Seção do Formulário */}
        <section id="novo-agendamento" className="sobre-nos-secao" ref={formRef} style={{ marginTop: '3rem', background: 'var(--cor-branca)' }}>
          <div className="sobre-nos-grid">

            <div className="sobre-nos-texto">
              <h2>{agendamentoEmEdicao ? 'Editar Agendamento' : 'Agendar um Horário'}</h2>
              <p>{agendamentoEmEdicao ? 'Altere os dados abaixo e clique em "Atualizar".' : 'Selecione um horário vago na lista para preencher os detalhes.'}</p>

              <form id="form-agendamento" className="formulario-agenda" onSubmit={handleSubmit}>

                <div className="form-grupo">
                  <label htmlFor="pet-select-agenda">Pet:</label>
                  <select id="pet-select-agenda" name="petId" required
                    value={formData.petId} onChange={handleFormChange}>
                    <option value="" disabled>Selecione um pet...</option>
                    {petsCache.map(pet => (
                      <option key={pet.id} value={pet.id}>{pet.nome} - (Dono: {pet.dono})</option>
                    ))}
                  </select>
                </div>

                <div className="form-grupo">
                  <label htmlFor="servico">Serviço:</label>
                  <select id="servico" name="servicoNome" required
                    value={formData.servicoNome} onChange={handleFormChange}>
                    <option value="" disabled>Selecione...</option>
                    {servicosCache.map(s => (
                      <option key={s.id} value={s.nome}>{s.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="form-grupo">
                  <label htmlFor="data">Data:</label>
                  <input type="date" id="data" name="data" required readOnly
                    value={formData.data} disabled={!!agendamentoEmEdicao} />
                </div>
                <div className="form-grupo">
                  <label htmlFor="hora">Hora:</label>
                  <input type="time" id="hora" name="hora" required readOnly
                    value={formData.hora} disabled={!!agendamentoEmEdicao} />
                </div>

                <button type="submit" className="botao-principal" style={{ border: 'none', cursor: 'pointer' }}>
                  {agendamentoEmEdicao ? 'Atualizar Agendamento' : 'Confirmar Agendamento'}
                </button>

                {agendamentoEmEdicao && (
                  <button type="button" className="botao-secundario"
                    onClick={resetFormulario}
                    style={{ border: 'none', cursor: 'pointer', width: '100%', marginTop: '0.5rem' }}>
                    Cancelar Edição
                  </button>
                )}
              </form>
            </div>

            <div className="sobre-nos-imagem">
              <img src={imgAgendamento} alt="Calendário e pet" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default PaginaAgenda;