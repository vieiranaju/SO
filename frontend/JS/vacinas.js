// --- [ 1. CONFIGURAÇÃO INICIAL ] ---
document.addEventListener('DOMContentLoaded', () => {

    // Seleciona os elementos do DOM
    const inputBusca = document.getElementById('busca-pet');
    const tabelaCorpo = document.getElementById('tabela-corpo');
    const linhasTabela = tabelaCorpo.getElementsByTagName('tr');
    const form = document.getElementById('form-vacina');

    // --- [ 2. FUNCIONALIDADE: FILTRO DA TABELA ] ---
    inputBusca.addEventListener('keyup', () => {
        const termoBusca = inputBusca.value.toLowerCase();

        // Itera sobre todas as linhas da tabela
        for (let i = 0; i < linhasTabela.length; i++) {
            const linha = linhasTabela[i];
            
            // Pega o texto da primeira célula (Nome do Pet)
            const nomePet = linha.getElementsByTagName('td')[0].textContent.toLowerCase();

            // Compara o nome do pet com o termo de busca
            if (nomePet.includes(termoBusca)) {
                linha.style.display = ""; // Mostra a linha
            } else {
                linha.style.display = "none"; // Esconde a linha
            }
        }
    });


    // --- [ 3. FUNCIONALIDADE: ENVIO DO FORMULÁRIO (INTEGRAÇÃO) ] ---
    async function carregarVacinas() {
        try {
            const res = await fetch('http://localhost:3000/vacinas');
            const list = res.ok ? await res.json() : [];
            // limpa tabela
            tabelaCorpo.innerHTML = '';
            list.forEach(v => {
                const row = tabelaCorpo.insertRow();
                row.innerHTML = `
                    <td>${v.petNome}</td>
                    <td>${v.nomeVacina}</td>
                    <td>${new Date(v.dataAplicacao).toLocaleDateString('pt-BR')}</td>
                    <td>${v.proximaDose ? new Date(v.proximaDose).toLocaleDateString('pt-BR') : '-'}</td>
                    <td><button class="botao-tabela botao-excluir" data-id="${v.id}">Excluir</button></td>
                `;
            });

            // adiciona listeners nos botões de excluir
            Array.from(document.getElementsByClassName('botao-excluir')).forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = btn.dataset.id;
                    if (!confirm('Deseja excluir este registro de vacina?')) return;
                    try {
                        const del = await fetch(`http://localhost:3000/vacinas/${id}`, { method: 'DELETE' });
                        if (!del.ok) throw new Error('Falha ao excluir');
                        await carregarVacinas();
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

    form.addEventListener('submit', async (evento) => {
        evento.preventDefault(); // Impede o recarregamento da página

        // Pega os dados do formulário
        const dadosDoForm = new FormData(form);
        const dados = Object.fromEntries(dadosDoForm.entries());

        // Monta payload para /vacinas
        const payload = {
            petNome: dados.nome_pet,
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
            await carregarVacinas();
            form.reset();
            alert('Registro salvo com sucesso.');
            inputBusca.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (err) {
            console.error(err);
            alert('Falha ao salvar. Veja o console para detalhes.');
        }
    });

    // carrega inicialmente
    carregarVacinas();

});