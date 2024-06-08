const bodyParser = require('body-parser');
const express = require('express');
const axios = require('axios');
const app = express();
const lembretes = {};
require('dotenv').config();

let contador = 0;

app.use(bodyParser.json());

//GET -> devolvendo a colecao de lembretes
app.get('/lembretes', (req, res) => res.send(lembretes));

//PUT -> geracao de id e criacao de lembrete
app.put('/lembretes', async (req, res) => {
    contador++;
    const { texto } = req.body;
    lembretes[contador] = {
        contador, texto
    };
    await axios.post("http://localhost:10000/eventos", {
        tipo: "LembreteCriado",
        dados: {
            contador, texto,
        },
    });
    res.status(201).send(lembretes[contador]);
});

app.post('/eventos', (req, res) => {
    console.log(req.body);
    res.status(200).send({ msg: 'OK' });
});

app.delete('/lembretes/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (lembretes[id]) {
        delete lembretes[id];
        res.status(200).send({ msg: `Lembrete ${id} deletado.` });
    } else res.status(404).send({ msg: `Lembrete ${id} não encontrado.` });
});

app.listen(process.env.PORT, () => console.log(`Lembretes. Porta ${process.env.PORT}`));
