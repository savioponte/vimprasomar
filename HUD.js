// HUD.js
export class HUD {
    constructor(scene) {
        this.scene = scene;

        // 1. Cria as animações (se ainda não foram criadas pela cena)
        if (!scene.anims.exists('soma_pulso')) {
            scene.anims.create({
                key: 'soma_pulso',
                frames: scene.anims.generateFrameNames('iconeSoma', {
                    prefix: '', start: 0, end: 42, suffix: '.png', zeroPad: 4
                }),
                frameRate: 30,
                repeat: -1
            });
        }

        if (!scene.anims.exists('soma_vitoria')) {
            scene.anims.create({
                key: 'soma_vitoria',
                frames: scene.anims.generateFrameNames('iconeSoma', {
                    prefix: '', start: 42, end: 84, suffix: '.png', zeroPad: 4
                }),
                frameRate: 30,
                repeat: 0
            });
        }

        // 2. Adiciona o Sprite na tela (substituindo o texto "Pontos:")
        this.iconeSoma = scene.add.sprite(70, 70, 'iconeSoma').setScale(0.4);
        this.iconeSoma.play('soma_pulso');
        this.iconeSoma.setVisible(false);

        // 3. O texto dos pontos agora fica ao lado do ícone
        this.textoPontos = scene.add.text(120, 45, "0", {
            fontSize: "48px",
            fill: '#01579B',       // Azul Escuro
            stroke: '#4FC3F7',     // Azul Médio (faz o número "vibrar" no fundo claro)
            strokeThickness: 8,         // Espessura proporcional ao tamanho da fonte
            fontWeight: "900",
            fontFamily: 'Arial Black' // Ou a fonte que você preferir
        });
        //fim da animação soma
        //o fundo geral
        const CX = scene.cameras.main.centerX;
        scene.cameras.main.setBackgroundColor('#E1F5FE');

        //this.textoPontos = scene.add.text(20, 20, "", {
        //fontSize: "24px", fill: "#000", fontWeight: "bold"
        //});

        // Criar Grupo de Corações
        this.grupoVidas = scene.add.group();

        const tamanhoCoracao = 30; // O tamanho final que queremos na tela (em pixels)
        const espacamento = 12;    // Espaço entre um coração e outro

        for (let i = 0; i < 7; i++) {
            // Cálculo do X: Margem inicial (40) + posição (i) * (largura + espaço)
            const posX = 285 + (i * (tamanhoCoracao + espacamento));

            // 0.08 de 500px resulta em 40px. Ajuste se ainda achar grande.
            const coracao = scene.add.image(posX, 70, 'coracao').setScale(0.065);

            this.grupoVidas.add(coracao);
        }

        this.barraTempo = scene.add.rectangle(CX - 280, 20, 560, 6, 0xFFD54F).setOrigin(0, 0);
        this.barraTempo.setDepth(1001); // Para ficar em cima da moldura ou logo abaixo

        this.setVisibilidade(false);

        // a moldura
        // No constructor do seu HUD ou na função create do Start
        this.moldura = scene.add.graphics();

        // Defina a cor de fundo desejada para a cena
        const corBorda = 0x81D4FA; // Exemplo: um verde escuro "sombra"
        const espessura = 20;      // Uma borda bem grossa estilo Duolingo

        this.moldura.lineStyle(espessura, corBorda, 1);

        // Desenhamos recuando metade da espessura para a borda ficar toda visível
        // (x, y, largura, altura)
        this.moldura.strokeRect(
            espessura / 2,
            espessura / 2,
            600 - espessura,
            1024 - espessura
        );
        this.moldura.lineStyle(0); // Reseta linha
        this.moldura.fillStyle(corBorda, 0.3); // Uma sombra sutil
        // Um retângulo fino na base para dar peso
        this.moldura.fillRect(0, 1024 - espessura, 600, espessura);
    }

    // A FUNÇÃO QUE ESTAVA FALTANDO:
    atualizarTudo(pontos, vidas) {
        this.atualizarPontos(pontos);
        this.atualizarVidas(vidas);
    }

    atualizarPontos(valor) {
        //this.textoPontos.setText(`Pontos: ${valor}`);
        this.textoPontos.setText(valor);
    }

    // Método para disparar o rodopio quando acertar
    animarAcerto() {
        this.iconeSoma.play('soma_vitoria');

        // Quando terminar o rodopio, volta a pulsar
        this.iconeSoma.once('animationcomplete', () => {
            this.iconeSoma.play('soma_pulso');
        });
    }

    atualizarVidas(quantidade) {
        const coracoes = this.grupoVidas.getChildren();
        coracoes.forEach((c, index) => {
            // Só fica visível se o índice for menor que as vidas e se o HUD estiver visível
            c.setVisible(index < quantidade);
        });
    }

    atualizarBarra(porcentagem, corOriginal) {
        // 1. Aumentamos para 560 para ocupar quase toda a largura interna da moldura
        // 2. Ignoramos o parâmetro 'corOriginal' e fixamos um amarelo Duolingo (0xFFD54F)
        this.barraTempo.width = Math.max(0, porcentagem * 560);
        //this.barraTempo.setFillStyle(0xFFD54F);
        this.barraTempo.setFillStyle(0x01579B);
    }

    setVisibilidade(visivel) {
        //this.barraFundo.setVisible(visivel);
        this.barraTempo.setVisible(visivel);
        //this.bordaBarra.setVisible(visivel);
        this.textoPontos.setVisible(visivel);
        this.iconeSoma.setVisible(visivel);

        // Garante que o grupo de corações siga a visibilidade do HUD
        const coracoes = this.grupoVidas.getChildren();
        coracoes.forEach(c => c.setVisible(visivel));

        // Se estiver tornando visível, precisamos re-checar quantos corações aparecem
        if (visivel && this.scene.vidas !== undefined) {
            this.atualizarVidas(this.scene.vidas);
        }
    }
    // Método para disparar o rodopio quando acertar
    animarAcerto() {
        this.iconeSoma.play('soma_vitoria');

        // Quando terminar o rodopio, volta a pulsar
        this.iconeSoma.once('animationcomplete', () => {
            this.iconeSoma.play('soma_pulso');
        });
    }
    rolarPontuacao(novoValorTotal) {
        // Se já houver um evento de contagem rodando, paramos ele para não encavalar
        if (this.timerPontos) this.timerPontos.remove();

        // Criamos um evento que roda a cada 50ms para animar os dígitos
        this.timerPontos = this.scene.time.addEvent({
            delay: 50,
            repeat: -1,
            callback: () => {
                // Se o valor visual ainda é menor que o total real
                if (this.pontosVisuais < novoValorTotal) {

                    // Calculamos a diferença
                    let diferenca = novoValorTotal - this.pontosVisuais;

                    // Se a diferença for grande, sobe rápido. Se for pequena, sobe de 1 em 1.
                    // Isso mantém a animação "viva" e precisa.
                    let incremento = Math.ceil(diferenca / 5);

                    this.pontosVisuais += incremento;

                    // Formata com 4 dígitos usando o SevenSegment
                    const display = String(this.pontosVisuais).padStart(4, '0');
                    this.scene.textoPontos.setText(display);

                } else {
                    // Quando empatar ou passar (por segurança), finaliza no valor exato
                    this.pontosVisuais = novoValorTotal;
                    const displayFinal = String(this.pontosVisuais).padStart(4, '0');
                    this.scene.textoPontos.setText(displayFinal);

                    this.timerPontos.remove();
                }
            }
        });
    }
}