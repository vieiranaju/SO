const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar todos os pets
exports.getAll = async (req, res) => {
  const pets = await prisma.pet.findMany({
    include: { vacinas: true, agendamentos: true }
  });
  res.json(pets);
};

// Buscar pet por ID
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

// Criar novo pet
exports.create = async (req, res) => {
  console.log('Recebendo requisição de pet:', req.body);
  try {
    // Validação: Verifica duplicidade de nome para o mesmo dono
    const existingPets = await prisma.pet.findMany({
      where: { dono: req.body.dono }
    });

    const isDuplicate = existingPets.some(pet =>
      pet.nome.toLowerCase() === req.body.nome.toLowerCase()
    );

    if (isDuplicate) {
      console.warn('Tentativa de criar pet duplicado:', req.body);
      return res.status(400).json({
        error: 'Já existe um pet com este nome para este dono'
      });
    }

    const pet = await prisma.pet.create({
      data: req.body,
      include: { vacinas: true, agendamentos: true }
    });
    console.log('Pet criado com sucesso:', pet);
    res.status(201).json(pet);
  } catch (error) {
    console.error('Erro ao criar pet:', error);
    res.status(400).json({ error: error.message });
  }
};

// Atualizar pet
exports.update = async (req, res) => {
  try {
    // Validação: Verifica duplicidade de nome para o mesmo dono (exceto o próprio)
    const existingPets = await prisma.pet.findMany({
      where: { dono: req.body.dono }
    });

    const petId = Number(req.params.id);
    const isDuplicate = existingPets.some(pet =>
      pet.id !== petId && pet.nome.toLowerCase() === req.body.nome.toLowerCase()
    );

    if (isDuplicate) {
      return res.status(400).json({
        error: 'Já existe um pet com este nome para este dono'
      });
    }

    const pet = await prisma.pet.update({
      where: { id: petId },
      data: req.body,
      include: { vacinas: true, agendamentos: true }
    });
    res.json(pet);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Remover pet
exports.remove = async (req, res) => {
  try {
    await prisma.pet.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (error) {
    res.status(404).json({ error: 'Pet não encontrado ou possui registros associados (vacinas/agendamentos).' });
  }
};