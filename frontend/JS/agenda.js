// --- [ 1. CONFIGURAÇÃO INICIAL ] ---
document.addEventListener('DOMContentLoaded', () => {
    // Seleciona os elementos do DOM que vamos usar
    const mesAnoElemento = document.getElementById('mes-ano-atual');
    const diasGridElemento = document.querySelector('.calendario-dias');
    const mesAnteriorBtn = document.getElementById('mes-anterior');
    const proximoMesBtn = document.getElementById('proximo-mes');
    const horariosTitulo = document.getElementById('horarios-titulo');
    const horariosLista = document.getElementById('horarios-lista');
    
    // Seleciona os campos do formulário
    const form = document.getElementById('form-agendamento');
    const formInputData = document.getElementById('data');
    const formInputHora = document.getElementById('hora');

    // Guarda a data de hoje
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zera o tempo para comparações

    // Guarda a data que está sendo exibida no calendário
    let dataAtual = new Date();

    // Nomes dos meses (para exibir no título)
    const nomeDosMeses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    // --- [ 2. FUNÇÃO PRINCIPAL: RENDERIZAR O CALENDÁRIO ] ---
    function renderizarCalendario() {
        // Zera o tempo da data atual para evitar bugs de fuso horário
        dataAtual.setDate(1); // Sempre começa do dia 1

        const mes = dataAtual.getMonth();
        const ano = dataAtual.getFullYear();

        // Define o título (ex: "Novembro 2025")
        mesAnoElemento.textContent = `${nomeDosMeses[mes]} ${ano}`;

        // Limpa os dias do calendário anterior
        // (Mantém os 7 primeiros elementos, que são os dias da semana)
        while (diasGridElemento.children.length > 7) {
            diasGridElemento.removeChild(diasGridElemento.lastChild);
        }

        // Lógica para encontrar o primeiro dia da semana (Dom=0, Seg=1...)
        const primeiroDiaDoMes = new Date(ano, mes, 1).getDay();
        // Lógica para encontrar o último dia do mês
        const ultimoDiaDoMes = new Date(ano, mes + 1, 0).getDate();

        // 1. Preenche os dias do mês anterior (para completar o grid)
        const ultimoDiaMesAnterior = new Date(ano, mes, 0).getDate();
        for (let i = primeiroDiaDoMes; i > 0; i--) {
            const diaElemento = document.createElement('div');
            diaElemento.classList.add('dia-calendario', 'outro-mes');
            diaElemento.textContent = ultimoDiaMesAnterior - i + 1;
            diasGridElemento.appendChild(diaElemento);
        }

        // 2. Preenche os dias do mês atual
        for (let i = 1; i <= ultimoDiaDoMes; i++) {
            const diaElemento = document.createElement('div');
            diaElemento.classList.add('dia-calendario');
            diaElemento.textContent = i;
            
            const dataCompleta = new Date(ano, mes, i);

            // Marca o dia de hoje
            if (dataCompleta.getTime() === hoje.getTime()) {
                diaElemento.classList.add('hoje');
            }

            // Simula dias com eventos (para o back-end preencher)
            if (i === 13 || i === 18 || i === 28) {
                diaElemento.classList.add('com-evento');
            }
            
            // Adiciona o evento de clique em cada dia
            diaElemento.addEventListener('click', () => {
                // Remove o 'selecionado' de qualquer outro dia
                const diaAtivo = document.querySelector('.dia-calendario.selecionado');
                if (diaAtivo) {
                    diaAtivo.classList.remove('selecionado');
                }
                // Adiciona 'selecionado' ao dia clicado
                diaElemento.classList.add('selecionado');

                // Atualiza a lista de horários
                atualizarHorarios(dataCompleta);
            });

            diasGridElemento.appendChild(diaElemento);
        }
        
        // 3. (Opcional) Preenche os dias do próximo mês (para completar o grid)
        // ... (pode ser adicionado se necessário)
    }

    // --- [ 3. FUNÇÃO: ATUALIZAR HORÁRIOS (SIMULAÇÃO) ] ---
    async function atualizarHorarios(data) {
        // Formata a data para o título (ex: 11 de novembro de 2025)
        const diaFormatado = data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
        horariosTitulo.textContent = `Horários para ${diaFormatado}`;

        // Limpa a lista de horários anterior
        horariosLista.innerHTML = '';

        // Monta data ISO para comparação (YYYY-MM-DD)
        const dataISO = data.toISOString().split('T')[0];

        // Busca agendamentos reais do backend
        let horariosReais = [];
        try {
            const res = await fetch('http://localhost:3000/agendamentos');
            if (res.ok) {
                const all = await res.json();
                horariosReais = all.filter(a => a.dataHora.startsWith(dataISO));
            }
        } catch (err) {
            console.warn('Erro ao buscar agendamentos:', err);
        }

        // Horários simulados (cada 30 minutos das 09:00 às 17:30)
        const horariosSimulados = [];
        for (let h = 9; h <= 17; h++) {
            horariosSimulados.push(`${String(h).padStart(2, '0')}:00`);
            horariosSimulados.push(`${String(h).padStart(2, '0')}:30`);
        }
        horariosSimulados.push('18:00');

        // Para cada horário simulado, cria um item na lista indicando se está livre ou ocupado
        horariosSimulados.forEach(hora => {
            const li = document.createElement('li');
            const ocupado = horariosReais.some(a => a.dataHora.startsWith(`${dataISO}T${hora}`));
            li.textContent = `${hora} ${ocupado ? '— OCUPADO' : '— disponível'}`;
            li.className = ocupado ? 'horario-ocupado' : 'horario-livre';

            if (!ocupado) {
                // permite ao usuário clicar para preencher o formulário rapidamente
                li.style.cursor = 'pointer';
                li.addEventListener('click', () => {
                    formInputData.value = dataISO;
                    formInputHora.value = hora;
                    // marca visualmente o horário selecionado
                    Array.from(horariosLista.children).forEach(c => c.classList.remove('selecionado'));
                    li.classList.add('selecionado');
                });
            }

            horariosLista.appendChild(li);
        });
    }

    async function carregarPetsEServicos() {
        try {
            const [petsRes, servicosRes] = await Promise.all([
                fetch('http://localhost:3000/pets'),
                fetch('http://localhost:3000/servicos')
            ]);

            const pets = petsRes.ok ? await petsRes.json() : [];
            const servicos = servicosRes.ok ? await servicosRes.json() : [];

            const petSelect = document.getElementById('pet-select-agenda');
            petSelect.innerHTML = '<option value="" disabled selected>Selecione um pet...</option>';
            pets.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = `${p.nome} - (Dono: ${p.dono})`;
                petSelect.appendChild(opt);
            });

            const servSelect = document.getElementById('servico');
            // Limpa as opções (mantém a primeira instrução caso exista)
            const first = servSelect.options[0] ? servSelect.options[0].outerHTML : '';
            servSelect.innerHTML = first + servicos.map(s => `<option value="${s.nome}">${s.nome}</option>`).join('');
        } catch (err) {
            console.warn('Erro ao carregar pets/serviços:', err);
        }
    }

    carregarPetsEServicos();

    // --- [ 5. EVENTOS DOS BOTÕES E FORMULÁRIO ] ---

    // Botão de "Mês Anterior"
    mesAnteriorBtn.addEventListener('click', () => {
        dataAtual.setMonth(dataAtual.getMonth() - 1);
        renderizarCalendario();
    });

    // Botão de "Próximo Mês"
    proximoMesBtn.addEventListener('click', () => {
        dataAtual.setMonth(dataAtual.getMonth() + 1);
        renderizarCalendario();
    });
    
    // Evento de "submit" do formulário
    form.addEventListener('submit', (evento) => {
        evento.preventDefault(); // Impede o recarregamento da página
        
        // Aqui é onde o seu JS vai entregar os dados para o back-end
        const dadosDoForm = new FormData(form);
        const dados = Object.fromEntries(dadosDoForm.entries());
        
        (async () => {
            try {
                // Validações rápidas
                if (!dados.data || !dados.hora) {
                    alert('Data ou hora inválida. Selecione um horário antes de confirmar.');
                    return;
                }

                if (!dados.pet_id) {
                    alert('Selecione um pet antes de confirmar.');
                    return;
                }

                // buscamos ou criamos o serviço para obter um ID
                const servName = dados.servico;
                let servicos = [];
                const servRes = await fetch('http://localhost:3000/servicos');
                if (servRes.ok) servicos = await servRes.json();

                let servicoObj = servicos.find(s => s.nome === servName);
                if (!servicoObj) {
                    // cria novo serviço com preço 0
                    const createRes = await fetch('http://localhost:3000/servicos', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nome: servName, preco: 0 })
                    });
                    if (!createRes.ok) {
                        const text = await createRes.text();
                        throw new Error(`Falha ao criar serviço: ${createRes.status} ${text}`);
                    }
                    servicoObj = await createRes.json();
                }

                // monta dataHora no formato ISO
                const dataHora = new Date(`${dados.data}T${dados.hora}`);
                if (isNaN(dataHora.getTime())) {
                    alert('Data/Hora inválida. Verifique os campos.');
                    return;
                }

                const payload = {
                    dataHora: dataHora.toISOString(),
                    petId: parseInt(dados.pet_id),
                    servicoId: parseInt(servicoObj.id)
                };

                console.debug('Agendamento payload:', payload);
                const res = await fetch('http://localhost:3000/agendamentos', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                });
                console.debug('Resposta do servidor (status):', res.status);

                if (!res.ok) {
                    // tenta ler corpo de erro
                    let msg = '';
                    try {
                        const j = await res.json();
                        msg = j.error || JSON.stringify(j);
                    } catch (e) {
                        msg = await res.text();
                    }
                    throw new Error(`Falha ao criar agendamento: ${res.status} ${msg}`);
                }

                const created = await res.json();
                console.debug('Agendamento criado (body):', created);
                alert('Agendamento criado com sucesso.');
                form.reset();
                // Re-renderiza o calendário e atualiza os horários para a data criada
                renderizarCalendario();
                try {
                    if (dados.data) await atualizarHorarios(new Date(dados.data));
                } catch (e) { console.warn('Não foi possível atualizar horários imediatamente:', e); }
            } catch (err) {
                console.error('Erro ao criar agendamento (detalhe):', err);
                const msg = err && err.message ? err.message : String(err);
                alert(`Erro ao criar agendamento: ${msg}`);
            }
        })();
    });

    // --- [ 6. INICIALIZAÇÃO ] ---
    renderizarCalendario();
});