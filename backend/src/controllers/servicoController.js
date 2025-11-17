const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET ALL 
exports.getAll = async (req, res) => {
  const servicos = await prisma.servico.findMany({ 
    include: { agendamentos: true } 
  });
  res.json(servicos);
};

// GET BY ID 
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

// CREATE (Corrigido: Converte 'preco' e adiciona try...catch)
exports.create = async (req, res) => {
  try {
    const { nome, preco } = req.body;
    
    const servico = await prisma.servico.create({ 
      data: {
        nome: nome,
        preco: preco ? parseFloat(preco) : 0 // Converte para Float
      },
      include: { agendamentos: true } // Mantém a consistência da resposta
    });
    res.status(201).json(servico);
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// UPDATE (Corrigido: Converte 'preco' e adiciona try...catch)
exports.update = async (req, res) => {
  try {
    const { nome, preco } = req.body;

    const servico = await prisma.servico.update({
      where: { id: Number(req.params.id) },
      data: {
        nome: nome,
        preco: preco ? parseFloat(preco) : undefined // Converte para Float
      },
      include: { agendamentos: true } // Mantém a consistência da resposta
    });
    res.json(servico);
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// REMOVE (Corrigido: Adiciona try...catch para o "bug" do delete)
exports.remove = async (req, res) => {
  try {
    await prisma.servico.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: 'Serviço não pode ser excluído pois está em uso por um agendamento.' });
  }
};