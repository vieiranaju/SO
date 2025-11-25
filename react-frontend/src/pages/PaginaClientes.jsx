// NOVO: Importe 'useRef' para ajudar a rolar a tela
import React, { useState, useEffect, useMemo, useRef } from 'react';

const API_URL = 'http://localhost:8080';

// Função para transformar "ana silva" em "Ana Silva"
const capitalizarNome = (nome) => {
  return nome
    .toLowerCase()
    .split(' ')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ');
};

function PaginaClientes() {
  
  // --- [ ESTADOS ] ---
  const [pets, setPets] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // NOVO: Estado para guardar o pet que estamos a editar
  const [petEmEdicao, setPetEmEdicao] = useState(null); 
  
  // NOVO: Referência ao topo do formulário (para rolar a tela)
  const formRef = useRef(null); 

  const [formState, setFormState] = useState({
    nomeDono: '',
    telefone: '',
    email: '',
    nomePet: '',
    racaPet: '',
    idadePet: ''
  });

  // --- [ EFEITO (Fetch Inicial) ] ---
  useEffect(() => {
    const fetchPets = async () => {
      // (O seu 'useEffect' de carregar os pets continua igual...)
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

  // --- [ HANDLERS (Formulário) ] ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState(dadosAntigos => ({
      ...dadosAntigos,
      [name]: value
    }));
  };
  
  // NOVO: Função para limpar o formulário e sair do modo de edição
  const resetFormulario = () => {
    setFormState({
      nomeDono: '', telefone: '', email: '',
      nomePet: '', racaPet: '', idadePet: ''
    });
    setPetEmEdicao(null); // Sai do modo de edição
  };

  // --- [ HANDLER DE SUBMISSÃO (Agora com Lógica de EDITAR) ] ---
  // ... dentro de PaginaClientes.jsx ...

  const handleSubmit = async (evento) => {
    evento.preventDefault(); 

    // 1. NORMALIZAÇÃO: "ana" vira "Ana", "tOzÓ" vira "Tozó"
    const nomeDonoFormatado = capitalizarNome(formState.nomeDono.trim());
    const nomePetFormatado = capitalizarNome(formState.nomePet.trim());

    if (nomeDonoFormatado.length < 3) {
      alert("O nome do dono deve ter pelo menos 3 letras!");
      return; 
    }
    
    // 2. VALIDAÇÃO DE DUPLICADOS (Lógica no Front-end)
    // Procuramos se JÁ EXISTE um pet com este nome para este dono
    // (Ignoramos se estivermos a editar o PRÓPRIO pet)
    const duplicado = pets.find(pet => 
      pet.dono.toLowerCase() === nomeDonoFormatado.toLowerCase() && 
      pet.nome.toLowerCase() === nomePetFormatado.toLowerCase() &&
      (!petEmEdicao || pet.id !== petEmEdicao.id) // Ignora se for o mesmo ID (edição)
    );

    if (duplicado) {
      alert(`Erro: O dono(a) "${nomeDonoFormatado}" já tem um pet chamado "${nomePetFormatado}" cadastrado!`);
      return; // Para tudo, não salva.
    }

    const payload = {
      nome: nomePetFormatado, // Enviamos o nome bonitinho
      raca: formState.racaPet || 'SRD',
      dono: nomeDonoFormatado, // Enviamos o dono bonitinho
    };

    // NOVO: Lógica de Edição (PUT) vs. Criação (POST)
    try {
      let url = `${API_URL}/pets`;
      let method = 'POST';
      
      // Se estamos a editar, mude a URL e o Método
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
      
      // Magia do React: Atualiza a lista na tela
      if (petEmEdicao) {
        // Se editou, substitua o item antigo pelo novo
        setPets(listaAntiga => listaAntiga.map(pet => 
          pet.id === petEmEdicao.id ? petAtualizado : pet
        ));
        alert('Pet atualizado com sucesso!');
      } else {
        // Se criou, adicione o novo item
        setPets(listaAntiga => [...listaAntiga, petAtualizado]); 
        alert('Salvo com sucesso!');
      }
      
      resetFormulario(); // Limpa o formulário e sai do modo de edição

    } catch (err) {
      console.error(err);
      alert('Erro ao salvar. Verifique o console.');
    }
  };

  // --- [ HANDLERS (Ações do Card) ] ---
  
  // (O seu 'handleDelete' continua igual)
  const handleDelete = async (idDoPet) => {
    if (confirm("Tem certeza que deseja excluir este pet?")) {
      try {
        // ... (lógica de delete igual) ...
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
  
  // NOVO: Função para preencher o formulário para edição
  const handleEditarClick = (pet) => {
    // 1. Coloca o pet no estado de "edição"
    setPetEmEdicao(pet);
    
    // 2. Preenche o formulário com os dados do pet
    setFormState({
      nomeDono: pet.dono,
      nomePet: pet.nome,
      racaPet: pet.raca || '',
      telefone: '', // O seu GET /pets não retorna estes campos
      email: '',    // Então eles ficam vazios
      idadePet: ''
    });
    
    // 3. Rola a tela até o formulário
    formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // --- [ LÓGICA DE FILTRO E AGRUPAMENTO (igual) ] ---
  const listaDonosFiltrada = useMemo(() => {
    // (A sua lógica de 'useMemo' para agrupar e filtrar continua igual)
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
  
  
  // 8. O JSX (O seu "HTML" com dados reais)
  return (
    <div className="agenda-secao" style={{ padding: '2rem 0' }}>
      <div className="conteiner">
        <div className="agenda-header">
          <h2>Gestão de Clientes e Pets</h2>
        </div>
        <div className="clientes-grid">

          {/* ===== [COLUNA 1: FORMULÁRIO "CONTROLADO"] ===== */}
          {/* NOVO: 'ref' para podermos rolar a tela até ele */}
          <div id="novo-cliente" className="form-coluna" ref={formRef}> 
            <div className="dash-card">
              {/* NOVO: Título dinâmico */}
              <h3>{petEmEdicao ? 'Editar Pet' : 'Adicionar Novo Cliente'}</h3>
              
              <form id="form-cliente" className="formulario-cliente" onSubmit={handleSubmit}>
                
                {/* --- [Grupo Dono] --- */}
                <div className="form-grupo">
                  <label htmlFor="nome-dono">Nome do Dono:</label>
                  <input type="text" id="nome-dono" name="nomeDono" required 
                         value={formState.nomeDono} onChange={handleFormChange} />
                </div>
                {/* (Inputs de Telefone e Email - continuam iguais) */}
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
                
                {/* --- [Grupo Pet] --- */}
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
                
                {/* NOVO: Botão dinâmico */}
                <button type="submit" className="botao-principal" style={{ border: 'none', cursor: 'pointer', width: '100%', marginTop: '1rem' }}>
                  {petEmEdicao ? 'Atualizar Pet' : 'Salvar Cliente e Pet'}
                </button>
                
                {/* NOVO: Botão de Cancelar Edição (só aparece se estiver editando) */}
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

          {/* ===== [COLUNA 2: LISTA "DINÂMICA"] ===== */}
          <div className="lista-coluna">
            <input 
              type="text" id="busca-cliente" className="filtro-cliente" 
              placeholder="Buscar cliente por nome ou pet..."
              value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)}
            />
            
            <div id="lista-clientes-container" className="lista-clientes-scroll">
              
              {/* (Lógica de 'isLoading' e 'lista vazia' continua igual) */}
              {isLoading && <p>Carregando clientes...</p>}
              {!isLoading && listaDonosFiltrada.length === 0 && (
                <p style={{ textAlign: 'center', opacity: 0.7, marginTop: '1rem' }}>
                  {termoBusca ? 'Nenhum resultado encontrado.' : 'Nenhum cliente cadastrado.'}
                </p>
              )}

              {/* O "Loop" do React (.map) que desenha os cards REAIS */}
              {!isLoading && listaDonosFiltrada.map(dono => (
                <div className="cliente-card" key={dono.nome}>
                  <div className="cliente-info">
                    <h4>{dono.nome}</h4>
                    {/* ... (info de contato) ... */}
                  </div>
                  <div className="cliente-pets" style={{ flexGrow: 1, textAlign: 'right' }}>
                    {dono.pets.map(pet => (
                      <div className="pet-tag" key={pet.id} style={{ display: 'inline-block', margin: '2px', padding: '5px', background: '#eee', borderRadius: '5px' }}>
                        {pet.nome} <small>({pet.raca || 'SRD'})</small>
                        
                        {/* NOVO: Botão de Editar */}
                        <span 
                          onClick={() => handleEditarClick(pet)}
                          style={{ cursor: 'pointer', color: 'blue', marginLeft: '10px', fontWeight: 'bold' }}
                        >
                          ✎
                        </span>
                        
                        {/* Botão de Excluir (continua igual) */}
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