// Geralmente main.js ou game.js
import { Start } from './Start.js';

const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 1024,
    // --- ESTE É O ITEM 2 ---
    scale: {
        mode: Phaser.Scale.FIT, // Faz o jogo caber na tela do celular
        autoCenter: Phaser.Scale.CENTER_BOTH // Centraliza o jogo na tela
    },
    parent: 'game-container', // O ID da div no seu index.html
    scene: [Start], // Sua cena principal
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 } }
    }
};

const game = new Phaser.Game(config);