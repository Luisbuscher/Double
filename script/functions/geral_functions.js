class GeralFunction {

    // Funcao para validar e formatar o valor da aposta recebido:
    validateValueBet(value) {
        try {
            let valueFormated = value.replace('.', '');
            valueFormated = valueFormated.replace(',', '.');
            valueFormated = parseFloat(valueFormated);
            return valueFormated; // Retorna o valor convertido.
        } catch (error) {
            console.error('Erro ao formatar numero: ', error);
            return false;
        }
    }

}

//EXPORTANDO CLASSE:
module.exports = GeralFunction;