const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use('/pets', require('./routes/pet'));
app.use('/servicos', require('./routes/servico'));
app.use('/agendamentos', require('./routes/agendamento'));
app.use('/vacinas', require('./routes/vacina'));

module.exports = app;