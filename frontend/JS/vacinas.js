// --- [ 1. CONFIGURAÇÃO INICIAL ] ---
document.addEventListener('DOMContentLoaded', () => {

    const inputBusca = document.getElementById('busca-pet');
    const tabelaCorpo = document.getElementById('tabela-corpo');
    const form = document.getElementById('form-vacina');
    let petsCache = [];

    // --- [ 2. CARREGAR PETS NO DROPDOWN ] ---
    async function carregarPets() {
        try {
            // A CORREÇÃO (CACHE): Força o JS a buscar uma lista nova
            const res = await fetch('http://localhost:3000/pets', {
                cache: 'no-cache' 
            });
            
            petsCache = res.ok ? await res.json() : [];
            const petSelect = document.getElementById('pet-select-vacina');
            petSelect.innerHTML = '<option value="" disabled selected>Selecione um pet...</option>';
            petsCache.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = `${p.nome} - (Dono: ${p.dono})`; 
                petSelect.appendChild(opt);
            });
        } catch (err) {
            console.warn('Erro ao carregar pets no formulário:', err);
        }
    }

    // --- [ 3. FUNCIONALIDADE: FILTRO DA TABELA ] ---
    inputBusca.addEventListener('keyup', () => {
        const termoBusca = inputBusca.value.toLowerCase();
        const linhasTabela = tabelaCorpo.getElementsByTagName('tr');

        for (let i = 0; i < linhasTabela.length; i++) {
            const linha = linhasTabela[i];
            const nomePet = linha.getElementsByTagName('td')[0].textContent.toLowerCase();
            if (nomePet.includes(termoBusca)) {
                linha.style.display = "";
            } else {
                linha.style.display = "none";
            }
        }
    });

    // --- [ 4. FUNCIONALIDADE: CARREGAR VACINAS NA TABELA ] ---
    async function carregarVacinas() {
        try {
            // A CORREÇÃO (CACHE): Força o JS a buscar uma lista nova
            const res = await fetch('http://localhost:3000/vacinas', {
                 cache: 'no-cache' 
            });
            
            const list = res.ok ? await res.json() : [];
            tabelaCorpo.innerHTML = '';
            
            list.forEach(v => {
                const row = tabelaCorpo.insertRow();
                const dataAplicacao = new Date(v.dataAplicacao).toLocaleDateString('pt-BR', {timeZone: 'UTC'});
                const proximaDose = v.proximaDose 
                    ? new Date(v.proximaDose).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) 
                    : '-';

                row.innerHTML = `
                    <td>${v.petNome}</td>
                    <td>${v.nomeVacina}</td>
                    <td>${dataAplicacao}</td>
                    <td>${proximaDose}</td>
                    <td><button class="botao-tabela botao-excluir" data-id="${v.id}">Excluir</button></td>
                `;
            });

            Array.from(document.getElementsByClassName('botao-excluir')).forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = btn.dataset.id;
                    if (!confirm('Deseja excluir este registro de vacina?')) return;
                    try {
                        const del = await fetch(`http://localhost:3000/vacinas/${id}`, { method: 'DELETE' });
                        if (!del.ok) throw new Error('Falha ao excluir');
                        await carregarVacinas(); // Recarrega a lista
                    } catch (err) {
                        console.error(err);
                        alert('Erro ao excluir. Veja o console para mais detalhes.');
                    }
                });
            });
        } catch (err) {
            console.error('Erro ao carregar vacinas:', err);
        }
    }

    // --- [ 5. FUNCIONALIDADE: ENVIO DO FORMULÁRIO ] ---
    form.addEventListener('submit', async (evento) => {
        evento.preventDefault(); 
        const dadosDoForm = new FormData(form);
        const dados = Object.fromEntries(dadosDoForm.entries());

        if (!dados.pet_id) {
            alert('Por favor, selecione um pet antes de salvar.');
            return;
        }

        const payload = {
            petId: parseInt(dados.pet_id), 
            nomeVacina: dados.nome_vacina,
            dataAplicacao: dados.data_aplicacao,
            proximaDose: dados.proxima_dose || null
        };
        
        try {
            const res = await fetch('http://localhost:3000/vacinas', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Erro: ${res.status} ${text}`);
            }
            
            // Sucesso!
            await carregarVacinas(); // Recarrega a tabela (agora sem cache)
            form.reset();
            alert('Registro salvo com sucesso.');
            inputBusca.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (err) {
            console.error(err);
            alert('Falha ao salvar. Veja o console para detalhes.');
        }
    });

    // --- [ 6. INICIALIZAÇÃO ] ---
    carregarPets();
    carregarVacinas();

});