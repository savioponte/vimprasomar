import { Logic } from './Logic.js';
import { HUD } from './HUD.js';
import { UIManager } from './UIManager.js';

export class Start extends Phaser.Scene {
    constructor() { super('Start'); }

    preload() {
        this.load.image('fundo_futurista', 'assets/bg.png');
        this.load.image('robo_mestre', 'assets/robo.png');
        this.load.image('robo_ok', 'assets/robo_feliz.png');
        this.load.image('robo_erro', 'assets/robo_triste.png');
        this.load.image('fumaca', 'assets/fumaca.png');
        this.load.image('moldura_placar', 'assets/placar_relogio.png');
        this.load.image('barra_vidas', 'assets/vidas.png');
        this.load.image('tubo_soma', 'assets/tubo_vidro.png');
        this.load.image('banner_levelup', 'assets/levelup.png');
        this.load.image('moldura_resultado', 'assets/moldura_resultado.png');
        this.load.image('moldura_botao', 'assets/moldura_botao.png');
        this.load.font('pincel', 'assets/HeyAugust.ttf');
        this.load.font('parcelas', 'assets/SevenSegment.ttf');
        this.load.image('coracao', 'assets/coracao.png');
        this.load.image('logo', 'assets/logo.png');
        this.load.atlas('iconeSoma', 'assets/plus.png', 'assets/plus.json');
        this.load.atlas('raios', 'assets/raios_menores.png', 'assets/raios_menores.json');
        this.load.atlas('raiosg', 'assets/raios_maiores.png', 'assets/raios_maiores.json');
        this.load.image('score_colors', 'assets/score_colors.png');
        this.load.image('score_nocolors', 'assets/score_nocolors.png');
        this.load.image('vidas_todas', 'assets/vidas_todas.png');
        this.load.image('vidas_nenhuma', 'assets/vidas_nenhuma.png');
    }

