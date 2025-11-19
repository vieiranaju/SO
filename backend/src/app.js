const express = require('express');
const cors = require('cors'); // Adicione esta linha
const app = express();

app.use(cors()); // E esta linha
app.use(express.json());

app.use('/pets', require('./routes/pet'));
app.use('/servicos', require('./routes/servico'));
app.use('/agendamentos', require('./routes/agendamento'));
app.use('/vacinas', require('./routes/vacina'));

module.exports = app;