/*cada chave é o id de um lembrete e seu valor associado é a coleção de observações associadas àquele lembrete.
*/
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const observacoesaPorLembreteId = {};

const { v4: uuidv4 } = require('uuid');

const axios = require('axios')

const funcoes = {
    ObservacaoClassificada: (observacao) => {
        const observacoes =
            observacoesPorLembreteId[observacao.lembreteId];
        const obsParaAtualizar = observacoes.find(o => o.id ===
            observacao.id)
        obsParaAtualizar.status = observacao.status;
        axios.post('http://localhost:10000/eventos', {
            tipo: "ObservacaoAtualizada",
            dados: {
                id: observacao.id,
                texto: observacao.texto,
                lembreteId: observacao.lembreteId,
                status: observacao.status
            }
        });
    }
}
/* O evento do tipo ObservacaoAtualizada tem como destino o microsserviço de consulta. Ele busca a observação pelo id e substitui o objeto existente por aquele incluído no evento. */

app.put('/lembretes/:id/observacoes', async (req, res) => {
    const idObs = uuidv4();
    const { texto } = req.body;
    const observacoesDoLembrete = observacoesaPorLembreteId[req.params.id] || [];
    observacoesDoLembrete.push({ id: idObs, texto, status: 'aguardando' });
    observacoesaPorLembreteId[req.params.id] = observacoesDoLembrete;
    await axios.post('http://localhost:10000/eventos', {
        tipo: "ObservacaoCriada",
        dados: {
            id: idObs, texto,
            lembreteId: req.params.id,
            status: 'aguardando'
        },
    });
    res.status(201).send(observacoesDoLembrete);
});

app.get('/lembretes/:id/observacoes', (req, res) => {
    res.send(observacoesaPorLembreteId[req.params.id] || []);
});

app.post('/eventos', (req, res) => {
    try {
        funcoes[req.body.tipo](req.body);
    }
    catch (err) { }
    res.status(200).send({ msg: 'OK' });
});

app.listen(process.env.PORT, (() => {
    console.log(`Lembretes. Porta ${process.env.PORT}`);
}));
