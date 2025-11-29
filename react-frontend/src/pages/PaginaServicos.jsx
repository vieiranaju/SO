import React, { useState, useEffect, useMemo, useRef } from 'react';

const API_URL = 'http://localhost:8080';

function PaginaServicos() {

  // Estados
  const [servicos, setServicos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [servicoEmEdicao, setServicoEmEdicao] = useState(null);
  const formRef = useRef(null);

  const [formState, setFormState] = useState({
    nome: '',
    preco: ''
  });

  // Efeito: Carregar serviços
  useEffect(() => {
    const fetchServicos = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/servicos`);
        if (!res.ok) throw new Error('Falha ao carregar serviços');
        const data = await res.json();
        setServicos(data);
      } catch (err) {
        console.error(err);
        alert('Erro ao carregar serviços.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchServicos();
  }, []);

  // Handlers: Formulário
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState(dadosAntigos => ({
      ...dadosAntigos,
      [name]: value
    }));
  };

  const resetFormulario = () => {
    setFormState({ nome: '', preco: '' });
    setServicoEmEdicao(null);
  };

  // Handler: Submissão (Criar ou Editar)
  const handleSubmit = async (evento) => {
    evento.preventDefault();

    if (formState.nome.length < 3) {
      alert("O nome do serviço deve ter pelo menos 3 letras.");
      return;
    }

    const payload = {
      nome: formState.nome,
      preco: parseFloat(formState.preco) || 0
    };

    try {
      let url = `${API_URL}/servicos`;
      let method = 'POST';

      if (servicoEmEdicao) {
        url = `${API_URL}/servicos/${servicoEmEdicao.id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`Erro na operação: ${res.status}`);

      const servicoAtualizado = await res.json();

      if (servicoEmEdicao) {
        setServicos(listaAntiga => listaAntiga.map(s =>
          s.id === servicoEmEdicao.id ? servicoAtualizado : s
        ));
        alert('Serviço atualizado com sucesso!');
      } else {
        setServicos(listaAntiga => [...listaAntiga, servicoAtualizado]);
        alert('Serviço salvo com sucesso!');
      }

      resetFormulario();

    } catch (err) {
      console.error(err);
      alert('Erro ao salvar serviço. Verifique o console.');
    }
  };

  // Handlers: Ações
  const handleDelete = async (idDoServico) => {
    if (confirm("Atenção! Excluir um serviço pode afetar agendamentos existentes. Deseja continuar?")) {
      try {
        const res = await fetch(`${API_URL}/servicos/${idDoServico}`, { method: 'DELETE' });

        if (res.status === 400) {
          const err = await res.json();
          throw new Error(err.error);
        }
        if (!res.ok && res.status !== 204) throw new Error('Falha ao excluir');

        setServicos(listaAntiga => listaAntiga.filter(s => s.id !== idDoServico));
        alert('Serviço removido.');

      } catch (error) {
        console.error(error);
        alert(`Erro ao excluir: ${error.message}`);
      }
    }
  };

  const handleEditarClick = (servico) => {
    setServicoEmEdicao(servico);
    setFormState({
      nome: servico.nome,
      preco: servico.preco || ''
    });
    formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="agenda-secao" style={{ padding: '2rem 0' }}>
      <div className="conteiner">

        <div className="agenda-header">
          <h2>Gestão de Serviços</h2>
        </div>

        <div className="clientes-grid">

          {/* Coluna 1: Formulário */}
          <div id="novo-servico" className="form-coluna" ref={formRef}>
            <div className="dash-card">
              <h3>{servicoEmEdicao ? 'Editar Serviço' : 'Adicionar Novo Serviço'}</h3>

              <form id="form-servico" className="formulario-cliente" onSubmit={handleSubmit}>

                <div className="form-grupo">
                  <label htmlFor="nome">Nome do Serviço:</label>
                  <input type="text" id="nome" name="nome" required
                    value={formState.nome} onChange={handleFormChange} />
                </div>

                <div className="form-grupo">
                  <label htmlFor="preco">Preço (R$):</label>
                  <input type="number" id="preco" name="preco" min="0" step="0.01"
                    placeholder="Ex: 50.00"
                    value={formState.preco} onChange={handleFormChange} />
                </div>

                <button type="submit" className="botao-principal" style={{ border: 'none', cursor: 'pointer', width: '100%', marginTop: '1rem' }}>
                  {servicoEmEdicao ? 'Atualizar Serviço' : 'Salvar Serviço'}
                </button>

                {servicoEmEdicao && (
                  <button type="button" className="botao-secundario"
                    onClick={resetFormulario}
                    style={{ border: 'none', cursor: 'pointer', width: '100%', marginTop: '0.5rem' }}>
                    Cancelar Edição
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Coluna 2: Lista */}
          <div className="lista-coluna">
            <div className="dash-card">
              <h3 style={{ marginBottom: '1rem' }}>Serviços Cadastrados</h3>
              <div className="tabela-container">
                <table className="tabela-vacinas">
                  <thead>
                    <tr>
                      <th>Nome do Serviço</th>
                      <th>Preço (R$)</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr><td colSpan="3">Carregando serviços...</td></tr>
                    )}
                    {!isLoading && servicos.length === 0 && (
                      <tr><td colSpan="3">Nenhum serviço cadastrado.</td></tr>
                    )}
                    {!isLoading && servicos.map(servico => (
                      <tr key={servico.id}>
                        <td>{servico.nome}</td>
                        <td>{servico.preco ? servico.preco.toFixed(2) : '0.00'}</td>
                        <td>
                          <button
                            className="botao-tabela"
                            onClick={() => handleEditarClick(servico)}
                            style={{ marginRight: '5px' }}
                          >
                            ✎
                          </button>
                          <button
                            className="botao-tabela botao-excluir"
                            onClick={() => handleDelete(servico.id)}
                          >
                            &times;
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaginaServicos;