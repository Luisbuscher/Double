// IMPORTS:
const DB = require("./script/db/db.js"); // Importa a classe que mexe com banco de dados;
const DataFunctionsDouble = require('./script/script.js'); // Importa a classe dos scripts do jogo;
const User_api = require('./script/api/user.js'); // Importa a classe responsavel pela api.
const GeralFunction = require('./script/functions/geral_functions.js'); // Funcoes gerais.

// DEPENDENCIAS PACKAGES:
const express = require('express'); // Carrega o módulo Express, um framework para desenvolvimento web no Node.js;
const http = require('http'); // Carrega o módulo HTTP nativo do Node.js, que fornece funcionalidades de servidor HTTP;
const socketIo = require('socket.io'); // Carrega o módulo Socket.IO, uma biblioteca que permite comunicação em tempo real bidirecional;
const path = require('path'); // Carrega o módulo 'path' nativo do Node.js, que fornece utilitários para trabalhar com caminhos de arquivos e diretórios;
const app = express(); // Cria uma nova instância do Express, que será usada para definir o servidor;
const server = http.createServer(app); // Cria um novo servidor HTTP usando a instância do Express;
const io = socketIo(server); // Integra o Socket.IO com o servidor HTTP, permitindo comunicações em tempo real através de WebSockets;
const cron = require('node-cron'); // <-- Adicione no topo com os outros imports

// Variavel globais.
const { divData, urls } = require('./config.js');

// Instanciando objetos.
const geralFunction = new GeralFunction();
const user_api = new User_api();
const db = new DB();
db.connect(); // Faz a conexao no banco de dados PostgreSQL. ESTUDAR!
const dataFunctionsDouble = new DataFunctionsDouble(io, 15, [], db, divData); // Inicia a classe do script.

db.insertCustomer(); // Inicia a tabela do primeiro jogo, o restante sera de forma automatica pelo script enquanto servidor estiver rodando.
dataFunctionsDouble.timeForNextRound(); // Inicia o contador.

// Agendamento para executar todo dia à meia-noite
cron.schedule('0 0 * * *', async () => {
    console.log('Executando truncamento da tabela game às 00:00...');
    try {
        await db.truncateGameTable();
        await db.insertCustomer(); // Para já inserir o novo jogo após limpar
    } catch (error) {
        console.error('Erro ao executar o truncamento programado:', error);
    }
});

// SOCKET/SERVIDOR:
io.on('connection', (socket) => {

    let wallet = 100; // Carteira do jogador.
    let colorBet = ''; // Variavel que armazena a cor apostada.
    let valueBet = 0; // Variavel que armazena o valor da aposta.

    // Atualiza a carteira do front-end ao logar.
    socket.on('start_game', () => {
        user_api.updateWalletDisplay(socket, wallet); // Atualiza o display da carteira do usuario.
    });

    // Dá o update no display de historico das ultimas particas assim que o usuario loga.
    dataFunctionsDouble.updateStats();

    // Recebe o resultado da partida apos seu fim. ARRUMAR!
    socket.on('end', async (resultColor, resultNumber) => {
        // Recebe false se perdeu ou o valor ganho.
        let responseResult = dataFunctionsDouble.calculateValueWonAndLost(resultColor, colorBet, valueBet);
        if (responseResult != false) {
            wallet = wallet + responseResult;
            await user_api.updateWalletDisplay(socket, wallet); // Atualiza o display da carteira do usuario.
        }
        colorBet = ''; // Reinicia a cor apostada se a aposta automatica nao tiver ativa.
        valueBet = 0; // Reinicia o valor apostado se a aposta automatica nao tiver ativa.
        await user_api.updateWalletDisplay(socket, wallet); // Atualiza o display da carteira do usuario.
    });

    // Recebe e registra a aposta.
    socket.on('registerBet', async (betAmount, betColor) => {

        // Valida a aposta, caso o numero seja invalido retorna false.
        let validateBet = await user_api.validadeBet(socket, betAmount, wallet);
        //let valueFormated = geralFunction.validateValueBet(betAmount);
        console.log(validateBet);

        if (validateBet != false) {
            valueBet = validateBet; // Salva o valor apostado pelo usuario.
            wallet -= valueBet;
            colorBet = betColor;
            await user_api.updateWalletDisplay(socket, wallet); // Atualiza o display da carteira do usuario.
        }
    });

});

// EXPRESS/ROUTERS:

// Configure a pasta estática e defina o tipo MIME correto.
app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

// INICIALIZATION SERVER:

const port = 3001; // Porta do servidor.

server.listen(port, () => {
    console.log(`Servidor ouvindo na porta ${port}`);
});