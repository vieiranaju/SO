// index.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// --- Inicialização ---
const prisma = new PrismaClient();
const app = express();
app.use(express.json()); // Habilita o Express para ler JSON
// Simple CORS middleware to allow frontend (nginx) to call the API
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    return res.sendStatus(200);
  }
  next();
});
const PORT = 3000;

// Simple JSON store for 'vacinas' to avoid changing the Prisma schema in this iteration
const VACINAS_FILE = path.join(__dirname, 'vacinas.json');

function readVacinas() {
  try {
    if (!fs.existsSync(VACINAS_FILE)) return [];
    const raw = fs.readFileSync(VACINAS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    console.error('Erro lendo vacinas.json:', e);
    return [];
  }
}

function writeVacinas(list) {
  try {
    fs.writeFileSync(VACINAS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {
    console.error('Erro escrevendo vacinas.json:', e);
  }
}

// CREATE pets
app.post('/pets', async (req, res) => {
  try {
    const { nome, raca, dono } = req.body;
    const pet = await prisma.pet.create({
      data: { nome, raca, dono },
    });
    res.status(201).json(pet);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// READ (Todos)
app.get('/pets', async (req, res) => {
  const pets = await prisma.pet.findMany();
  res.json(pets);
});

// UPDATE pets
// altera nome, raca ou dono
app.put('/pets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, raca, dono } = req.body;
    const pet = await prisma.pet.update({
      where: { id: parseInt(id) },
      data: {
        nome: nome,
        raca: raca,
        dono: dono,
      },
    });
    res.json(pet);
  } catch (error) {
    res.status(404).json({ error: 'Pet não encontrado' });
  }
});

// DELETE pets
app.delete('/pets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.pet.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send(); // Sucesso, sem conteúdo
  } catch (error) {
    res.status(404).json({ error: 'Pet não encontrado' });
  }
});


// CREATE SERVIÇOS 
app.post('/servicos', async (req, res) => {
  try {
    const { nome, preco } = req.body;
    const servico = await prisma.servico.create({
      data: { nome, preco: parseFloat(preco) },
    });
    res.status(201).json(servico);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// READ (Todos)
app.get('/servicos', async (req, res) => {
  const servicos = await prisma.servico.findMany();
  res.json(servicos);
});

// UPDATE serviços
// altera nome ou preco
app.put('/servicos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, preco } = req.body;
    const servico = await prisma.servico.update({
      where: { id: parseInt(id) },
      data: {
        nome: nome,
        preco: preco ? parseFloat(preco) : undefined,
      },
    });
    res.json(servico);
  } catch (error) {
    res.status(404).json({ error: 'Serviço não encontrado' });
  }
});

// DELETE serviços
app.delete('/servicos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.servico.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send(); // Sucesso, sem conteúdo
  } catch (error) {
    res.status(404).json({ error: 'Serviço não encontrado' });
  }
});

// CREATE AGENDAMENTOS
app.post('/agendamentos', async (req, res) => {
  try {
    const { dataHora, petId, servicoId } = req.body;
    const novoAgendamento = await prisma.agendamento.create({
      data: {
        dataHora: new Date(dataHora), // Converte string de data para objeto Date
        petId: parseInt(petId),
        servicoId: parseInt(servicoId),
      },
      include: { pet: true, servico: true },
    });
    res.status(201).json(novoAgendamento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// READ (Todos)
app.get('/agendamentos', async (req, res) => {
  const agendamentos = await prisma.agendamento.findMany({
    include: { pet: true, servico: true }, // 'include' traz os dados do pet e serviço
    orderBy: { dataHora: 'asc' }
  });
  res.json(agendamentos);
});

// UPDATE (Status ou Data)
// remarcar data ou alterar status
app.put('/agendamentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { dataHora, status } = req.body;
    const agendamento = await prisma.agendamento.update({
      where: { id: parseInt(id) },
      data: {
        dataHora: dataHora ? new Date(dataHora) : undefined,
        status: status,
      },
    });
    res.json(agendamento);
  } catch (error) {
    res.status(404).json({ error: 'Agendamento não encontrado' });
  }
});

// DELETE
app.delete('/agendamentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.agendamento.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send(); // Sucesso, sem conteúdo
  } catch (error) {
    res.status(404).json({ error: 'Agendamento não encontrado' });
  }
});

// --- V A C I N A S  (persistência simples via JSON) ---
// GET /vacinas
app.get('/vacinas', (req, res) => {
  const list = readVacinas();
  res.json(list);
});

// POST /vacinas
app.post('/vacinas', (req, res) => {
  try {
    const { petNome, nomeVacina, dataAplicacao, proximaDose } = req.body;
    if (!petNome || !nomeVacina || !dataAplicacao) {
      return res.status(400).json({ error: 'Campos obrigatórios: petNome, nomeVacina, dataAplicacao' });
    }
    const list = readVacinas();
    const id = list.length ? (list[list.length - 1].id + 1) : 1;
    const item = {
      id,
      petNome,
      nomeVacina,
      dataAplicacao: dataAplicacao,
      proximaDose: proximaDose || null
    };
    list.push(item);
    writeVacinas(list);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /vacinas/:id
app.delete('/vacinas/:id', (req, res) => {
  try {
    const { id } = req.params;
    let list = readVacinas();
    const idx = list.findIndex(v => v.id === parseInt(id));
    if (idx === -1) return res.status(404).json({ error: 'Registro não encontrado' });
    list.splice(idx, 1);
    writeVacinas(list);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// servidor 
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});