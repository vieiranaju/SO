const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar todos os agendamentos
exports.getAll = async (req, res) => {
  const agendamentos = await prisma.agendamento.findMany({
    include: { pet: true, servico: true }
  });
  res.json(agendamentos);
};

// Buscar agendamento por ID
exports.getById = async (req, res) => {
  const agendamento = await prisma.agendamento.findUnique({
    where: { id: Number(req.params.id) },
    include: { pet: true, servico: true }
  });
  if (!agendamento) return res.status(404).json({ error: 'Agendamento não encontrado' });
  res.json(agendamento);
};

// Criar novo agendamento
exports.create = async (req, res) => {
  console.log('Recebendo requisição de agendamento:', req.body);
  try {
    const { petId, servicoId, dataHora, status } = req.body;

    if (!petId || !servicoId || !dataHora) {
      console.error('Dados incompletos:', req.body);
      return res.status(400).json({ error: 'Dados incompletos: petId, servicoId e dataHora são obrigatórios.' });
    }

    const agendamento = await prisma.agendamento.create({
      data: {
        petId: parseInt(petId),
        servicoId: parseInt(servicoId),
        dataHora: new Date(dataHora),
        status: status
      },
      include: { pet: true, servico: true }
    });
    console.log('Agendamento criado com sucesso:', agendamento);
    res.status(201).json(agendamento);

  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(400).json({ error: error.message });
  }
};

// Atualizar agendamento
exports.update = async (req, res) => {
  try {
    const { petId, servicoId, dataHora, status } = req.body;

    const agendamento = await prisma.agendamento.update({
      where: { id: Number(req.params.id) },
      data: {
        petId: parseInt(petId),
        servicoId: parseInt(servicoId),
        dataHora: new Date(dataHora),
        status: status
      },
      include: { pet: true, servico: true }
    });
    res.json(agendamento);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Remover agendamento
exports.remove = async (req, res) => {
  try {
    await prisma.agendamento.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (error) {
    res.status(404).json({ error: 'Agendamento não encontrado' });
  }
};