// NOVO: Importe 'useRef' para rolar a tela
import React, { useState, useEffect, useMemo, useRef } from 'react';
import imgVacina from '../assets/img-vacina-para-caes.png';

const API_URL = 'http://localhost:8080';

const formatarData = (dataString) => {
  if (!dataString) return '-';
  // Formata a data para YYYY-MM-DD (para preencher o <input type="date">)
  const data = new Date(dataString);
  const offset = data.getTimezoneOffset();
  const dataCorrigida = new Date(data.getTime() + (offset * 60000));
  return dataCorrigida.toISOString().split('T')[0];
};

// NOVO: Função para formatar para a Tabela (diferente do input)
const formatarDataTabela = (dataString) => {
  if (!dataString) return '-';
  return new Date(dataString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};


function PaginaVacinas() {
  
  // --- [ ESTADOS ] ---
  const [pets, setPets] = useState([]);
  const [vacinas, setVacinas] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  
  // NOVO: Estado para guardar a vacina que estamos a editar
  const [vacinaEmEdicao, setVacinaEmEdicao] = useState(null);
  
  // NOVO: Referência ao formulário (para rolar a tela)
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    petId: '',
    nomeVacina: '',
    dataAplicacao: '',
    proximaDose: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  // --- [ EFEITO (Fetch Inicial) ] ---
  useEffect(() => {
    // (A sua lógica de 'carregarTudo' continua igual)
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

  // --- [ HANDLER (Formulário) ] ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(dadosAntigos => ({
      ...dadosAntigos,
      [name]: value
    }));
  };
  
  // NOVO: Função para limpar o formulário e sair da edição
  const resetFormulario = () => {
    setFormData({ petId: '', nomeVacina: '', dataAplicacao: '', proximaDose: '' });
    setVacinaEmEdicao(null);
  };

  // --- [ HANDLER DE SUBMISSÃO (Agora com Lógica de EDITAR) ] ---
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
    
    // NOVO: Lógica de Edição (PUT) vs. Criação (POST)
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
        // Se editou, substitua o item antigo pelo novo
        setVacinas(listaAntiga => listaAntiga.map(v => 
          v.id === vacinaEmEdicao.id ? vacinaAtualizada : v
        ));
        alert('Registro atualizado com sucesso!');
      } else {
        // Se criou, adicione o novo item
        setVacinas(listaAntiga => [...listaAntiga, vacinaAtualizada]);
        alert('Registro salvo com sucesso.');
      }
      
      resetFormulario(); // Limpa o formulário e sai da edição

    } catch (err) {
      console.error(err);
      alert('Falha ao salvar. Veja o console para detalhes.');
    }
  };

  // --- [ HANDLERS (Ações da Tabela) ] ---
  
  // (O seu 'handleDelete' continua igual)
  const handleDelete = async (idDaVacina) => {
    if (!confirm('Deseja excluir este registro de vacina?')) return;
    try {
      // ... (lógica de delete igual) ...
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
  
  // NOVO: Função para preencher o formulário para edição
  const handleEditarClick = (vacina) => {
    setVacinaEmEdicao(vacina);
    
    // Preenche o formulário com os dados da vacina
    setFormData({
      petId: vacina.petId,
      nomeVacina: vacina.nomeVacina,
      // 'formatarData' converte a data ISO (com 'T') para 'YYYY-MM-DD'
      dataAplicacao: formatarData(vacina.dataAplicacao),
      proximaDose: formatarData(vacina.proximaDose)
    });
    
    // Rola a tela até o formulário
    formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // --- [ LÓGICA DE FILTRO (igual) ] ---
  const vacinasFiltradas = useMemo(() => {
    // (A sua lógica de 'useMemo' para filtrar a tabela continua igual)
    return vacinas.filter(vacina => 
      vacina.petNome.toLowerCase().includes(termoBusca.toLowerCase())
    );
  }, [vacinas, termoBusca]); 


  // 7. O JSX (O seu "HTML" Renderizado)
  return (
    <div className="agenda-secao" style={{ padding: '2rem 0' }}>
      <div className="conteiner">

        {/* ... (Cabeçalho e Filtro - continuam iguais) ... */}
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

        {/* ----- [TABELA "DINÂMICA"] ----- */}
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
              
              {/* (Lógica de 'isLoading' e 'lista vazia' continua igual) */}
              {isLoading && ( <tr><td colSpan="5">Carregando registros...</td></tr> )}
              {!isLoading && vacinasFiltradas.length === 0 && (
                <tr><td colSpan="5">
                  {termoBusca ? 'Nenhum resultado encontrado.' : 'Nenhum registro de vacina.'}
                </td></tr>
              )}
              
              {/* O "Loop" do React (.map) */}
              {!isLoading && vacinasFiltradas.map(vacina => (
                <tr key={vacina.id}>
                  <td>{vacina.petNome}</td>
                  <td>{vacina.nomeVacina}</td>
                  {/* NOVO: Usa a formatação correta para a tabela */}
                  <td>{formatarDataTabela(vacina.dataAplicacao)}</td>
                  <td>{formatarDataTabela(vacina.proximaDose)}</td>
                  <td>
                    {/* NOVO: Botão de Editar */}
                    <button 
                      className="botao-tabela" // (Deixei genérico, adicione 'botao-editar' no CSS se quiser)
                      onClick={() => handleEditarClick(vacina)}
                      style={{ marginRight: '5px' }}
                    >
                      ✎
                    </button>
                    {/* Botão de Excluir (continua igual) */}
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

        {/* ----- [SECÇÃO DO FORMULÁRIO "CONTROLADO"] ----- */}
        {/* NOVO: 'ref' para podermos rolar a tela */}
        <section id="novo-registro" className="sobre-nos-secao" ref={formRef} style={{ marginTop: '3rem', background: 'var(--cor-laranja-claro)' }}>
          <div className="sobre-nos-grid">
            <div className="sobre-nos-imagem">
              <img src={imgVacina} alt="Vacinação de pet" />
            </div>
            <div className="sobre-nos-texto">
              {/* NOVO: Título dinâmico */}
              <h2>{vacinaEmEdicao ? 'Editar Registro' : 'Adicionar Novo Registro'}</h2>
              
              <form id="form-vacina" className="formulario-agenda" onSubmit={handleSubmit}>
                
                <div className="form-grupo">
                  <label htmlFor="pet-select-vacina">Pet:</label>
                  {/* NOVO: Desabilitado durante a edição (não mudamos o pet de uma vacina) */}
                  <select 
                    id="pet-select-vacina" name="petId" required
                    value={formData.petId}
                    onChange={handleFormChange}
                    disabled={!!vacinaEmEdicao} // Converte 'vacinaEmEdicao' para true/false
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
                
                {/* NOVO: Botão dinâmico */}
                <button type="submit" className="botao-principal" style={{ border: 'none', cursor: 'pointer', background: 'var(--cor-laranja)' }}>
                  {vacinaEmEdicao ? 'Atualizar Registro' : 'Salvar Registro'}
                </button>
                
                {/* NOVO: Botão de Cancelar Edição */}
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