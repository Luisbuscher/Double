ETAPAS PARA ATUALIZAR NO SERVIDOR AS ALTERAÇÕES. ABRA O CMD/TERMINAL E INSIRA OS SEGUINTES COMANDOS POR PARTES:

    ssh root@206.189.184.10

PASSO 2:

    <INSIRA A SENHA>

PASSO 3:

    cd /var/www/double.nivrixapi.com/httpdocs

PASSO 4:

    find . -mindepth 1 -maxdepth 1 ! -name "public" ! -name "node_modules" -exec rm -r {} \;

PASSO 5:

    git clone https://github.com/double-nixem/backend

PASSO 6:

    cd backend

PASSO 7:

    mv * ..

PASSO 8:

    cd ..

PASSO 9:

    rm -r backend

PASSO 10:

    npm install

ULTIMO PASSO:

    pm2 restart all