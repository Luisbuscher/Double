var socket = io();

// Funcao para inserir os card na roleta:
function initWheel() {
    var $wheel = $('.roulette-wrapper .wheel'),
        row = "";

    row += "<div class='row'>";
    row += "  <div class='card red'>1<\/div>";
    row += "  <div class='card black'>2<\/div>";
    row += "  <div class='card red'>3<\/div>";
    row += "  <div class='card black'>4<\/div>";
    row += "  <div class='card red'>5<\/div>";
    row += "  <div class='card black'>6<\/div>";
    row += "  <div class='card red'>7<\/div>";
    row += "  <div class='card black'>8<\/div>";
    row += "  <div class='card red'>9<\/div>";
    row += "  <div class='card black'>10<\/div>";
    row += "  <div class='card red'>11<\/div>";
    row += "  <div class='card black'>12<\/div>";
    row += "  <div class='card red'>13<\/div>";
    row += "  <div class='card black'>14<\/div>";
    row += "  <div class='card white'><img src='simbol.svg' alt='Symbol'><\/div>";
    row += "  <div class='card red'>15<\/div>";
    row += "  <div class='card black'>16<\/div>";
    row += "  <div class='card red'>17<\/div>";
    row += "  <div class='card black'>18<\/div>";
    row += "  <div class='card red'>19<\/div>";
    row += "  <div class='card black'>20<\/div>";
    row += "  <div class='card red'>21<\/div>";
    row += "  <div class='card black'>22<\/div>";
    row += "  <div class='card red'>23<\/div>";
    row += "  <div class='card black'>24<\/div>";
    row += "  <div class='card red'>25<\/div>";
    row += "  <div class='card black'>26<\/div>";
    row += "  <div class='card red'>27<\/div>";
    row += "  <div class='card black'>28<\/div>";
    row += "<\/div>";

    for (var x = 0; x < 29; x++) {
        $wheel.append(row);
    }
}


/////////////////////////////////////////////////////////

// QUANDO CARREGA TODOS ELEMENTOS DA PÁGINA:

$(document).ready(function () {
    // Funcao incial para gerar o carrossel.
    initWheel();

    // DEPENDENCES:
    const socket = io();

    /////////////////////////////////////////////////////////

    // GLOBAL VARIABLES INICIALIZATION:
    var wallet;
    var bet = {
        amount: 0,
        color: ''
    };
    var timerElement = $('.timer');
    var betColorActive = ''; // Para manter o controle de qual cor esta ativa para aposta.
    var totalBetAuto = 0;
    var betAuto = false;


    /////////////////////////////////////////////////////////

    //SOCKETS:

    // Atualiza o valor da carteira:
    socket.on('updateCurrentWallet', (value) => {
        wallet = parseFloat(value);

        // Formata o valor para BRL.
        let formattedWallet = wallet.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        $('.wallet').val(formattedWallet);
    });

    socket.on('updateStats', (dataColor, dataNumber) => {
        createDivStats(dataColor, dataNumber);
    });

    // Atualiza a contagem de tempo para a proxima partida:
    socket.on('countdown', (tempCountdown) => {
        timerElement.show();
        timerElement.text('A roleta inicia em ' + tempCountdown + ' segundos');
        var progressBar = document.getElementById('progressbar');

        // Se você sabe o tempo máximo (em segundos), substitua `maxTime` pelo valor apropriado.
        var maxTime = 16; // Por exemplo, 60 segundos.
        var progress = (tempCountdown / maxTime) * 100;

        // Atualize a barra de progresso.
        progressBar.value = progress;
    });

    // Partida ativa:
    socket.on('play', (result, resultColor) => {
        if (betAuto == true && totalBetAuto > 0) {
            totalBetAuto -= 1;
            $('#inputTotalBet').val(totalBetAuto);
            socket.emit('registerBet', $('.bet-value').val(), betColorActive); // Envia e registra ao servidor a aposta feita.
        }

        timerElement.text('RODANDO...');
        $('.bet-option').addClass('inactive'); // Torna os botões inativos.
        $('.bet').addClass('inactive'); // Torna os botões inativos.
        $('.uk-progress').addClass('apagar-tela');
        spinWheel(result, resultColor); // Chama a funcao para rodar visualmente a roleta.
    });

    // Se a partida acabou:
    socket.on('endPlay', (resultColor, resultNumber) => {
        socket.emit('end', resultColor, resultNumber);
        if (betAuto == true && totalBetAuto <= 0) {
            betAuto = false;
            $('#inputTotalBet').removeClass('inactive'); // Deixa o input ativo novamente.
            $("#stopAutoButton").attr("hidden", true); // Deixa invisivel o botao de aposta automatica.
            $("#betAutoButton").removeAttr("hidden"); // Torna visivel o botao de cancelar aposta automatica.
        }

        // Habilita novamente os botoes de aposta e zera as var globais:
        bet = { amount: 0, color: '' };
        $('.bet-option').removeClass('inactive');
        $('.bet').removeClass('inactive');
        $('.uk-progress').removeClass('apagar-tela');

        resetWheel() // Reseta a roleta para o inicio.
    });


    /////////////////////////////////////////////////////////

    // FUNCTIONS:

    // Funcao para rodar a roleta:
    function spinWheel(outcome, resultColor) {
        var $wheel = $('.roulette-wrapper .wheel'),
            order = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
            position = order.indexOf(outcome) - 2;

        // Determine a posição onde parar.
        var rows = 12,
            card = 75 + 3 * 2,
            landingPosition = (rows * 28 * card) + (position * card);

        var randomize = Math.floor(Math.random() * 75) - (75 / 2);

        landingPosition = landingPosition + randomize;

        var object = {
            x: Math.floor(Math.random() * 50) / 100,
            y: Math.floor(Math.random() * 20) / 100
        };

        $wheel.css({
            'transition-timing-function': 'cubic-bezier(0,' + object.x + ',' + object.y + ',1)',
            'transition-duration': '8s', // Duracao da transacao.
            'transform': 'translate3d(-' + landingPosition + 'px, 0px, 0px)'
        });

        setTimeout(function () {
            // Exibe o resultado no overlay:
            $('.overlay-content').html("Selecionado: " + outcome + " " + resultColor.toUpperCase());
            $('.overlay').fadeIn(500).delay(4500).fadeOut(500);
        }, 8000);
    }

    // Funcao para resetar a roleta:
    function resetWheel() {
        var $wheel = $('.roulette-wrapper .wheel');

        $wheel.css({
            'transition-timing-function': '',
            'transition-duration': '2s',
            'transform': 'translate3d(' + 0 + 'px, 0px, 0px)'
        });
    }


    // Funcao para inserir o historico.
    function createDivStats(dataColor, dataNumber) {

        // Seleciona o elemento pai.
        var statsContainer = document.getElementById("stats");
        let count = 0;

        // Zera o elemento pai para evitar acrescentar o historico e ter blocos repetidos.
        statsContainer.innerHTML = "";

        // Coloca o historico de blocos de cores:
        for (let i = dataColor.length - 1; i > 0; i--) {

            if (dataColor[i] != "") {
                count += 1;

                // Cria as divs internas.
                let div = document.createElement("button");
                div.className = "stats-card";
                div.style.backgroundColor = dataColor[i];
                div.disabled = true;

                let number = document.createElement("span");

                if (dataColor[i] == 'black') {
                    number.style.color = "white";
                } else {
                    number.style.color = "black";
                }

                number.textContent = dataNumber[i];

                // Adiciona o número à div interna.
                div.appendChild(number);

                // Adiciona as divs internas ao elemento pai.
                statsContainer.appendChild(div); // Adiciona o novo card no final do container de estatísticas.
            }

            if (count == 12) {
                return;
            }
        }
    }

    // Funcao para mascara monetaria:
    function moneyMask(inputValue) {

        let valor = inputValue.replace(/[^\d]+/gi, '').split('').reverse().join('');
        let resultado = "";
        let mascara = "##.###.###,##".split('').reverse().join('');

        for (let x = 0, y = 0; x < mascara.length && y < valor.length;) {
            if (mascara.charAt(x) != '#') {
                resultado += mascara.charAt(x);
                x++;
            } else {
                resultado += valor.charAt(y);
                y++;
                x++;
            }
        }

        let resultEnd = resultado.split('').reverse().join('');
        return resultEnd; // Retorna o valor formatado.
    }


    /////////////////////////////////////////////////////////

    // EVENTS:

    // Ao clicar em um dos campos de cores para apostar:
    $('.bet-option').click(function () {
        let betColor = $(this).data('color');
        $('.bet-option').css('border', 'none'); // Remove a borda de todos os botões de aposta.
        $(this).css('border', '2px solid green'); // Define a borda para o botão clicado.
        betColorActive = betColor;
    });

    // Botão para confirmar aposta normal:
    $('#betButton').click(function () {
        if (betColorActive != 'black' && betColorActive != 'cyan' && betColorActive != 'white') { return alert('Cor não selecionada!') }
        socket.emit('registerBet', $('.bet-value').val(), betColorActive); // Envia e registra ao servidor a aposta feita.
        bet.color = betColorActive;
        $('.bet-option').addClass('inactive'); // Torna os botões opacos depois de uma aposta.
        $('.bet').addClass('inactive'); // Torna a div inativa.
    });

    // Mascara monetaria:
    $('.bet-value').on('keyup', function (e) {
        let valueFormated = moneyMask($(this).val());
        $(this).val(valueFormated);
    });

    // Botao de duplicar valor que esta no input:
    $('#duplicateBet').click(function () {
        let value = $('.bet-value').val();
        let valueFormated = value.replace('.', '');
        valueFormated = valueFormated.replace(',', '.');
        valueFormated = parseFloat(valueFormated);
        let result = valueFormated + valueFormated;
        let formattedResult = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(result);
        $('.bet-value').val(formattedResult);
    });

    // Botao de metade valor que esta no input:
    $('#halfBet').click(function () {
        let value = $('.bet-value').val();
        let valueFormated = value.replace('.', '');
        valueFormated = valueFormated.replace(',', '.');
        valueFormated = parseFloat(valueFormated);
        if (valueFormated <= 1) { return }
        let result = valueFormated / 2;
        let formattedResult = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(result);
        $('.bet-value').val(formattedResult);
    });

    // Botão para confirmar aposta automatica:
    $('#betAutoButton').click(function () {
        if (betColorActive != 'black' && betColorActive != 'cyan' && betColorActive != 'white') { return alert('Cor não selecionada!') }
        totalBetAuto = $('#inputTotalBet').val();
        betAuto = true;

        bet.color = betColorActive;
        $('#inputTotalBet').addClass('inactive'); // Deixa o input inativo.
        $("#betAutoButton").attr("hidden", true); // Deixa invisivel o botao de aposta automatica.
        $("#stopAutoButton").removeAttr("hidden"); // Torna visivel o botao de cancelar aposta automatica.
        $('.bet-option').addClass('inactive'); // Torna os botões opacos depois de uma aposta.
        $('.bet').addClass('inactive'); // Torna a div inativa.
    });

    // Botão para cancelar aposta automatica:
    $('#stopAutoButton').click(function () {
        totalBetAuto = 0;
        $('#inputTotalBet').val('0');
        betAuto = false;

        $('#inputTotalBet').removeClass('inactive'); // Deixa o input ativo novamente.
        $("#stopAutoButton").attr("hidden", true); // Deixa invisivel o botao de aposta automatica.
        $("#betAutoButton").removeAttr("hidden"); // Torna visivel o botao de cancelar aposta automatica.
    });

    // PRE-LOADER:
    let animate = setInterval(() => {
        let progressBar = $('#js-progressbar');
        let currentValue = progressBar.val();
        progressBar.val(currentValue + 1);

        if (currentValue >= 349) {
            var url = window.location.href;
            socket.emit('start_game');
            // Esconde o overlay de pre-load.
            $("#preLoadOverlay").hide();
            // Exibe o conteúdo do jogo.
            $("#gameContent").show();
            clearInterval(animate);
        }
    }, 1);

});