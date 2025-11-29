import React, { useState, useEffect, useMemo, useRef } from 'react';

const API_URL = 'http://localhost:8080';

// Função auxiliar para capitalizar nomes
const capitalizarNome = (nome) => {
  return nome
    .toLowerCase()
    .split(' ')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ');
};

function PaginaClientes() {

  // Estados
  const [pets, setPets] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [petEmEdicao, setPetEmEdicao] = useState(null);
  const formRef = useRef(null);

  const [formState, setFormState] = useState({
    nomeDono: '',
    telefone: '',
    email: '',
    nomePet: '',
    racaPet: '',
    idadePet: ''
  });

  // Efeito: Carregar dados iniciais
  useEffect(() => {
    const fetchPets = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/pets`);
        if (!res.ok) throw new Error('Falha ao carregar pets');
        const data = await res.json();
        setPets(data);
      } catch (err) {
        console.error(err);
        alert('Erro ao carregar pets. O seu back-end (Docker) está rodando?');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPets();
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
    setFormState({
      nomeDono: '', telefone: '', email: '',
      nomePet: '', racaPet: '', idadePet: ''
    });
    setPetEmEdicao(null);
  };

  // Handler: Submissão (Criar ou Editar)
  const handleSubmit = async (evento) => {
    evento.preventDefault();

    // Normalização
    const nomeDonoFormatado = capitalizarNome(formState.nomeDono.trim());
    const nomePetFormatado = capitalizarNome(formState.nomePet.trim());

    if (nomeDonoFormatado.length < 3) {
      alert("O nome do dono deve ter pelo menos 3 letras!");
      return;
    }

    // Validação de duplicados
    const duplicado = pets.find(pet =>
      pet.dono.toLowerCase() === nomeDonoFormatado.toLowerCase() &&
      pet.nome.toLowerCase() === nomePetFormatado.toLowerCase() &&
      (!petEmEdicao || pet.id !== petEmEdicao.id)
    );

    if (duplicado) {
      alert(`Erro: O dono(a) "${nomeDonoFormatado}" já tem um pet chamado "${nomePetFormatado}" cadastrado!`);
      return;
    }

    const payload = {
      nome: nomePetFormatado,
      raca: formState.racaPet || 'SRD',
      dono: nomeDonoFormatado,
      idade: formState.idadePet ? parseInt(formState.idadePet) : 0
    };

    try {
      let url = `${API_URL}/pets`;
      let method = 'POST';

      if (petEmEdicao) {
        url = `${API_URL}/pets/${petEmEdicao.id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`Erro na operação: ${res.status}`);

      const petAtualizado = await res.json();

      if (petEmEdicao) {
        setPets(listaAntiga => listaAntiga.map(pet =>
          pet.id === petEmEdicao.id ? petAtualizado : pet
        ));
        alert('Pet atualizado com sucesso!');
      } else {
        setPets(listaAntiga => [...listaAntiga, petAtualizado]);
        alert('Salvo com sucesso!');
      }

      resetFormulario();

    } catch (err) {
      console.error(err);
      alert('Erro ao salvar. Verifique o console.');
    }
  };

  // Handlers: Ações do Card
  const handleDelete = async (idDoPet) => {
    if (confirm("Tem certeza que deseja excluir este pet?")) {
      try {
        const res = await fetch(`${API_URL}/pets/${idDoPet}`, { method: 'DELETE' });
        if (res.ok) {
          alert("Pet removido!");
          setPets(pets.filter(pet => pet.id !== idDoPet));
        } else {
          alert("Erro ao deletar.");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleEditarClick = (pet) => {
    setPetEmEdicao(pet);
    setFormState({
      nomeDono: pet.dono,
      nomePet: pet.nome,
      racaPet: pet.raca || '',
      telefone: '',
      email: '',
      idadePet: ''
    });
    formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Lógica de Filtro e Agrupamento
  const listaDonosFiltrada = useMemo(() => {
    const donosAgrupados = pets.reduce((acc, pet) => {
      if (!acc[pet.dono]) {
        acc[pet.dono] = { nome: pet.dono, contato: "...", pets: [] };
      }
      acc[pet.dono].pets.push(pet);
      return acc;
    }, {});

    const listaDeDonos = Object.values(donosAgrupados);

    if (!termoBusca) return listaDeDonos;
    return listaDeDonos.filter(dono => {
      const texto = `${dono.nome} ${dono.pets.map(p => p.nome).join(' ')}`.toLowerCase();
      return texto.includes(termoBusca.toLowerCase());
    });

  }, [pets, termoBusca]);


  return (
    <div className="agenda-secao" style={{ padding: '2rem 0' }}>
      <div className="conteiner">
        <div className="agenda-header">
          <h2>Gestão de Clientes e Pets</h2>
        </div>
        <div className="clientes-grid">

          {/* Coluna 1: Formulário */}
          <div id="novo-cliente" className="form-coluna" ref={formRef}>
            <div className="dash-card">
              <h3>{petEmEdicao ? 'Editar Pet' : 'Adicionar Novo Cliente'}</h3>

              <form id="form-cliente" className="formulario-cliente" onSubmit={handleSubmit}>

                {/* Grupo Dono */}
                <div className="form-grupo">
                  <label htmlFor="nome-dono">Nome do Dono:</label>
                  <input type="text" id="nome-dono" name="nomeDono" required
                    value={formState.nomeDono} onChange={handleFormChange} />
                </div>
                <div className="form-grupo">
                  <label htmlFor="telefone-dono">Telefone:</label>
                  <input type="tel" id="telefone-dono" name="telefone" placeholder="(XX) XXXXX-XXXX"
                    value={formState.telefone} onChange={handleFormChange} />
                </div>
                <div className="form-grupo">
                  <label htmlFor="email-dono">Email (Opcional):</label>
                  <input type="email" id="email-dono" name="email"
                    value={formState.email} onChange={handleFormChange} />
                </div>

                <hr className="form-divisor" />

                {/* Grupo Pet */}
                <h4>{petEmEdicao ? `Editando: ${petEmEdicao.nome}` : 'Adicionar Pet'}</h4>
                <div className="form-grupo">
                  <label htmlFor="nome-pet-form">Nome do Pet:</label>
                  <input type="text" id="nome-pet-form" name="nomePet" required
                    value={formState.nomePet} onChange={handleFormChange} />
                </div>
                <div className="form-grupo-grid2">
                  <div className="form-grupo">
                    <label htmlFor="raca-pet">Raça:</label>
                    <input type="text" id="raca-pet" name="racaPet" placeholder="Ex: Golden"
                      value={formState.racaPet} onChange={handleFormChange} />
                  </div>
                  <div className="form-grupo">
                    <label htmlFor="idade-pet">Idade (anos):</label>
                    <input type="number" id="idade-pet" name="idadePet" min="0"
                      value={formState.idadePet} onChange={handleFormChange} />
                  </div>
                </div>

                <button type="submit" className="botao-principal" style={{ border: 'none', cursor: 'pointer', width: '100%', marginTop: '1rem' }}>
                  {petEmEdicao ? 'Atualizar Pet' : 'Salvar Cliente e Pet'}
                </button>

                {petEmEdicao && (
                  <button type="button" className="botao-secundario"
                    onClick={resetFormulario}
                    style={{ border: 'none', cursor: 'pointer', width: '100%', marginTop: '0.5rem' }}>
                    Cancelar Edição
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Coluna 2: Lista de Clientes */}
          <div className="lista-coluna">
            <input
              type="text" id="busca-cliente" className="filtro-cliente"
              placeholder="Buscar cliente por nome ou pet..."
              value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)}
            />

            <div id="lista-clientes-container" className="lista-clientes-scroll">

              {isLoading && <p>Carregando clientes...</p>}
              {!isLoading && listaDonosFiltrada.length === 0 && (
                <p style={{ textAlign: 'center', opacity: 0.7, marginTop: '1rem' }}>
                  {termoBusca ? 'Nenhum resultado encontrado.' : 'Nenhum cliente cadastrado.'}
                </p>
              )}

              {!isLoading && listaDonosFiltrada.map(dono => (
                <div className="cliente-card" key={dono.nome}>
                  <div className="cliente-info">
                    <h4>{dono.nome}</h4>
                  </div>
                  <div className="cliente-pets" style={{ flexGrow: 1, textAlign: 'right' }}>
                    {dono.pets.map(pet => (
                      <div className="pet-tag" key={pet.id} style={{ display: 'inline-block', margin: '2px', padding: '5px', background: '#eee', borderRadius: '5px' }}>
                        {pet.nome} <small>({pet.raca || 'SRD'})</small>

                        <span
                          onClick={() => handleEditarClick(pet)}
                          style={{ cursor: 'pointer', color: 'blue', marginLeft: '10px', fontWeight: 'bold' }}
                        >
                          ✎
                        </span>

                        <span
                          onClick={() => handleDelete(pet.id)}
                          style={{ cursor: 'pointer', color: 'red', marginLeft: '5px', fontWeight: 'bold' }}
                        >
                          &times;
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaginaClientes;