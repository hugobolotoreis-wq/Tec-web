// CONSTANTES

const TAMANHO = 5;              // o tabuleiro é sempre 5 x 5
const COR_HUMANO = "azul";      // o humano joga com as azuis (começam em baixo)
const COR_IA = "vermelha";      // o computador joga com as vermelhas (começam em cima)
const ESPERA = 1100;            // tempo (em ms) entre os passos do computador
const LIMITE_SEM_CAPTURAS = 20; // jogadas seguidas sem capturas para se aceitar empate
const MARGEM = 40;              // distância (px) da borda do tabuleiro à primeira linha
const ESPACO = 80;              // distância (px) entre duas posições vizinhas
const RAIO = 25;                // raio (px) do círculo de cada posição
const ANIMACAO = 300;           // tempo (em ms) que uma peça demora a deslizar

// [variação da linha, variação da coluna]
const DIRECOES_TODAS = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
const DIRECOES_RETAS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
