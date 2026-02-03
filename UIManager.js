export class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.CX = scene.cameras.main.centerX;
        this.CY = scene.cameras.main.centerY;
    }


    criarBotoes(x, y, texto, chaveImagem, callback) {
        const container = this.scene.add.container(x, y);

        const bg = this.scene.add.image(0, 0, chaveImagem).setScale(0.7);

        const txt = this.scene.add.text(0, 0, texto, {
           // fontFamily: 'Arial Black', // Ou 'pincel' se preferir a HeyAugust
            fontFamily: 'pincel', // Ou 'pincel' se preferir a HeyAugust
            fontSize: '75px',
            fill: '#001a1a', // Um azul quase preto para dar contraste máximo
            stroke: '#00ffff', // Um contorno ciano fininho para brilhar
            strokeThickness: 1,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#00ffff',
                blur: 8,
                fill: true
            }
        }).setOrigin(0.5);

        container.add([bg, txt]);
        container.textoInterno = txt;

        // Torna interativo
        bg.setInteractive({ useHandCursor: true });

        // Feedback visual ao clicar (o botão diminui um pouco)
        bg.on('pointerdown', () => {
            this.scene.tweens.add({
                targets: container,
                scale: 0.95,
                duration: 80,
                yoyo: true,
                onComplete: () => callback(container)
            });
        });

        return container;
    }

    animarFeedback(objeto, destinoX, destinoY, onComplete) {
        objeto.setDepth(9999);
        this.scene.tweens.add({
            targets: objeto,
            //x: destinoX, y: destinoY,
            x: 520, // Coordenada X do seu relógio (ajuste se mudou)
            y: 80,  // Coordenada Y do seu relógio
            delay: 200,
            scale: 0.5, alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: onComplete
        });
    }

    mostrarLevelUp(proximoNivel, callback) {
        const CX = this.scene.cameras.main.centerX;

        // 1. Criar a imagem abaixo do marcador de vidas
        // Y: 220 costuma ser uma boa altura para ficar abaixo do HUD superior
        const banner = this.scene.add.image(CX, 220, 'banner_levelup')
            .setScale(0) // Começa invisível para o efeito de "surgir"
            .setDepth(2000);

        // 2. Animação de Surgir + Yoyo
        this.scene.tweens.add({
            targets: banner,
            scale: 0.8, // Ajuste a escala final conforme o tamanho da sua imagem
            //ease: 'Back.easeOut', // Efeito de mola ao aparecer
            duration: 500,
            onComplete: () => {
                // Efeito Yoyo sutil enquanto está na tela
                this.scene.tweens.add({
                    targets: banner,
                    y: banner.y + 15,
                    duration: 600,
                    //yoyo: true,
                    //repeat: 2, // Balança um pouco e depois segue
                    onComplete: () => {
                        // Efeito de sumir
                        this.scene.tweens.add({
                            targets: banner,
                            scale: 0,
                            alpha: 0,
                            duration: 300,
                            onComplete: () => {
                                banner.destroy();
                                if (callback) callback();
                            }
                        });
                    }
                });
            }
        });
    }


}