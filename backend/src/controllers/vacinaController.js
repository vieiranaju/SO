const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar todas as vacinas
exports.getAll = async (req, res) => {
  const vacinas = await prisma.vacina.findMany({
    include: { pet: true }
  });

  // Formata a resposta para o frontend
  const formatted = vacinas.map(v => ({
    ...v,
    petNome: v.pet ? v.pet.nome : 'Pet Excluído'
  }));
  res.json(formatted);
};

// Buscar vacina por ID
exports.getById = async (req, res) => {
  const vacina = await prisma.vacina.findUnique({
    where: { id: Number(req.params.id) },
    include: { pet: true }
  });
  if (!vacina) return res.status(404).json({ error: 'Vacina não encontrada' });

  const formatted = {
    ...vacina,
    petNome: vacina.pet ? vacina.pet.nome : 'Pet Excluído'
  };
  res.json(formatted);
};

// Registrar nova vacina
exports.create = async (req, res) => {
  try {
    const { petId, nomeVacina, dataAplicacao, proximaDose } = req.body;

    const vacina = await prisma.vacina.create({
      data: {
        petId: parseInt(petId),
        nomeVacina: nomeVacina,
        dataAplicacao: new Date(dataAplicacao),
        proximaDose: proximaDose ? new Date(proximaDose) : null
      },
      include: { pet: true }
    });

    const formatted = {
      ...vacina,
      petNome: vacina.pet ? vacina.pet.nome : 'N/D'
    };
    res.status(201).json(formatted);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Atualizar vacina
exports.update = async (req, res) => {
  try {
    const { petId, nomeVacina, dataAplicacao, proximaDose } = req.body;

    const vacina = await prisma.vacina.update({
      where: { id: Number(req.params.id) },
      data: {
        petId: parseInt(petId),
        nomeVacina: nomeVacina,
        dataAplicacao: new Date(dataAplicacao),
        proximaDose: proximaDose ? new Date(proximaDose) : null
      },
      include: { pet: true }
    });

    const formatted = {
      ...vacina,
      petNome: vacina.pet ? vacina.pet.nome : 'N/D'
    };
    res.json(formatted);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Remover vacina
exports.remove = async (req, res) => {
  try {
    await prisma.vacina.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (error) {
    res.status(404).json({ error: 'Vacina não encontrada' });
  }
};