const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET ALL (Corrigido: Formata a resposta para o React)
exports.getAll = async (req, res) => {
  const vacinas = await prisma.vacina.findMany({ 
    include: { pet: true } 
  });
  
  // Converte a lista para o formato que o React espera (com petNome)
  const formatted = vacinas.map(v => ({
    ...v,
    petNome: v.pet ? v.pet.nome : 'Pet Excluído'
  }));
  res.json(formatted);
};

// GET BY ID (Corrigido: Formata a resposta)
exports.getById = async (req, res) => {
  const vacina = await prisma.vacina.findUnique({
    where: { id: Number(req.params.id) },
    include: { pet: true }
  });
  if (!vacina) return res.status(404).json({ error: 'Vacina não encontrada' });
  
  // Formata a resposta
  const formatted = {
    ...vacina,
    petNome: vacina.pet ? vacina.pet.nome : 'Pet Excluído'
  };
  res.json(formatted);
};

// CREATE (Corrigido: Converte os dados e devolve o petNome)
exports.create = async (req, res) => {
  try {
    const { petId, nomeVacina, dataAplicacao, proximaDose } = req.body;
    
    const vacina = await prisma.vacina.create({ 
      data: {
        petId: parseInt(petId), // Converte para Int
        nomeVacina: nomeVacina,
        dataAplicacao: new Date(dataAplicacao), // Converte para Data
        proximaDose: proximaDose ? new Date(proximaDose) : null // Converte para Data
      },
      include: { pet: true } // Pede ao Prisma para incluir o pet
    });
    
    // Formata a resposta para o React
    const formatted = {
      ...vacina,
      petNome: vacina.pet ? vacina.pet.nome : 'N/D'
    };
    res.status(201).json(formatted);
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// UPDATE (Corrigido: Converte os dados e devolve o petNome)
exports.update = async (req, res) => {
  try {
    const { petId, nomeVacina, dataAplicacao, proximaDose } = req.body;

    const vacina = await prisma.vacina.update({
      where: { id: Number(req.params.id) },
      data: {
        petId: parseInt(petId), // Converte para Int
        nomeVacina: nomeVacina,
        dataAplicacao: new Date(dataAplicacao), // Converte para Data
        proximaDose: proximaDose ? new Date(proximaDose) : null // Converte para Data
      },
      include: { pet: true } // Pede ao Prisma para incluir o pet
    });

    // Formata a resposta para o React
    const formatted = {
      ...vacina,
      petNome: vacina.pet ? vacina.pet.nome : 'N/D'
    };
    res.json(formatted);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// REMOVE (Corrigido: Adiciona 'try...catch' por segurança)
exports.remove = async (req, res) => {
  try {
    await prisma.vacina.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (error) {
    res.status(404).json({ error: 'Vacina não encontrada' });
  }
};