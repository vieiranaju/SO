const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar todos os serviços
exports.getAll = async (req, res) => {
  const servicos = await prisma.servico.findMany({
    include: { agendamentos: true }
  });
  res.json(servicos);
};

// Buscar serviço por ID
exports.getById = async (req, res) => {
  try {
    const servico = await prisma.servico.findUnique({
      where: { id: Number(req.params.id) },
      include: { agendamentos: true }
    });
    if (!servico) return res.status(404).json({ error: 'Serviço não encontrado' });
    res.json(servico);
  } catch (error) {
    res.status(404).json({ error: 'Serviço não encontrado' });
  }
};

// Criar novo serviço
exports.create = async (req, res) => {
  try {
    const { nome, preco } = req.body;

    const servico = await prisma.servico.create({
      data: {
        nome: nome,
        preco: preco ? parseFloat(preco) : 0
      },
      include: { agendamentos: true }
    });
    res.status(201).json(servico);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Atualizar serviço
exports.update = async (req, res) => {
  try {
    const { nome, preco } = req.body;

    const servico = await prisma.servico.update({
      where: { id: Number(req.params.id) },
      data: {
        nome: nome,
        preco: preco ? parseFloat(preco) : undefined
      },
      include: { agendamentos: true }
    });
    res.json(servico);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Remover serviço
exports.remove = async (req, res) => {
  try {
    await prisma.servico.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: 'Serviço não pode ser excluído pois está em uso por um agendamento.' });
  }
};