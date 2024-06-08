require('dotenv').config();
const express = require('express');
const bodyParse = require('body-parser');
const axios = require('axios');
const app = express();
const eventos = [];

app.use(bodyParse.json());

app.get('/eventos', (req, res) => res.send(eventos));

app.post('/eventos', (req, res) => {
    const evento = req.body;
    eventos.push(evento)

    try {

        // if (!evento.tipo.length > 0)
        //   axios.post('http://localhost:4000/eventos', evento); //lembrete

        if (evento.tipo == "ObservacaoClassificada")
            axios.post('http://localhost:5000/eventos', evento); //observacao

        if (!(evento.tipo == "ObservacaoClassificada"))
            axios.post('http://localhost:6000/eventos', evento); //consulta

        if (evento.tipo == "ObservacaoCriada")
            axios.post('http://localhost:7000/eventos', evento); //classificacao

        res.status(200).send({ msg: "OK" });
    } catch (e) { throw new Exception(e.message) }
});


app.listen(process.env.PORT, () => console.log(`Barramento de Evento. Porta ${process.env.PORT}`));