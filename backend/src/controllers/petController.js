const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET ALL (Já estava correto)
exports.getAll = async (req, res) => {
  const pets = await prisma.pet.findMany({ 
    include: { vacinas: true, agendamentos: true } 
  });
  res.json(pets);
};

// GET BY ID (Já estava correto)
exports.getById = async (req, res) => {
  try {
    const pet = await prisma.pet.findUnique({
      where: { id: Number(req.params.id) },
      include: { vacinas: true, agendamentos: true }
    });
    if (!pet) return res.status(404).json({ error: 'Pet não encontrado' });
    res.json(pet);
  } catch (error) {
    res.status(404).json({ error: 'Pet não encontrado' });
  }
};

// CREATE (Corrigido: Adiciona 'include' e 'try...catch')
exports.create = async (req, res) => {
  try {
    const pet = await prisma.pet.create({ 
      data: req.body,
      include: { vacinas: true, agendamentos: true } // Devolve o objeto completo
    });
    res.status(201).json(pet);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// UPDATE (Corrigido: Adiciona 'include' e 'try...catch')
exports.update = async (req, res) => {
  try {
    const pet = await prisma.pet.update({
      where: { id: Number(req.params.id) },
      data: req.body,
      include: { vacinas: true, agendamentos: true } // Devolve o objeto completo
    });
    res.json(pet);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// REMOVE (Corrigido: Adiciona 'try...catch')
exports.remove = async (req, res) => {
  try {
    await prisma.pet.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (error) {
    // Este erro agora inclui o "Bug do Delete"
    res.status(404).json({ error: 'Pet não encontrado ou possui registros associados (vacinas/agendamentos).' });
  }
};