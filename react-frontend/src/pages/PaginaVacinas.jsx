import React, { useState, useEffect, useMemo, useRef } from 'react';
import imgVacina from '../assets/img-vacina-para-caes.png';

const API_URL = 'http://localhost:8080';

const formatarData = (dataString) => {
  if (!dataString) return '-';
  const data = new Date(dataString);
  const offset = data.getTimezoneOffset();
  const dataCorrigida = new Date(data.getTime() + (offset * 60000));
  return dataCorrigida.toISOString().split('T')[0];
};

const formatarDataTabela = (dataString) => {
  if (!dataString) return '-';
  return new Date(dataString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};


function PaginaVacinas() {

  // Estados
  const [pets, setPets] = useState([]);
  const [vacinas, setVacinas] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [vacinaEmEdicao, setVacinaEmEdicao] = useState(null);
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    petId: '',
    nomeVacina: '',
    dataAplicacao: '',
    proximaDose: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  // Efeito: Carregar dados
  useEffect(() => {
    const carregarTudo = async () => {
      setIsLoading(true);
      try {
        const [petsRes, vacinasRes] = await Promise.all([
          fetch(`${API_URL}/pets`, { cache: 'no-cache' }),
          fetch(`${API_URL}/vacinas`, { cache: 'no-cache' })
        ]);
        const petsData = petsRes.ok ? await petsRes.json() : [];
        const vacinasData = vacinasRes.ok ? await vacinasRes.json() : [];
        setPets(petsData);
        setVacinas(vacinasData);
      } catch (err) {
        console.warn('Erro ao carregar dados:', err);
      } finally {
        setIsLoading(false);
      }
    };
    carregarTudo();
  }, []);

  // Handlers: Formulário
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(dadosAntigos => ({
      ...dadosAntigos,
      [name]: value
    }));
  };

  const resetFormulario = () => {
    setFormData({ petId: '', nomeVacina: '', dataAplicacao: '', proximaDose: '' });
    setVacinaEmEdicao(null);
  };

  // Handler: Submissão (Criar ou Editar)
  const handleSubmit = async (evento) => {
    evento.preventDefault();

    if (!formData.petId) {
      alert('Por favor, selecione um pet antes de salvar.');
      return;
    }

    const payload = {
      petId: parseInt(formData.petId),
      nomeVacina: formData.nomeVacina,
      dataAplicacao: formData.dataAplicacao,
      proximaDose: formData.proximaDose || null
    };

    try {
      let url = `${API_URL}/vacinas`;
      let method = 'POST';

      if (vacinaEmEdicao) {
        url = `${API_URL}/vacinas/${vacinaEmEdicao.id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erro: ${res.status} ${text}`);
      }

      const vacinaAtualizada = await res.json();

      if (vacinaEmEdicao) {
        setVacinas(listaAntiga => listaAntiga.map(v =>
          v.id === vacinaEmEdicao.id ? vacinaAtualizada : v
        ));
        alert('Registro atualizado com sucesso!');
      } else {
        setVacinas(listaAntiga => [...listaAntiga, vacinaAtualizada]);
        alert('Registro salvo com sucesso.');
      }

      resetFormulario();

    } catch (err) {
      console.error(err);
      alert('Falha ao salvar. Veja o console para detalhes.');
    }
  };

  // Handlers: Ações
  const handleDelete = async (idDaVacina) => {
    if (!confirm('Deseja excluir este registro de vacina?')) return;
    try {
      const res = await fetch(`${API_URL}/vacinas/${idDaVacina}`, { method: 'DELETE' });
      if (res.ok) {
        setVacinas(listaAntiga => listaAntiga.filter(v => v.id !== idDaVacina));
        alert('Registro excluído.');
      } else {
        alert('Erro ao excluir.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditarClick = (vacina) => {
    setVacinaEmEdicao(vacina);

    setFormData({
      petId: vacina.petId,
      nomeVacina: vacina.nomeVacina,
      dataAplicacao: formatarData(vacina.dataAplicacao),
      proximaDose: formatarData(vacina.proximaDose)
    });

    formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Filtro
  const vacinasFiltradas = useMemo(() => {
    return vacinas.filter(vacina =>
      vacina.petNome.toLowerCase().includes(termoBusca.toLowerCase())
    );
  }, [vacinas, termoBusca]);


  return (
    <div className="agenda-secao" style={{ padding: '2rem 0' }}>
      <div className="conteiner">

        <div className="agenda-header">
          <h2>Controle de Vacinas</h2>
          <a href="#novo-registro" className="botao-principal">Adicionar Registro</a>
        </div>
        <div className="filtro-container">
          <input
            type="text" id="busca-pet" placeholder="Buscar por nome do pet..."
            value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)}
          />
        </div>

        {/* Tabela */}
        <div className="tabela-container">
          <table className="tabela-vacinas">
            <thead>
              <tr>
                <th>Pet</th>
                <th>Vacina</th>
                <th>Data Aplicação</th>
                <th>Próxima Dose</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody id="tabela-corpo">

              {isLoading && (<tr><td colSpan="5">Carregando registros...</td></tr>)}
              {!isLoading && vacinasFiltradas.length === 0 && (
                <tr><td colSpan="5">
                  {termoBusca ? 'Nenhum resultado encontrado.' : 'Nenhum registro de vacina.'}
                </td></tr>
              )}

              {!isLoading && vacinasFiltradas.map(vacina => (
                <tr key={vacina.id}>
                  <td>{vacina.petNome}</td>
                  <td>{vacina.nomeVacina}</td>
                  <td>{formatarDataTabela(vacina.dataAplicacao)}</td>
                  <td>{formatarDataTabela(vacina.proximaDose)}</td>
                  <td>
                    <button
                      className="botao-tabela"
                      onClick={() => handleEditarClick(vacina)}
                      style={{ marginRight: '5px' }}
                    >
                      ✎
                    </button>
                    <button
                      className="botao-tabela botao-excluir"
                      onClick={() => handleDelete(vacina.id)}
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Formulário */}
        <section id="novo-registro" className="sobre-nos-secao" ref={formRef} style={{ marginTop: '3rem', background: 'var(--cor-laranja-claro)' }}>
          <div className="sobre-nos-grid">
            <div className="sobre-nos-imagem">
              <img src={imgVacina} alt="Vacinação de pet" />
            </div>
            <div className="sobre-nos-texto">
              <h2>{vacinaEmEdicao ? 'Editar Registro' : 'Adicionar Novo Registro'}</h2>

              <form id="form-vacina" className="formulario-agenda" onSubmit={handleSubmit}>

                <div className="form-grupo">
                  <label htmlFor="pet-select-vacina">Pet:</label>
                  <select
                    id="pet-select-vacina" name="petId" required
                    value={formData.petId}
                    onChange={handleFormChange}
                    disabled={!!vacinaEmEdicao}
                  >
                    <option value="" disabled>Selecione um pet...</option>
                    {pets.map(pet => (
                      <option key={pet.id} value={pet.id}>
                        {pet.nome} - (Dono: {pet.dono})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-grupo">
                  <label htmlFor="nome-vacina">Nome da Vacina:</label>
                  <input
                    type="text" id="nome-vacina" name="nomeVacina" required
                    value={formData.nomeVacina}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-grupo">
                  <label htmlFor="data-aplicacao">Data da Aplicação:</label>
                  <input
                    type="date" id="data-aplicacao" name="dataAplicacao" required
                    value={formData.dataAplicacao}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-grupo">
                  <label htmlFor="proxima-dose">Próxima Dose (Opcional):</label>
                  <input
                    type="date" id="proxima-dose" name="proximaDose"
                    value={formData.proximaDose}
                    onChange={handleFormChange}
                  />
                </div>

                <button type="submit" className="botao-principal" style={{ border: 'none', cursor: 'pointer', background: 'var(--cor-laranja)' }}>
                  {vacinaEmEdicao ? 'Atualizar Registro' : 'Salvar Registro'}
                </button>

                {vacinaEmEdicao && (
                  <button type="button" className="botao-secundario"
                    onClick={resetFormulario}
                    style={{ border: 'none', cursor: 'pointer', width: '100%', marginTop: '0.5rem' }}>
                    Cancelar Edição
                  </button>
                )}
              </form>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default PaginaVacinas;