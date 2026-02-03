export class Logic {
    static gerarPergunta(nivel) {
        // Aumenta o range de 2 em 2 começando de 4
        const limiteSuperior = 4 + (nivel - 1) * 2;
        const n1 = Math.floor(Math.random() * limiteSuperior) + 1;
        const n2 = Math.floor(Math.random() * limiteSuperior) + 1;
        const resposta = n1 + n2;

        let opcoes = [resposta];
        while (opcoes.length < 4) {
            // Gera erro entre -10 e +10, evitando números negativos
            let errada = resposta + (Math.floor(Math.random() * 21) - 10);
            if (!opcoes.includes(errada) && errada >= 0 && errada !== resposta) {
                opcoes.push(errada);
            }
        }
        
        // Embaralha o array de opções
        opcoes.sort(() => Math.random() - 0.5);

        return { n1, n2, resposta, opcoes };
    }

    static calcularPontos(tempoDecorrido, tempoMaximo) {
        let pontos = Math.floor(100 * (1 - (tempoDecorrido / tempoMaximo)));
        return Math.max(10, pontos); // Mínimo de 10 pontos
    }
}