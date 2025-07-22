const { json } = require("express");

class User {

    // Funcao para validar e realizar aposta:
    async validadeBet(io, value, wallet) {
        try {
            value = value.toString();
            let valueFormated = value.replace('.', '');
            valueFormated = valueFormated.replace(',', '.');
            valueFormated = parseFloat(valueFormated); // Valor formatado em float EX: 509,09 => 509.09.
            wallet = parseFloat(wallet);
            if (wallet >= valueFormated) {
                console.log('Aposta Recebida e Aprovada')
                console.log('Valor recebido: ' + valueFormated)
                console.log('Valor da carteira: ' + wallet)
                wallet = wallet - valueFormated;
                // Atualiza a carteira via API do usuario e o display.
                await this.updateWalletDisplay(io, wallet);
                return valueFormated; // Retorna que a aposta foi feita com sucesso.
            } else {
                io.emit('messageErroServer', 'Aposta invalida, por favor consulte o saldo e faça uma aposta valida!');
                return false;
            } // Retorna que a aposta nao teve sucesso.

        } catch (error) {
            io.emit('messageErroServer', 'Ocorreu um erro ao relizar a aposta!');
            console.error('Erro ao formatar numero: ', error);
            return false;
        }
    }

    // Funcao para atualizar o display da carteira do usuario no frontEnd:
    async updateWalletDisplay(io, wallet) {
        try {
            io.emit('updateCurrentWallet', wallet); // Atualiza o display da carteira.
        } catch (error) {
            console.error('Erro ao atualizar o display da carteira do usuario: ', error);
            throw error;
        }
    }

}

module.exports = User;