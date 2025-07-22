class ConnectDB {

    constructor() {
        this.init();
    }

    async init() {
        try {
            const dotenv = require("dotenv")
            dotenv.config()

            const { Pool } = require('pg');
            this.pool = new Pool({
                user: process.env.PGUSER,
                host: process.env.PGHOST,
                database: process.env.PGDATABASE,
                password: process.env.PGPASSWORD,
                port: process.env.PGPORT
            });

            // Testando a conexão.
            const client = await this.pool.connect();
            console.log("Criou pool de conexões no PostgreSQL!");
            client.release();

        } catch (error) {
            console.error('Erro ao conectar ao banco de dados: ', error);
            throw error;
        }
    }

    async connect() {
        if (!this.pool) {
            await this.init();
        }
        return this.pool.connect();
    }

    //Funcao para inserir um novo registro para um novo jogo no banco de dados:
    async insertCustomer() {
        const client = await this.connect();
        try {
            const resultValues = await this.getCurrentIdAndCurrentTotalBet();
            let id = resultValues.map(objeto => objeto.id);

            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const dateFormated = `${year}-${month}-${day}`;

            const sql = 'INSERT INTO game(id, total_bet, color, color_number, game_date, bet_cyan, bet_black, bet_white) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);';
            const values = [id.length + 1, 0, '', 0, dateFormated, 0, 0, 0];
            return await client.query(sql, values);
        } catch (error) {
            console.error('Erro ao inserir uma novo registro inicial ao banco: ', error);
            throw error;
        } finally {
            client.release();
        }
    }

    //Funcao final que da update da cor e numero resultante ao final da partida:
    async endSet(color, colorNumber) {
        const client = await this.connect();
        const resultValues = await this.getCurrentIdAndCurrentTotalBet();
        let currentId = resultValues.map(objeto => objeto.id); //Pega o valor do ID da coluna que está atualmente ativa.
        currentId = currentId[currentId.length - 1];
        try {
            const sql = 'UPDATE game SET color = $1, color_number = $2 WHERE id = $3;'; //Aumenta o valor total de apostas e o total de aposta na cor apostada.
            const values = [color, colorNumber, currentId];
            await client.query(sql, values);
        } catch (error) {
            console.error('Erro ao atualizar a tabela game:', error);
            throw error;
        } finally {
            client.release();
        }
        return this.insertCustomer();
    }

    //Funcao para obter os dados da tabela:
    async getCurrentIdAndCurrentTotalBet() {
        const client = await this.connect();
        try {
            const res = await client.query('SELECT id, total_bet FROM game');
            return res.rows;
        } catch (error) {
            console.error('Erro na funcao para obter os dados da tabela do banco de dados: ', error);
            throw error;
        } finally {
            client.release();
        }
    }

    //Funcao para obter os dados da tabela:
    async getStats() {
        const client = await this.connect();
        try {
            const res = await client.query('SELECT * FROM game');
            return res.rows;
        } catch (error) {
            console.error('Erro ao obter os dados da tabela', error);
            throw error;
        } finally {
            client.release();
        }
    }

}

module.exports = ConnectDB;