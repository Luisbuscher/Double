INFORMACOES IMPORTANTES:

    Nota 1: Evite alterar qualquer coisa na pasta "script_main", risco de conflito e erro!

ETAPAS PARA ATUALIZAR NO SERVIDOR AS ALTERAÇÕES. ABRA O CMD/TERMINAL E INSIRA OS SEGUINTES COMANDOS POR PARTES:

    ssh root@206.189.184.10

PASSO 2:

    <INSIRA A SENHA>

PASSO 3:

    cd /var/www/double.nivrixapi.com/httpdocs

PASSO 4:

    rm -r public

PASSO 5:

    git clone https://github.com/double-nixem/public