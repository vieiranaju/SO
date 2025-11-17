const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET ALL (Já estava correto)
exports.getAll = async (req, res) => {
  const agendamentos = await prisma.agendamento.findMany({
    include: { pet: true, servico: true }
  });
  res.json(agendamentos);
};

// GET BY ID (Já estava correto)
exports.getById = async (req, res) => {
  const agendamento = await prisma.agendamento.findUnique({
    where: { id: Number(req.params.id) },
    include: { pet: true, servico: true }
  });
  if (!agendamento) return res.status(404).json({ error: 'Agendamento não encontrado' });
  res.json(agendamento);
};

// CREATE (Corrigido: Converte os dados e inclui a resposta)
exports.create = async (req, res) => {
  try {
    const { petId, servicoId, dataHora, status } = req.body;

    const agendamento = await prisma.agendamento.create({ 
      data: {
        petId: parseInt(petId),
        servicoId: parseInt(servicoId),
        dataHora: new Date(dataHora),
        status: status // (Opcional, pode vir ou usar o default)
      },
      include: { pet: true, servico: true } // Devolve os nomes para o React
    });
    res.status(201).json(agendamento);
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// UPDATE (Corrigido: Converte os dados e inclui a resposta)
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
      include: { pet: true, servico: true } // Devolve os nomes para o React
    });
    res.json(agendamento);
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// REMOVE (Corrigido: Adiciona 'try...catch' por segurança)
exports.remove = async (req, res) => {
  try {
    await prisma.agendamento.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (error) {
    res.status(404).json({ error: 'Agendamento não encontrado' });
  }
};