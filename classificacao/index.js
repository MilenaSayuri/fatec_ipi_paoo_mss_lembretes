const express = require("express");
const axios = require("axios");
const app = express();
require('dotenv').config();

app.use(express.json());

const funcoes = {
    ObservacaoCriada: (observacao) => {
        let txt = observacao.texto.toLowerCase()
        observacao.status = txt.includes('importante') ? 'importante' : txt.includes(`urgente`) ? `urgente` : 'comum'
        axios.post("http://localhost:10000/eventos", {
            tipo: "ObservacaoClassificada",
            dados: observacao,
        });
    },
};

app.post('/eventos', (req, res) => {
    try {
        funcoes[req.body.tipo](req.body.dados);
    } catch (err) { }
    res.status(200).send({ msg: "ok" });
});

app.listen(process.env.PORT, () => console.log(`Classificação. Porta ${process.env.PORT}`));
