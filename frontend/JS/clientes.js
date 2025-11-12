// --- [ 1. CONFIGURAÇÃO INICIAL ] ---
document.addEventListener('DOMContentLoaded', () => {

    // Seleciona os elementos do DOM
    const inputBusca = document.getElementById('busca-cliente');
    const containerLista = document.getElementById('lista-clientes-container');
    const clientesCard = containerLista.getElementsByClassName('cliente-card');
    const form = document.getElementById('form-cliente');

    // --- [ 2. FUNCIONALIDADE: FILTRO DA LISTA ] ---
    inputBusca.addEventListener('keyup', () => {
        const termoBusca = inputBusca.value.toLowerCase();

        // Itera sobre todos os "cards" de cliente
        for (let i = 0; i < clientesCard.length; i++) {
            const card = clientesCard[i];
            
            // Pega o texto do card (nome, telefone, pets)
            const textoCard = card.textContent.toLowerCase();

            // Compara o texto com o termo de busca
            if (textoCard.includes(termoBusca)) {
                card.style.display = ""; // Mostra o card
            } else {
                card.style.display = "none"; // Esconde o card
            }
        }
    });


    // --- [ 3. FUNCIONALIDADE: ENVIO DO FORMULÁRIO (INTEGRAÇÃO COM BACKEND) ] ---
    form.addEventListener('submit', async (evento) => {
        evento.preventDefault(); // Impede o recarregamento da página

        // Pega os dados do formulário
        const dadosDoForm = new FormData(form);
        const dados = Object.fromEntries(dadosDoForm.entries());

        // Monta payload para o endpoint /pets (backend espera { nome, raca, dono })
        const payload = {
            nome: dados.nome_pet,
            raca: dados.raca_pet || null,
            dono: dados.nome_dono
        };

        try {
            const res = await fetch('http://localhost:3000/pets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error(`Erro ao salvar pet: ${res.status}`);

            const pet = await res.json();

            // Adiciona o novo card no topo da lista usando os dados retornados
            const novoCard = document.createElement('div');
            novoCard.className = 'cliente-card';
            novoCard.innerHTML = `
                <div class="cliente-info">
                    <h4>${dados.nome_dono}</h4>
                    <p>${dados.telefone_dono}</p>
                </div>
                <div class="cliente-pets">
                    <span>Pets:</span>
                    <span class="pet-tag">${pet.nome} (${pet.raca || 'SRD'})</span>
                </div>
            `;
            containerLista.prepend(novoCard);

            form.reset();
            alert('Cliente e pet salvos com sucesso.');
        } catch (err) {
            console.error(err);
            alert('Falha ao salvar. Veja o console para detalhes.');
        }
    });

    // --- [ 4. CARREGA LISTA DE PETS DO BACKEND ] ---
    async function carregarPets() {
        try {
            const res = await fetch('http://localhost:3000/pets');
            if (!res.ok) throw new Error('Falha ao carregar pets');
            const pets = await res.json();

            // Limpa lista existente
            containerLista.innerHTML = '';

            // Agrupa por dono para exibir como clientes
            const donos = {};
            pets.forEach(p => {
                if (!donos[p.dono]) donos[p.dono] = [];
                donos[p.dono].push(p);
            });

            for (const dono in donos) {
                const card = document.createElement('div');
                card.className = 'cliente-card';
                const petsHtml = donos[dono].map(p => `<span class="pet-tag">${p.nome} (${p.raca || 'SRD'})</span>`).join(' ');
                card.innerHTML = `
                    <div class="cliente-info">
                        <h4>${dono}</h4>
                        <p>—</p>
                    </div>
                    <div class="cliente-pets">
                        <span>Pets:</span>
                        ${petsHtml}
                    </div>
                `;
                containerLista.appendChild(card);
            }
        } catch (err) {
            console.error('Erro ao carregar pets:', err);
        }
    }

    // Carrega a lista ao iniciar a página
    carregarPets();
});