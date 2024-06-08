/*cada chave é o id de um lembrete e seu valor associado é a coleção de observações associadas àquele lembrete.
*/
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios')
const app = express();
const { v4: uuidv4 } = require('uuid');

const observacoesPorLembreteId = {};
app.use(bodyParser.json());


const funcoes = {
    ObservacaoClassificada: (observacao) => {
        const observacoes = observacoesPorLembreteId[observacao.dados.lembreteId];
        const obsParaAtualizar = observacoes.find(o => o.id === observacao.dados.id)
        obsParaAtualizar.status = observacao.dados.status;
        axios.post('http://localhost:10000/eventos', {
            tipo: "ObservacaoAtualizada",
            dados: {
                id: observacao.dados.id,
                texto: observacao.dados.texto,
                lembreteId: observacao.dados.lembreteId,
                status: observacao.dados.status
            }
        });
    }
}
/* O evento do tipo ObservacaoAtualizada tem como destino o microsserviço de consulta. Ele busca a observação pelo id e substitui o objeto existente por aquele incluído no evento. */

app.get('/lembretes/:id/observacoes', (req, res) => res.send(observacoesPorLembreteId[req.params.id] || []));

app.put('/lembretes/:id/observacoes', async (req, res) => {
    const idObs = uuidv4();
    const { texto } = req.body;
    const observacoesDoLembrete = observacoesPorLembreteId[req.params.id] || [];
    observacoesDoLembrete.push({ id: idObs, texto, status: 'aguardando' });
    observacoesPorLembreteId[req.params.id] = observacoesDoLembrete;
    
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

app.post('/eventos', (req, res) => {
    try {
        funcoes[req.body.tipo](req.body);
    }
    catch (err) { }
    res.status(200).send({ msg: 'OK' });
});

app.listen(process.env.PORT, (() => console.log(`Observacoes. Porta ${process.env.PORT}`)));
