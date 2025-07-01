
class DataFunctionsDouble {

    constructor(io, timerNextRound, historic = [], db, divData = []) {
        this.db = db; // Objeto da classe do banco de dados.
        this.io = io; // Objeto do Socket.io.
        this.timerNextRound = timerNextRound; // Tempo para a proxima partida.
        this.historic = historic; // Historico das ultimas partidas.
        this.divData = divData; // Pedras.
    }

    //GETTERS:
    get nextRoundTimer() { return this.timerNextRound; }
    get allHistoric() { return this.historic; }

    //SETTERS:
    set nextRoundTimer(value) { this.timerNextRound = value; }
    set allHistoric(value) { this.historic = value; }

    //FUNCTIONS:

    // Funcao de contador para a proxima partida:
    async timeForNextRound(time = 15) {
        let tempCountdown = time;
        await this.updateStats();

        let interval = setInterval(() => {
            tempCountdown--;
            this.io.emit('countdown', tempCountdown);

            if (tempCountdown <= 0) {
                clearInterval(interval);
                this.play();
            }
        }, 1000); // Atualiza o contador a cada segundo;
    }

    // Funcao durante a partida:
    async play() {

        var numeros = Array.from({ length: 28 }, (_, i) => i); // Cria um array com números de 0 a 28.
        var randomResultNumber = await this.embaralhar(numeros); // Recebe um numero aleatorio de 0 a 28.
        console.log(randomResultNumber); // Servidor emite resultado do numero sorteado.
        this.io.emit('play', randomResultNumber, this.divData[randomResultNumber].color); // Envia o resultado da partida.
        this.db.endSet(this.divData[randomResultNumber].color, this.divData[randomResultNumber].number); // Envia ao banco de dados e atualiza o resultado da partida.

        setTimeout(() => {
            this.io.emit('endPlay', this.divData[randomResultNumber].color, this.divData[randomResultNumber].number); // Envia que a partida acabou.
            this.timeForNextRound(); // Chama a função para começar novamente a contagem.
        }, 10500); // Tempo necessario para concluir a transicao.
    }

    // Funcao que, logo após acabar a partida, culcula e atualiza o valor da aposta do usuario:
    calculateValueWonAndLost(resultColor, betColor, valueBet) {
        let valueCalc;
        // Quantidade de vezes multiplicadas se ganhar; ITEM-1 = PRETO E VERMELHO, ITEM-2 = BRANCO.
        let multiplyBet = [2, 14];

        if (resultColor == betColor) {
            if (resultColor == 'white') {
                valueCalc = valueBet * multiplyBet[1];
            } else { valueCalc = valueBet * multiplyBet[0]; }
            // Retorna o valor ganho.
            return valueCalc;
        } else {
            return false;
        }

    }

    // Funcao para atualizar o painel de estatisticas:
    async updateStats() {
        try {
            // Funcao da classe db para pegar da tabela as estatisticas.
            this.db.getStats()
                .then((resultStats) => {
                    this.io.emit('updateStats', resultStats.map(objeto => objeto.color), resultStats.map(objeto => objeto.color_number));
                })
                .catch((error) => {
                    console.error('Erro ao obter/enviar os dados:', error);
                });
        } catch (error) {
            console.error('Erro ao exibir histórico: ', error);
            throw error;
        }
    }

    // Funcao para embaralhar o array de numeros e deixar mais aleatorio ainda:
    embaralhar(array) {
        var m = array.length, t, i;

        // Enquanto ainda existem elementos para embaralhar...
        while (m) {

            i = Math.floor(Math.random() * m--);

            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }

        // A funcao retorna somente o primeiro item do array embaralhado.
        return array[0];
    }

}

//EXPORTANDO CLASSE:
module.exports = DataFunctionsDouble;