    create() {
        // 1. Variáveis de Controle
        this.pontos = 0;
        this.nivel = 1;
        this.vidas = 7;
        this.jogoRodando = false;
        this.acertosNoNivel = 0;
        this.metasDeAcerto = 2;
        this.botoes = [];

        const CX = this.cameras.main.centerX;
        const CY = this.cameras.main.centerY;

        // 2. Definição de Animações (Sempre antes de usar o .play)
        if (!this.anims.exists('energia_ociosa')) {
            this.anims.create({
                key: 'energia_ociosa',
                frames: this.anims.generateFrameNames('raios', {
                    prefix: 'raio',
                    start: 1,
                    end: 6,
                    suffix: '.png'
                }),
                frameRate: 12,
                repeat: -1
            });
        }

        // 3. Fundo e Assets Estáticos
        this.add.image(CX, CY, 'fundo_futurista').setDisplaySize(600, 1024);

        // 4. Personagens e Objetos (Criar ANTES dos raios para ter as coordenadas X,Y)
        // --- 3. ROBÔ (Mais para dentro e mais para baixo) ---
        // CX + 150 traz ele da borda para dentro. 
        // CY + 150 (aprox. 660) coloca ele na parte inferior direita sem tapar os tubos.
        // --- 4. ROBÔ (Mais para baixo e para o canto para não colidir) ---
        // X: CX + 180 (puxa mais para a direita) | Y: 750 (coloca ele bem abaixo dos tubos)
        this.robo = this.add.image(CX + 180, 750, 'robo_mestre').setScale(0.8).setVisible(false).setDepth(20);
        // Aumentamos a escala de 0.7 para 0.9. 
        // Ajustamos o X para ficarem simétricos em relação ao centro (CX - 110 e CX + 110)
        // --- 1. TUBOS DE VIDRO (Mais afastados para dar espaço ao sinal de +) ---
        // Mudamos de 110 para 160 de distância do centro
        this.tuboEsq = this.add.image(CX - 160, 350, 'tubo_soma').setScale(0.9).setVisible(false).setDepth(25);
        this.tuboDir = this.add.image(CX + 160, 350, 'tubo_soma').setScale(0.9).setVisible(false).setDepth(25);
        // --- 2. BOX DE RESPOSTA (Puxado para a Esquerda) ---
        // Antes estava em CX - 50, agora colocamos em CX - 110 para alinhar verticalmente com o tubo esquerdo
        // Ou em CX - 150 se quiser ele bem mais para o canto. Vou sugerir CX - 110 para manter harmonia.
        // --- 3. BOX DE RESPOSTA (Alinhado com o tubo da esquerda) ---
        this.result = this.add.image(CX - 160, 520, 'moldura_resultado').setScale(0.7).setVisible(false).setDepth(25);

        // 5. Agora sim, os Raios (usando as posições dos tubos)
        this.raioTuboEsq = this.add.sprite(this.tuboEsq.x, this.tuboEsq.y, 'raios')
            .setDepth(23).setScale(this.tuboEsq.scale * 1.2).setAlpha(0.6)
            .setVisible(false).play('energia_ociosa');

        this.raioTuboDir = this.add.sprite(this.tuboDir.x, this.tuboDir.y, 'raios')
            .setDepth(23).setScale(this.tuboDir.scale * 1.2).setAlpha(0.6)
            .setVisible(false).play('energia_ociosa');

        this.raioResult = this.add.sprite(this.result.x, this.result.y, 'raios')
            .setDepth(23).setScale(this.result.scale * 1.3).setAlpha(0.6)
            .setVisible(false).play('energia_ociosa');

        // 6. Managers e Restante da UI
        this.ui = new UIManager(this);

        // 3. Displays Escuros (Contraste)
        this.bgDisplay1 = this.add.rectangle(CX - 150, 350, 140, 80, 0x000000, 0.5)
            .setOrigin(0.5).setVisible(false).setDepth(24);
        this.bgDisplay2 = this.add.rectangle(CX + 50, 350, 140, 80, 0x000000, 0.5)
            .setOrigin(0.5).setVisible(false).setDepth(24);

        // Criando os raios para o Tubo Esquerdo
        this.raioTuboEsq = this.add.sprite(this.tuboEsq.x, this.tuboEsq.y, 'raios')
            .setDepth(23)
            .setScale(this.tuboEsq.scale * 1.2) // Um pouco maior que o tubo para aparecer nas bordas
            .setAlpha(0.6) // Deixa sutil para não cansar a vista
            .play('energia_ociosa');

        // Criando os raios para o Tubo Direito
        this.raioTuboDir = this.add.sprite(this.tuboDir.x, this.tuboDir.y, 'raios')
            .setDepth(23)
            .setScale(this.tuboDir.scale * 1.2)
            .setAlpha(0.6)
            .play('energia_ociosa');

        // Criando os raios para o Box de Resposta
        this.raioResult = this.add.sprite(this.result.x, this.result.y, 'raios')
            .setDepth(23)
            .setScale(this.result.scale * 1.3)
            .setAlpha(0.6)
            .play('energia_ociosa');

        // --- 5. REPOSICIONAR RAIOS (Eles devem seguir os novos X e Y) ---
        this.raioTuboEsq.setPosition(this.tuboEsq.x, this.tuboEsq.y).setScale(this.tuboEsq.scale * 1.2);
        this.raioTuboDir.setPosition(this.tuboDir.x, this.tuboDir.y).setScale(this.tuboDir.scale * 1.2);
        this.raioResult.setPosition(this.result.x, this.result.y).setScale(this.result.scale * 1.3);

        // 4. Textos da Pergunta
        const estiloGlow = {
            fontFamily: 'parcelas',
            fontSize: "65px",
            fill: "#00FFFF",
            stroke: "#008B8B",
            strokeThickness: 2,
            shadow: { offsetX: 0, offsetY: 0, color: '#00FFFF', blur: 25, fill: true }
        };

        this.textoN1 = this.add.text(CX - 150, 350, "", estiloGlow).setOrigin(0.5).setVisible(false).setDepth(25);
        this.textoN2 = this.add.text(CX + 50, 350, "", estiloGlow).setOrigin(0.5).setVisible(false).setDepth(25);

        this.sinalMais = this.add.text(CX - 50, 350, "+", {
            fontFamily: 'Arial Black',
            fontSize: "60px",
            fill: "#FFFFFF"
        }).setOrigin(0.5).setVisible(false).setDepth(25);
        // --- 2. SINAL DE MAIS (Centralizado e com espaço) ---
        this.sinalMais.setPosition(CX, this.tuboEsq.y);

        this.boxRespostaTexto = this.add.text(CX - 50, 490, "?", {
            fontFamily: 'parcelas',
            fontSize: "100px",
            fill: "#FFFF00",
            shadow: { blur: 12, color: '#FFFF00', fill: true }
        }).setOrigin(0.5).setVisible(false).setDepth(25);


        // --- 4. AJUSTE DOS TEXTOS (Acompanhando os boxes) ---
        this.textoN1.setPosition(this.tuboEsq.x, this.tuboEsq.y);
        this.textoN2.setPosition(this.tuboDir.x, this.tuboDir.y);
        this.sinalMais.setPosition(CX, 350); // O "+" fica exatamente no centro entre os dois tubos
        this.boxRespostaTexto.setPosition(this.result.x, this.result.y);

        this.raioTuboEsq.setPosition(this.tuboEsq.x, this.tuboEsq.y);
        this.raioTuboDir.setPosition(this.tuboDir.x, this.tuboDir.y);
        this.raioResult.setPosition(this.result.x, this.result.y);



        this.textoFeedback = this.add.text(CX, 450, "", {
            fontFamily: 'Arial Black',
            fontSize: "60px",
            fill: "#E1F5FE",
            stroke: "#000000",
            strokeThickness: 8
        }).setOrigin(0.5).setVisible(false).setDepth(200);

        // 5. Botões e HUD
        this.mostrarBotoes();
        this.botoes.forEach(botao => {
            botao.yOriginal = botao.y;
            botao.setVisible(false);
        });
        //this.hud.setVisibilidade(false);

        // 6. Tela Inicial
        this.logo = this.add.image(CX, 220, 'logo');
        this.logo.setScale(Math.min((600 - 40) / this.logo.width, 1));

        this.textoInstrucoes = this.add.text(CX, 500, "INSTRUÇÕES\n\nResolva rápido!\nErros tiram corações.", {
            fontFamily: 'Arial', fontSize: "26px", fill: "#FFF", align: 'center'
        }).setOrigin(0.5);

        this.btnPlay = this.add.text(CX, 800, ' JOGAR ', {
            fontSize: '80px', fill: '#fff', backgroundColor: '#00008B', padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(100);

        /*this.btnPlay.on('pointerdown', () => {
            this.btnPlay.setScale(0.9);
            this.time.delayedCall(100, () => this.comecarJogo());
        });*/

        this.btnPlay.on('pointerdown', () => {
            // Tenta entrar em tela cheia na primeira interação
            if (!this.scale.isFullscreen) {
                this.scale.startFullscreen();
            }

            this.btnPlay.setScale(0.9);
            this.time.delayedCall(100, () => this.comecarJogo());
        });

        // --- CONFIGURAÇÃO DO RELÓGIO E PLACAR (Agora à Direita) ---
        this.escalaHUD = 0.19; // Ajuste conforme a escala que você escolheu
        const relogioX = 480;  // Exemplo de posição à direita
        const relogioY = 120;

        this.relogioFundo = this.add.image(relogioX, relogioY, 'score_nocolors').setScale(this.escalaHUD);
        this.relogioAceso = this.add.image(relogioX, relogioY, 'score_colors').setScale(this.escalaHUD);

        // Texto com a fonte SevenSegment
        // 1. Mudamos para '0000'
        // 2. Ajustamos o Y (relogioY + 5) para descer o texto para o centro do visor
        this.textoPontos = this.add.text(relogioX, relogioY + 5, '0000', {
            fontFamily: 'parcelas', // Nome que você usou no load.font para SevenSegment.ttf
            fontSize: '32px',       // Ajuste conforme o tamanho do seu relógio
            fill: '#00ffff',
            shadow: { offsetX: 0, offsetY: 0, color: '#00ffff', blur: 10, fill: true }
        }).setOrigin(0.5).setDepth(12);

        // TERCEIRO: Configurar a Máscara do Relógio
        this.maskGraphics = this.add.graphics();
        this.maskGraphics.setVisible(false);
        const mask = new Phaser.Display.Masks.GeometryMask(this, this.maskGraphics);
        this.relogioAceso.setMask(mask);



        // --- CONFIGURAÇÃO DAS VIDAS ---
        this.escalaVidas = 0.6;
        const vidasX = 35; // Ajustado para não sobrepor o relógio
        const vidasY = 35;

        // Criar as imagens de vida
        this.vidasFundo = this.add.image(vidasX, vidasY, 'vidas_nenhuma').setScale(this.escalaVidas).setOrigin(0, 0);
        this.vidasAcesa = this.add.image(vidasX, vidasY, 'vidas_todas').setScale(this.escalaVidas).setOrigin(0, 0);

        // Máscara das vidas
        this.maskVidasGraphics = this.add.graphics();
        this.maskVidasGraphics.setVisible(false);
        const maskVidas = new Phaser.Display.Masks.GeometryMask(this, this.maskVidasGraphics);
        this.vidasAcesa.setMask(maskVidas);

        // Inicializa o visual
        this.atualizarVidasVisuais();

        // Dentro do create(), após carregar os sprites dos raios
        if (!this.anims.exists('energia_ociosa')) { // Evita erro de duplicata se a cena reiniciar
            this.anims.create({
                key: 'energia_ociosa',
                frames: this.anims.generateFrameNames('raios', {
                    prefix: 'raio', // <--- Verifique se no JSON é 'raio_' ou 'raio'
                    start: 1,
                    end: 8,
                    suffix: '' // Se no JSON tiver '.png' no nome do frame, coloque '.png' aqui
                }),
                frameRate: 12,
                repeat: -1
            });
        }
        //animação raios grandes
        if (!this.anims.exists('raio_grande_anim')) {
            this.anims.create({
                key: 'raio_grande_anim',
                frames: this.anims.generateFrameNames('raiosg', {
                    prefix: 'raiog', // Ajuste se o prefixo no JSON for diferente
                    start: 1,
                    end: 6, // Ajuste para o número de frames do seu novo atlas
                    suffix: '.png'
                }),
                frameRate: 30, // Mais rápido para parecer um choque
                hideOnComplete: true // O raio some sozinho quando a animação termina!
            });
        }
        // Os Raios (Atrás de tudo)
        this.raioTuboEsq.setDepth(10);
        this.raioTuboDir.setDepth(10);
        this.raioResult.setDepth(10);

        // O Robô (No meio)
        this.robo.setDepth(20);

        // As molduras dos tubos e resultado
        this.tuboEsq.setDepth(25);
        this.tuboDir.setDepth(25);
        this.result.setDepth(25);

        // Os textos/números (Na frente para ficarem legíveis)
        this.textoN1.setDepth(30);
        this.textoN2.setDepth(30);
        this.boxRespostaTexto.setDepth(30);

        // No final do create()
        this.tweens.killTweensOf(this.robo); // Para garantir que não haja outro tween
        this.robo.setPosition(CX + 130, 565); // Posiciona ele na base

        this.tweens.add({
            targets: this.robo,
            y: 550, // Sobe apenas 15 pixels (de 750 para 735)
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        //esconde várias imagens
        // Esconder o HUD de Vidas

        // EXEMPLE DE CORREÇÃO NA LINHA 232 (ou próximo a ela):
        // Verifique se os nomes batem EXATAMENTE com o que você criou acima
        if (this.vidasFundo) this.vidasFundo.setVisible(false);
        if (this.vidasAcesa) this.vidasAcesa.setVisible(false);

        if (this.relogioFundo) {
            this.relogioFundo.setVisible(false);
            this.relogioAceso.setVisible(false);
            this.textoPontos.setVisible(false);
        }

        // Para os raios, verifique se não os destruiu sem querer
        if (this.raioTuboEsq) this.raioTuboEsq.setVisible(false);
        if (this.raioTuboDir) this.raioTuboDir.setVisible(false);
        if (this.raioResult) this.raioResult.setVisible(false);

    }

    dispararRaiosAcerto() {
        // 1. Criamos apenas UM raio centralizado no box de resultado
        const raio = this.add.sprite(this.result.x, this.result.y, 'raiosg');

        // 2. Configurações Visuais
        // setOrigin(0.5, 0.5) garante que ele exploda a partir do centro do "?"
        raio.setOrigin(0.5, 0.5)
            .setDepth(100)
            .setScale(0.8) // Ajuste para não cobrir o robô
            .setAlpha(0.9)
            .setTint(0x00FFFF); // Garante o ciano neon

        // 3. Toca a animação rápida
        raio.play('raio_grande_anim');

        // 4. Tremer a tela (opcional, dá sensação de impacto)
        this.cameras.main.shake(150, 0.008);
    }

    comecarJogo() {
        this.btnPlay.setVisible(false);
        this.textoInstrucoes.setVisible(false);
        this.logo.setVisible(false);

        // this.hud.atualizarTudo(this.pontos, this.vidas);
        // this.hud.setVisibilidade(true);
        this.botoes.forEach(b => b.setVisible(true));

        this.robo.setVisible(true);
        this.tuboEsq.setVisible(true);
        this.tuboDir.setVisible(true);
        this.result.setVisible(true);
        // this.bgDisplay1.setVisible(true);
        // this.bgDisplay2.setVisible(true);
        this.textoN1.setVisible(true);
        this.textoN2.setVisible(true);
        this.sinalMais.setVisible(true);
        this.boxRespostaTexto.setVisible(true);
        this.raioTuboEsq.setVisible(true);
        this.raioTuboDir.setVisible(true);
        this.raioResult.setVisible(true);
        // Mostrar Vidas
        this.vidasFundo.setVisible(true);
        this.vidasAcesa.setVisible(true);

        // Mostrar Pontos
        this.relogioFundo.setVisible(true);
        this.relogioAceso.setVisible(true);
        this.textoPontos.setVisible(true);

        // Mostrar Raios Menores
        this.raioTuboEsq.setVisible(true);
        this.raioTuboDir.setVisible(true);
        this.raioResult.setVisible(true);

        this.jogoRodando = true;
        this.proximaPergunta();
    }

    proximaPergunta() {
        const pergunta = Logic.gerarPergunta(this.nivel);
        this.perguntaAtual = pergunta;
        this.textoN1.setText(pergunta.n1);
        this.textoN2.setText(pergunta.n2);
        this.boxRespostaTexto.setText("?");
        this.tempoInicioPergunta = this.time.now;
        for (let i = 0; i < 4; i++) {
            this.botoes[i].textoInterno.setText(pergunta.opcoes[i]);
        }
    }

    checarResposta(valorSelecionado) {
        if (!this.jogoRodando) return;
        this.jogoRodando = false;

        const acertou = parseInt(valorSelecionado) === this.perguntaAtual.resposta;
        this.boxRespostaTexto.setText(this.perguntaAtual.resposta);
        this.esconderBotoes();

        let pontosDestaRodada = 0; // Criamos essa variável para passar adiante

        if (acertou) {
            this.boxRespostaTexto.setColor("#00FF00");
            this.dispararRaiosAcerto();

            // CÁLCULO IMEDIATO
            const tempoMax = Math.max(2000, 5000 - (this.nivel - 1) * 100);
            const tempoDecorrido = this.time.now - this.tempoInicioPergunta;
            pontosDestaRodada = Logic.calcularPontos(tempoDecorrido, tempoMax);

            // FEEDBACK IMEDIATO (Junto com o Raio)
            this.exibirFeedback(`+${pontosDestaRodada}`, "#00FF00");

            if (this.textures.exists('robo_ok')) this.robo.setTexture('robo_ok');

            this.tweens.add({
                targets: this.robo,
                y: this.robo.y - 40,
                duration: 200,
                yoyo: true,
                ease: 'Power2'
            });
        } else {
            this.boxRespostaTexto.setColor("#FF0000");
            if (this.textures.exists('robo_erro')) this.robo.setTexture('robo_erro');
            this.criarEfeitoErro();
            pontosDestaRodada = -50;
            this.exibirFeedback("-50", "#FF0000");
        }

        // Agora passamos o valor já calculado para o próximo passo
        this.time.delayedCall(1100, () => {
            this.processarPontuacao(acertou, pontosDestaRodada);
        });
    }

    processarPontuacao(acertou, pontosGanhos) {
        if (acertou) {
            this.acertosNoNivel++;
        } else {
            this.vidas--;
            this.atualizarVidasVisuais();
        }

        // DISPARA A ANIMAÇÃO (O texto que já surgiu no feedback agora 'voa' para o placar)
        this.ui.animarFeedback(this.textoFeedback, 50, 600, () => {
            this.finalizarTurno(pontosGanhos, acertou);
        });
    }

    finalizarTurno(pontosGanhos, acertou) {
        this.pontos = Math.max(0, this.pontos + pontosGanhos);

        // CHAMA A ROLAGEM AQUI (Substituindo o antigo this.hud.rolarPontuacao)
        this.rolarPontuacao(this.pontos);

        if (this.vidas <= 0) {
            this.gameOver();
        } else if (acertou && this.acertosNoNivel >= this.metasDeAcerto) {
            this.ui.mostrarLevelUp(this.nivel + 1, () => {
                this.nivel++;
                this.acertosNoNivel = 0;
                this.prepararNovaRodada();
            });
        } else {
            this.prepararNovaRodada();
        }
    }

    prepararNovaRodada() {
        // Reset visual dos elementos
        this.boxRespostaTexto.setText("?").setColor("#FFFF00");
        this.robo.setTexture('robo_mestre').clearTint(); // Volta ao robô padrão

        this.mostrarBotoes();
        this.botoes.forEach(b => b.setVisible(true));
        this.jogoRodando = true;
        this.proximaPergunta();
    }

    exibirFeedback(txt, cor) {
        // Pegamos a posição do box de resultado como referência
        const posYBox = this.boxRespostaTexto.y;
        const posXBox = this.boxRespostaTexto.x;
        // Resetamos todas as propriedades que a animação anterior alterou
        this.textoFeedback
            .setText(txt)
            .setAlpha(1)
            .setScale(1.2) // Aumentamos um pouco para dar impacto ao surgir
            .setColor(cor)
            // Alteração Crítica: posYBox - 80 faz ele nascer ACIMA do box
            .setPosition(posXBox, posYBox - 80)
            .setVisible(true)
            .setDepth(9999); // Valor extremo para garantir

        // Opcional: Adicionar um contorno para ler melhor
        this.textoFeedback.setStroke('#000000', 6);
    }

    update(time) {
        if (this.jogoRodando && this.tempoInicioPergunta) {
            let tempoDecorrido = time - this.tempoInicioPergunta;
            let limite = 10000;
            let progresso = Math.max(0, 1 - (tempoDecorrido / limite));

            this.maskGraphics.clear();
            this.maskGraphics.fillStyle(0xffffff); // Cor irrelevante, serve apenas para preencher

            const centerX = this.relogioAceso.x;
            const centerY = this.relogioAceso.y;
            const raioMask = (this.relogioAceso.width * this.escalaHUD); // Raio grande para cobrir tudo

            // Lógica:
            // Começa em 90 graus (na posição do robô).
            // Desenha uma fatia que diminui de tamanho conforme o tempo passa.
            const anguloInicio = Phaser.Math.DegToRad(90);
            const anguloFinal = Phaser.Math.DegToRad(90 + (progresso * 360));

            this.maskGraphics.slice(
                centerX,
                centerY,
                raioMask,
                anguloInicio,
                anguloFinal,
                false // Mantenha false para o preenchimento seguir o sentido do relógio
            );

            this.maskGraphics.fillPath();

            if (progresso <= 0) this.checarResposta("FIM_TEMPO");
        }
    }

    mostrarBotoes() {
        this.botoes.forEach(b => b.destroy());
        this.botoes = [];

        const CX = this.cameras.main.centerX;
        const baseYa = 780; // Linha de cima
        const baseYb = 900; // Linha de baixo

        // Definição das posições (x, y) para os 4 botões em grade 2x2
        // Afastamos um pouco para a esquerda (CX - 120) e direita (CX + 120)
        const posicoes = [
            { x: CX - 130, y: baseYa }, { x: CX + 130, y: baseYa },
            { x: CX - 130, y: baseYb }, { x: CX + 130, y: baseYb }
        ];

        for (let i = 0; i < 4; i++) {
            // Passamos 'moldura_botao' como a chave da textura
            let btn = this.ui.criarBotoes(posicoes[i].x, posicoes[i].y, "0", 'moldura_botao', (container) => {
                this.checarResposta(container.textoInterno.text);
            });
            this.botoes.push(btn);
        }
    }

    esconderBotoes() {
        this.botoes.forEach(b => b.setVisible(false));
    }

    gameOver() {
        this.jogoRodando = false;

        // 1. Escurece o fundo
        const bgOverlay = this.add.rectangle(300, 512, 600, 1024, 0x000, 0.85).setDepth(2000);

        // 2. Texto de Fim de Jogo
        this.add.text(300, 400, "FIM DE JOGO", {
            fontFamily: 'Arial Black',
            fontSize: '64px',
            fill: '#FF0000'
        }).setOrigin(0.5).setDepth(2001);

        // 3. Exibe a pontuação final
        this.add.text(300, 500, `PONTOS: ${this.pontos}`, {
            fontFamily: 'parcelas',
            fontSize: '48px',
            fill: '#00FFFF'
        }).setOrigin(0.5).setDepth(2001);

        // 4. Botão REINICIAR
        const btnReiniciar = this.add.text(300, 700, ' JOGAR NOVAMENTE ', {
            fontFamily: 'Arial Black',
            fontSize: '40px',
            fill: '#FFF',
            backgroundColor: '#008B8B',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(2001).setInteractive({ useHandCursor: true });

        // Efeito visual no botão
        btnReiniciar.on('pointerover', () => btnReiniciar.setStyle({ fill: '#FF0' }));
        btnReiniciar.on('pointerout', () => btnReiniciar.setStyle({ fill: '#FFF' }));

        // AÇÃO DO BOTÃO
        btnReiniciar.on('pointerdown', () => {
            // --- TELA CHEIA ---
            // Ativa a tela cheia se o navegador permitir e se já não estiver nela
            if (!this.scale.isFullscreen) {
                this.scale.startFullscreen();
            }

            // --- RESET DO JOGO ---
            this.pontos = 0;
            this.vidas = 7;
            this.nivel = 1;
            this.acertosNoNivel = 0;

            // Reinicia a cena
            this.scene.restart();
        });
    }
    criarEfeitoErro() {
        // Tremer a tela
        this.cameras.main.shake(300, 0.01);

        // Se você tiver o sprite de fumaça, podemos fazer ela subir da cabeça do robô
        const fumaca = this.add.image(this.robo.x, this.robo.y - 50, 'fumaca')
            .setAlpha(0.8)
            .setScale(0.1);

        this.tweens.add({
            targets: fumaca,
            y: fumaca.y - 100,
            x: fumaca.x + (Math.random() * 40 - 20),
            scale: 0.8,
            alpha: 0,
            duration: 800,
            onComplete: () => fumaca.destroy()
        });

        // Colocar um "X" vermelho gigante em cima do box por um segundo
        const xErro = this.add.text(this.boxRespostaTexto.x, this.boxRespostaTexto.y, "X", {
            fontSize: '120px',
            fill: '#ff0000',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5).setDepth(100);

        this.time.delayedCall(500, () => xErro.destroy());
    }
    atualizarVidasVisuais() {
        if (!this.maskVidasGraphics || !this.vidasAcesa) return;

        this.maskVidasGraphics.clear();
        this.maskVidasGraphics.fillStyle(0xffffff);

        const largTotal = this.vidasAcesa.width * this.escalaVidas;
        const altTotal = this.vidasAcesa.height * this.escalaVidas;

        // --- AJUSTE FINO ---
        // Se está sobrando pixels no final, aumentamos o offset ou diminuímos a área útil.
        // Tente mudar de 0.26 para 0.265 para empurrar o início do corte 
        const offsetEsquerdo = largTotal * 0.272;

        // Diminuímos levemente a área útil (ex: de 0.72 para 0.69) 
        // para que cada "salto" de 1/7 seja menor.
        const areaUtilVidas = largTotal * 0.69;

        const porcentagemVidas = Math.max(0, this.vidas / 7);
        const larguraRevelada = areaUtilVidas * porcentagemVidas;

        this.maskVidasGraphics.fillRect(
            this.vidasAcesa.x,
            this.vidasAcesa.y,
            offsetEsquerdo + larguraRevelada,
            altTotal
        );
    }
    rolarPontuacao(pontosFinais) {
        if (this.counterTween) this.counterTween.stop();

        const valorAtual = parseInt(this.textoPontos.text) || 0;
        const timerObjeto = { valor: valorAtual };

        // Efeito Visual: Aumenta o brilho (Glow) durante a contagem
        this.textoPontos.setShadow(0, 0, '#00ffff', 25, true);
        this.textoPontos.setColor('#ffffff'); // Fica branco (quente) durante a soma

        this.counterTween = this.tweens.add({
            targets: timerObjeto,
            valor: pontosFinais,
            duration: 600,
            ease: 'Cubic.out', // Começa rápido e desacelera no final (efeito premium)
            onUpdate: () => {
                const numeroSendoSomado = Math.floor(timerObjeto.valor);
                this.textoPontos.setText(String(numeroSendoSomado).padStart(4, '0'));

                // Pequeno tremor aleatório no texto enquanto soma (energia instável)
                this.textoPontos.x = 480 + (Math.random() * 2 - 1);
            },
            onComplete: () => {
                this.textoPontos.setText(String(pontosFinais).padStart(4, '0'));
                this.textoPontos.x = 480; // Reseta posição

                // Volta para o Ciano e brilho suave original
                this.textoPontos.setColor('#00ffff');
                this.textoPontos.setShadow(0, 0, '#00ffff', 10, true);

                // Um pulo final de satisfação
                this.tweens.add({
                    targets: this.textoPontos,
                    scale: 1.2,
                    duration: 100,
                    yoyo: true
                });
            }
        });
    }
}
