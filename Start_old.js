export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        // aqui carrega a página de fundo TODO
        //this.load.image('background', 'assets/space.png');
        //  The ship sprite is CC0 from https://ansimuz.itch.io - check out his other work!
        //this.load.spritesheet('ship', 'assets/spaceship.png', { frameWidth: 176, frameHeight: 96 });
    }

    create() {
        // 1. Inicialização de variáveis (Igual ao seu)
        this.jogoRodando = false;
        this.pontos = 0;
        this.tempoInicioPergunta = 0;
        this.perguntaAtual = { n1: 0, n2: 0, resposta: 0 };

        // 2. Criar Elementos da Interface (HUD)
        this.textoPontos = this.add.text(20, 20, "Pontos: 0", { fontSize: "24px", fill: "#ffffff" });
        this.barraFundo = this.add.rectangle(400, 80, 400, 20, 0x333333);
        this.barraTempo = this.add.rectangle(200, 80, 400, 20, 0x00ff00).setOrigin(0, 0.5);

        // 3. Criar Texto da Pergunta
        this.textoPergunta = this.add.text(400, 150, "", { fontSize: "64px", fill: "#ffffff" }).setOrigin(0.5);

        // 4. Criar os 4 Botões de Resposta (Apenas uma vez!)
        this.botoes = [];
        for (let i = 0; i < 4; i++) {
            let btn = this.add.text(400, 300 + (i * 70), "", {
                fontSize: "32px",
                backgroundColor: "#222222",
                padding: { x: 20, y: 10 },
                fill: '#0f0'
            })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true });

            btn.on('pointerdown', () => this.checarResposta(btn.text));
            this.botoes.push(btn);
        }

        // --- ESTADO INICIAL (ESCONDER TUDO) ---
        this.textoPergunta.setVisible(false);
        this.barraFundo.setVisible(false);
        this.barraTempo.setVisible(false);
        this.botoes.forEach(btn => btn.setVisible(false)); // ESCONDE OS BOTÕES

        // 5. Criar o Botão de Play (Fica por cima de tudo)
        this.btnPlay = this.add.text(400, 300, 'CLIQUE PARA COMEÇAR', {
            fontSize: '40px',
            fill: '#0f0',
            backgroundColor: '#000',
            padding: 20
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // Lógica do Clique no Play
        this.btnPlay.on('pointerdown', () => {
            this.btnPlay.setVisible(false); // Some o botão play

            // Aparece o jogo
            this.textoPergunta.setVisible(true);
            this.barraFundo.setVisible(true);
            this.barraTempo.setVisible(true);
            this.botoes.forEach(btn => btn.setVisible(true)); // MOSTRA OS BOTÕES

            this.jogoRodando = true;
            this.proximaPergunta(); // Só aqui o jogo começa de fato!
        });
        // No final do seu create()
        this.textoFeedback = this.add.text(400, 250, "", {
            fontSize: "48px",
            fontWeight: "bold"
        }).setOrigin(0.5).setVisible(false);
        //novo código para criar as fases!
        this.nivel = 1;
        this.acertosNoNivel = 0;
        this.metasDeAcerto = 4; // Agora precisa de 10 acertos para mudar de fase

        this.textoLevelUp = this.add.text(400, 300, "LEVEL UP!", {
            fontSize: "80px", fill: "#ffff00", fontWeight: "bold"
        }).setOrigin(0.5).setVisible(false).setDepth(10);

        this.vidas = 7; // O jogador começa com 7 chances
        this.textoVidas = this.add.text(650, 20, "Vidas: ❤️❤️❤️❤️❤️❤️❤️", {
            fontSize: "24px",
            fill: "#ffffff"
        });
    }
    // --- AS SUAS FUNÇÕES ENTRAM AQUI ---

    proximaPergunta() {
        // Cálculo da dificuldade baseada no nível
        // Começa em 4 e aumenta de 2 em 2
        let limiteSuperior = 4 + (this.nivel - 1) * 2;

        let n1 = Phaser.Math.Between(1, limiteSuperior);
        let n2 = Phaser.Math.Between(1, limiteSuperior);
        this.perguntaAtual.n1 = n1;
        this.perguntaAtual.n2 = n2;
        this.perguntaAtual.resposta = n1 + n2;

        this.textoPergunta.setText(`${n1} + ${n2}`);
        //fim dos níveis

        let opcoes = [this.perguntaAtual.resposta];
        while (opcoes.length < 4) {
            let errada = this.perguntaAtual.resposta + Phaser.Math.Between(-5, 5);
            if (!opcoes.includes(errada) && errada >= 0) {
                opcoes.push(errada);
            }
            // Pega o tempo atual do motor do jogo em milissegundos
            this.tempoInicioPergunta = this.time.now;
        }

        Phaser.Utils.Array.Shuffle(opcoes);

        for (let i = 0; i < 4; i++) {
            this.botoes[i].setText(opcoes[i]);
        }
        //fases
        this.tempoInicioPergunta = this.time.now;
    }

    checarResposta(valorSelecionado) {
        if (!this.jogoRodando) return;

        this.jogoRodando = false;
        let momentoDoClique = this.time.now;
        let tempoDecorrido = momentoDoClique - this.tempoInicioPergunta;

        let pontosGanhos = 0;
        let acertou = parseInt(valorSelecionado) === this.perguntaAtual.resposta;

        if (acertou) {
            // 1. Calcula os pontos (mesmo que vá subir de nível)
            pontosGanhos = Math.floor(100 * (1 - (tempoDecorrido / 5000)));
            if (pontosGanhos < 10) pontosGanhos = 10;
            this.mostrarFeedback(`+${pontosGanhos}`, "#00ff00");
            this.cameras.main.flash(200, 0, 255, 0);

            // COMPUTAR O ACERTO AQUI
            this.acertosNoNivel++;
        } else {
            pontosGanhos = -50;
            this.vidas--; // Tira uma vida

            // Atualiza o texto das vidas (usando um truque simples de repetição)
            let coracoes = "";
            for (let i = 0; i < this.vidas; i++) coracoes += "❤️";
            this.textoVidas.setText("Vidas: " + coracoes);

            this.mostrarFeedback(`${pontosGanhos}`, "#ff0000");
            this.cameras.main.shake(200, 0.02);

            // Checa se o jogo acabou
            if (this.vidas <= 0) {
                this.gameOver();
                return; // Interrompe para não chamar a próxima pergunta
            }
        }

        // 2. DISPARA A ANIMAÇÃO DO PONTO VOANDO (Sempre acontece)
        this.time.delayedCall(1000, () => {
            this.tweens.add({
                targets: this.textoFeedback,
                x: 20, y: 20, scale: 0.5,
                duration: 400,
                ease: 'Power2',
                onComplete: () => {
                    this.textoFeedback.setVisible(false);
                    this.pontos += pontosGanhos;
                    if (this.pontos < 0) this.pontos = 0;
                    this.textoPontos.setText("Pontos: " + this.pontos);
                }
            });
        });

        // 3. DECISÃO DE FLUXO (Próxima pergunta OU Próxima Fase)
        if (acertou && this.acertosNoNivel >= this.metasDeAcerto) {
            // Se atingiu a meta, espera o tempo de leitura e sobe de nível
            this.time.delayedCall(1500, () => {
                this.subirDeNivel();
            });
        } else {
            // Se não atingiu a meta (ou se errou), segue o fluxo normal
            this.time.delayedCall(1500, () => {
                this.jogoRodando = true;
                this.proximaPergunta();
            });
        }
    }

    subirDeNivel() {
        this.nivel++;
        this.acertosNoNivel = 0;
        this.jogoRodando = false;

        // Mostra o aviso de Level Up
        this.textoLevelUp.setText("NÍVEL " + this.nivel);
        this.textoLevelUp.setVisible(true);
        this.textoLevelUp.setScale(0);

        // Animação estilo Flash (Zoom in e Out)
        this.tweens.add({
            targets: this.textoLevelUp,
            scale: 1.2,
            duration: 1000,
            ease: 'Back.easeOut',
            yoyo: true, // Vai e volta
            onComplete: () => {
                this.textoLevelUp.setVisible(false);
                this.jogoRodando = true;
                this.proximaPergunta();
            }
        });
    }

    mostrarFeedback(valor, cor) {
        this.textoFeedback.setText(valor);
        this.textoFeedback.setTint(Phaser.Display.Color.HexStringToColor(cor).color);
        this.textoFeedback.setPosition(400, 250); // Volta para o centro
        this.textoFeedback.setScale(1);
        this.textoFeedback.setVisible(true);
        this.textoFeedback.setAlpha(1);
    }

    update(time, delta) {
        if (!this.jogoRodando) return;

        if (this.tempoInicioPergunta > 0) {
            // CÁLCULO DA DIFICULDADE:
            // Começa em 5000ms e perde 200ms por nível. 
            // Math.max garante que o tempo nunca seja menor que 1.5 segundos (1500ms).
            let tempoMaximoNivel = Math.max(2000, 5000 - (this.nivel - 1) * 100);

            let tempoDecorrido = time - this.tempoInicioPergunta;
            let tempoRestante = tempoMaximoNivel - tempoDecorrido;

            // Calcula a largura proporcional baseada no tempo do nível atual
            let novaLargura = (tempoRestante / tempoMaximoNivel) * 400;

            if (novaLargura > 0) {
                this.barraTempo.width = novaLargura;

                // Fica vermelho quando falta 30% do tempo
                if (tempoRestante < (tempoMaximoNivel * 0.3)) {
                    this.barraTempo.setFillStyle(0xff0000);
                } else {
                    this.barraTempo.setFillStyle(0x00ff00);
                }
            }

            // Lógica de Erro por tempo (agora usando o tempo dinâmico do nível)
            if (tempoDecorrido > tempoMaximoNivel) {
                // Chamamos a checarResposta com um valor que sabemos que vai dar erro
                // para disparar toda aquela animação de perda de pontos que criamos.
                this.checarResposta("ERRO_TEMPO");
            }
        }
    }

    gameOver() {
    this.jogoRodando = false;
    this.textoVidas.setText("Vidas: GONE");

    // Cria um fundo escuro para o Game Over
    let overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
    
    this.add.text(400, 250, "FIM DE JOGO", { 
        fontSize: "64px", fill: "#ff0000", fontWeight: "bold" 
    }).setOrigin(0.5);

    this.add.text(400, 350, `Pontuação Final: ${this.pontos}`, { 
        fontSize: "32px", fill: "#ffffff" 
    }).setOrigin(0.5);

    // Botão para Reiniciar
    let btnReiniciar = this.add.text(400, 450, "JOGAR NOVAMENTE", { 
        fontSize: "28px", fill: "#00ff00", backgroundColor: "#222", padding: 15
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btnReiniciar.on('pointerdown', () => {
        // Reinicia a cena do zero
        this.scene.restart();
    });
}
}

