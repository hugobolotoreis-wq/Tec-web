// ============================================================
// Alquerque - 1ª entrega de Tecnologias Web
// Jogo do humano (azuis) contra o computador (vermelhas).
// ============================================================


// ========== Constantes ==========

const TAMANHO = 5;              // o tabuleiro é sempre 5 x 5
const COR_HUMANO = "azul";      // o humano joga com as azuis (começam em baixo)
const COR_IA = "vermelha";      // o computador joga com as vermelhas (começam em cima)
const ESPERA = 700;             // tempo (em ms) entre os passos do computador
const LIMITE_SEM_CAPTURAS = 20; // jogadas seguidas sem capturas para se aceitar empate
const MARGEM = 40;              // distância (px) da borda do tabuleiro à primeira linha
const ESPACO = 80;              // distância (px) entre duas posições vizinhas
const RAIO = 25;                // raio (px) do círculo de cada posição
const ANIMACAO = 300;           // tempo (em ms) que uma peça demora a deslizar

// Cada direção é [variação da linha, variação da coluna]
const DIRECOES_TODAS = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
const DIRECOES_RETAS = [[-1, 0], [1, 0], [0, -1], [0, 1]];


// ============================================================
// Classe Position: uma posição (interseção) do tabuleiro
// ============================================================

class Position {
  constructor(linha, coluna) {
    this.linha = linha;
    this.coluna = coluna;
  }

  // Só têm diagonais as posições em que a linha e a coluna são ambas pares ou ambas ímpares
  temDiagonais() {
    return this.linha % 2 === this.coluna % 2;
  }

  // Devolve as direções em que se pode andar a partir daqui (8 ou 4)
  direcoes() {
    if (this.temDiagonais()) {
      return DIRECOES_TODAS;
    } else {
      return DIRECOES_RETAS;
    }
  }

  // Devolve a posição que fica a "passos" casas de distância, na direção dada
  andar(direcao, passos) {
    return new Position(this.linha + direcao[0] * passos, this.coluna + direcao[1] * passos);
  }

  // Diz se a posição está dentro do tabuleiro
  dentro() {
    return this.linha >= 0 && this.linha < TAMANHO && this.coluna >= 0 && this.coluna < TAMANHO;
  }

  // Diz se duas posições são a mesma
  igual(outra) {
    return this.linha === outra.linha && this.coluna === outra.coluna;
  }
}

// Diz se uma lista de posições tem a posição pos
function contemPosicao(lista, pos) {
  for (let i = 0; i < lista.length; i++) {
    if (lista[i].igual(pos)) {
      return true;
    }
  }
  return false;
}


// ============================================================
// Classe Piece: uma peça
// ============================================================

class Piece {
  constructor(cor) {
    this.cor = cor;           // "azul" ou "vermelha"
    this.capturada = false;   // fica true durante uma captura, até ao fim da jogada
  }
}

// Devolve a cor do outro jogador
function corAdversaria(cor) {
  if (cor === COR_HUMANO) {
    return COR_IA;
  } else {
    return COR_HUMANO;
  }
}

// Sentido da "frente": as azuis sobem (linha diminui), as vermelhas descem (linha aumenta)
function sentidoFrente(cor) {
  if (cor === COR_HUMANO) {
    return -1;
  } else {
    return 1;
  }
}

// A última fila de uma cor é a fila onde o adversário começa
function ultimaFila(cor) {
  if (cor === COR_HUMANO) {
    return 0;
  } else {
    return TAMANHO - 1;
  }
}


// ============================================================
// Classe Board: o tabuleiro e as regras das jogadas
// ============================================================

class Board {
  constructor() {
    // casas[linha][coluna] tem uma Piece ou null (vazia)
    this.casas = [];
    for (let l = 0; l < TAMANHO; l++) {
      const linha = [];
      for (let c = 0; c < TAMANHO; c++) {
        linha.push(null);
      }
      this.casas.push(linha);
    }
  }

  // Põe as 24 peças na posição inicial (só o centro fica vazio)
  posicaoInicial() {
    for (let l = 0; l < TAMANHO; l++) {
      for (let c = 0; c < TAMANHO; c++) {
        if (l < 2) {
          this.casas[l][c] = new Piece(COR_IA);
        } else if (l > 2) {
          this.casas[l][c] = new Piece(COR_HUMANO);
        } else if (c < 2) {
          this.casas[l][c] = new Piece(COR_IA);
        } else if (c > 2) {
          this.casas[l][c] = new Piece(COR_HUMANO);
        } else {
          this.casas[l][c] = null;
        }
      }
    }
  }

  obterPeca(pos) {
    return this.casas[pos.linha][pos.coluna];
  }

  removerPeca(pos) {
    this.casas[pos.linha][pos.coluna] = null;
  }

  estaVazia(pos) {
    return this.obterPeca(pos) === null;
  }

  // Passa a peça da origem para o destino
  moverPeca(origem, destino) {
    this.casas[destino.linha][destino.coluna] = this.obterPeca(origem);
    this.removerPeca(origem);
  }

  // Conta as peças de uma cor
  contarPecas(cor) {
    let total = 0;
    for (let l = 0; l < TAMANHO; l++) {
      for (let c = 0; c < TAMANHO; c++) {
        const peca = this.casas[l][c];
        if (peca !== null && peca.cor === cor) {
          total++;
        }
      }
    }
    return total;
  }

  // Movimentos simples (sem captura) da peça que está na origem
  movimentosSimples(origem) {
    const cor = this.obterPeca(origem).cor;
    const direcoes = origem.direcoes();
    const lista = [];
    for (let i = 0; i < direcoes.length; i++) {
      const d = direcoes[i];
      // não pode recuar em direção à sua fila inicial
      if (d[0] === -sentidoFrente(cor)) {
        continue;
      }
      // na última fila só pode andar na horizontal
      if (origem.linha === ultimaFila(cor) && d[0] !== 0) {
        continue;
      }
      const destino = origem.andar(d, 1);
      if (destino.dentro() && this.estaVazia(destino)) {
        lista.push({ origem: origem, caminho: [origem, destino], capturadas: [], tipo: "movimento" });
      }
    }
    return lista;
  }

  // Saltos de captura a partir da posição atual.
  // caminho = posições por onde a peça já passou nesta jogada
  // capturadas = posições das peças já saltadas nesta jogada
  // Devolve uma lista de { destino, saltada }
  saltosPossiveis(atual, cor, caminho, capturadas) {
    const direcoes = atual.direcoes();
    const saltos = [];
    for (let i = 0; i < direcoes.length; i++) {
      const meio = atual.andar(direcoes[i], 1);
      const destino = atual.andar(direcoes[i], 2);
      if (!destino.dentro()) {
        continue;
      }
      const saltada = this.obterPeca(meio);
      // no meio tem de estar uma peça do adversário
      if (saltada === null || saltada.cor === cor) {
        continue;
      }
      // não se pode saltar duas vezes a mesma peça
      if (saltada.capturada || contemPosicao(capturadas, meio)) {
        continue;
      }
      // tem de aterrar numa posição vazia e onde ainda não passou
      if (!this.estaVazia(destino) || contemPosicao(caminho, destino)) {
        continue;
      }
      saltos.push({ destino: destino, saltada: meio });
    }
    return saltos;
  }

  // Procura (de forma recursiva) todas as sequências de captura completas
  // de uma peça. Só guarda a sequência quando já não dá para saltar mais.
  procurarCapturas(origem, cor, caminho, capturadas, resultado) {
    const atual = caminho[caminho.length - 1];
    const saltos = this.saltosPossiveis(atual, cor, caminho, capturadas);

    if (saltos.length === 0) {
      if (capturadas.length > 0) {
        resultado.push({ origem: origem, caminho: caminho.slice(), capturadas: capturadas.slice(), tipo: "captura" });
      }
      return;
    }

    for (let i = 0; i < saltos.length; i++) {
      caminho.push(saltos[i].destino);
      capturadas.push(saltos[i].saltada);
      this.procurarCapturas(origem, cor, caminho, capturadas, resultado);
      // desfaz o salto para experimentar o seguinte
      caminho.pop();
      capturadas.pop();
    }
  }

  // Gera TODAS as jogadas válidas de um jogador (movimentos e capturas).
  // É usada para validar o humano, para a IA e para ver se o jogo acabou.
  gerarJogadas(cor) {
    const jogadas = [];
    for (let l = 0; l < TAMANHO; l++) {
      for (let c = 0; c < TAMANHO; c++) {
        const pos = new Position(l, c);
        const peca = this.obterPeca(pos);
        if (peca !== null && peca.cor === cor && !peca.capturada) {
          const movimentos = this.movimentosSimples(pos);
          for (let i = 0; i < movimentos.length; i++) {
            jogadas.push(movimentos[i]);
          }
          this.procurarCapturas(pos, cor, [pos], [], jogadas);
        }
      }
    }
    return jogadas;
  }

  // Devolve uma cópia do tabuleiro (a IA difícil experimenta jogadas nas cópias)
  copiar() {
    const copia = new Board();
    for (let l = 0; l < TAMANHO; l++) {
      for (let c = 0; c < TAMANHO; c++) {
        const peca = this.casas[l][c];
        if (peca !== null) {
          copia.casas[l][c] = new Piece(peca.cor);
        }
      }
    }
    return copia;
  }

  // Faz uma jogada completa de uma só vez (só usado nas cópias da IA)
  aplicarJogada(jogada) {
    this.moverPeca(jogada.origem, jogada.caminho[jogada.caminho.length - 1]);
    for (let i = 0; i < jogada.capturadas.length; i++) {
      this.removerPeca(jogada.capturadas[i]);
    }
  }

  // Maior número de peças que uma cor consegue capturar numa só jogada
  maiorCaptura(cor) {
    const jogadas = this.gerarJogadas(cor);
    let maximo = 0;
    for (let i = 0; i < jogadas.length; i++) {
      if (jogadas[i].capturadas.length > maximo) {
        maximo = jogadas[i].capturadas.length;
      }
    }
    return maximo;
  }

  // Devolve as posições das peças de uma cor que podem capturar agora
  pecasQuePodemCapturar(cor) {
    const lista = [];
    for (let l = 0; l < TAMANHO; l++) {
      for (let c = 0; c < TAMANHO; c++) {
        const pos = new Position(l, c);
        const peca = this.obterPeca(pos);
        if (peca !== null && peca.cor === cor) {
          if (this.saltosPossiveis(pos, cor, [pos], []).length > 0) {
            lista.push(pos);
          }
        }
      }
    }
    return lista;
  }
}


// ============================================================
// Classe Game: o estado do jogo e o andamento das jogadas
// ============================================================

class Game {
  constructor() {
    this.tabuleiro = new Board();
    this.tabuleiro.posicaoInicial();
    // modos: "esperaJogada", "pecaSelecionada", "capturaMultipla",
    //        "vezComputador" e "fimDeJogo" (também antes de começar)
    this.modo = "fimDeJogo";
    this.jogadorAtual = COR_HUMANO;
    this.nivel = "facil";
    this.jogadas = [];          // jogadas válidas do jogador atual
    this.selecionada = null;    // peça selecionada pelo humano
    this.caminho = [];          // posições por onde a peça passou nesta jogada
    this.capturadas = [];       // peças saltadas nesta jogada
    this.podiamCapturar = [];   // peças do jogador atual que podiam capturar no início da vez
    this.sopraveis = [];        // peças do adversário que o jogador atual pode soprar
    this.jogadasSemCaptura = 0;
    this.computadorPropos = false;    // o computador já propôs empate neste jogo
    this.empateProposto = false;      // a proposta do computador está à espera de resposta
    this.temporizador = null;
    this.aAnimar = false;             // true enquanto uma peça está a deslizar
  }

  // Começa um jogo novo
  iniciar(nivel, humanoComeca) {
    clearTimeout(this.temporizador);
    this.tabuleiro = new Board();
    this.tabuleiro.posicaoInicial();
    this.nivel = nivel;
    this.sopraveis = [];
    this.jogadasSemCaptura = 0;
    this.computadorPropos = false;
    this.empateProposto = false;
    this.aAnimar = false;
    if (humanoComeca) {
      this.jogadorAtual = COR_HUMANO;
    } else {
      this.jogadorAtual = COR_IA;
    }
    this.iniciarVez();
  }

  // Prepara a vez do jogador atual
  iniciarVez() {
    this.selecionada = null;
    this.caminho = [];
    this.capturadas = [];
    this.jogadas = this.tabuleiro.gerarJogadas(this.jogadorAtual);
    this.podiamCapturar = this.tabuleiro.pecasQuePodemCapturar(this.jogadorAtual);
    if (this.jogadorAtual === COR_HUMANO) {
      this.iniciarVezHumano();
    } else {
      this.iniciarVezComputador();
    }
    desenharTabuleiro();
  }

  iniciarVezHumano() {
    // sem jogadas e sem sopro possível: o humano perde
    if (this.jogadas.length === 0 && this.sopraveis.length === 0) {
      this.terminarJogo(COR_IA);
      return;
    }
    this.modo = "esperaJogada";
    let texto = "É a tua vez.";
    if (this.podiamCapturar.length > 0) {
      texto = texto + " Tens capturas (peças com brilho amarelo): se não capturares, podes ser soprado.";
    }
    if (this.sopraveis.length > 0) {
      texto = texto + " Podes soprar uma peça vermelha (clica nela).";
    }
    if (this.empateProposto) {
      texto = texto + " O adversário propôs empate: carrega em Propor empate para aceitar, ou joga para recusar.";
    }
    mostrarMensagem(texto);
  }

  iniciarVezComputador() {
    this.modo = "vezComputador";
    let texto = "Vez do computador.";
    if (this.sopraveis.length > 0) {
      texto = texto + " Deixaste peças que podiam capturar: o computador pode soprá-las.";
    }
    mostrarMensagem(texto);
    const self = this;
    this.temporizador = setTimeout(function () {
      self.computadorSopra();
    }, ESPERA);
  }

  // Fim de uma jogada (do humano ou do computador)
  terminarJogada() {
    // primeiro vê quais as peças que ficam sujeitas ao sopro
    this.sopraveis = this.calcularSopraveis();
    // depois retira do tabuleiro as peças capturadas
    for (let i = 0; i < this.capturadas.length; i++) {
      this.tabuleiro.removerPeca(this.capturadas[i]);
    }
    if (this.capturadas.length > 0) {
      this.jogadasSemCaptura = 0;
    } else {
      this.jogadasSemCaptura++;
    }
    // se o humano jogou, recusou a proposta de empate do computador
    if (this.jogadorAtual === COR_HUMANO) {
      this.empateProposto = false;
    }
    this.jogadorAtual = corAdversaria(this.jogadorAtual);
    this.iniciarVez();
  }

  // Peças do jogador que acabou de jogar que podiam ter capturado e não capturaram
  calcularSopraveis() {
    const origem = this.caminho[0];
    const fim = this.caminho[this.caminho.length - 1];
    const lista = [];
    if (this.capturadas.length > 0) {
      // capturou: só é soprável se parou a meio e ainda podia saltar
      const saltos = this.tabuleiro.saltosPossiveis(fim, this.jogadorAtual, this.caminho, this.capturadas);
      if (saltos.length > 0) {
        lista.push(fim);
      }
    } else {
      // não capturou: todas as peças que podiam ter capturado
      for (let i = 0; i < this.podiamCapturar.length; i++) {
        if (this.podiamCapturar[i].igual(origem)) {
          lista.push(fim);   // foi esta que se mexeu: fica na posição nova
        } else {
          lista.push(this.podiamCapturar[i]);
        }
      }
    }
    return lista;
  }

  // Termina o jogo e guarda o resultado
  terminarJogo(vencedor) {
    clearTimeout(this.temporizador);
    this.modo = "fimDeJogo";
    if (vencedor === COR_HUMANO) {
      mostrarMensagem("Ganhaste!");
      registarResultado(true, this.nivel);
    } else {
      mostrarMensagem("O computador ganhou.");
      registarResultado(false, this.nivel);
    }
    desenharTabuleiro();
  }

  // Faz um salto de captura com a peça que está no fim do caminho
  saltar(destino, saltada) {
    this.tabuleiro.moverPeca(this.posicaoAtual(), destino);
    this.tabuleiro.obterPeca(saltada).capturada = true;
    this.caminho.push(destino);
    this.capturadas.push(saltada);
  }

  // Posição onde está a peça que está a jogar
  posicaoAtual() {
    return this.caminho[this.caminho.length - 1];
  }


  // ---------- Jogada do humano ----------

  // Chamada quando se clica numa casa do tabuleiro
  cliqueCasa(linha, coluna) {
    // enquanto uma peça está a deslizar, os cliques não contam
    if (this.aAnimar) {
      return;
    }
    const pos = new Position(linha, coluna);
    switch (this.modo) {
      case "esperaJogada":
        this.cliqueEsperaJogada(pos);
        break;
      case "pecaSelecionada":
        this.cliquePecaSelecionada(pos);
        break;
      case "capturaMultipla":
        this.cliqueCapturaMultipla(pos);
        break;
      default:
        // "vezComputador" ou "fimDeJogo": o tabuleiro está bloqueado
        return;
    }
    // se uma peça começou a deslizar, não se redesenha (senão a animação desaparecia)
    if (!this.aAnimar) {
      desenharTabuleiro();
    }
  }

  cliqueEsperaJogada(pos) {
    const peca = this.tabuleiro.obterPeca(pos);
    if (peca === null) {
      mostrarMensagem("Jogada inválida.");
      return;
    }
    if (peca.cor === COR_IA) {
      if (contemPosicao(this.sopraveis, pos)) {
        this.soprar(pos);
      } else {
        mostrarMensagem("Jogada inválida.");
      }
      return;
    }
    if (this.jogadasDaPeca(pos).length > 0) {
      this.selecionarPeca(pos);
    } else {
      mostrarMensagem("Jogada inválida: essa peça não tem jogadas.");
    }
  }

  cliquePecaSelecionada(pos) {
    // clicar na mesma peça cancela a seleção
    if (pos.igual(this.selecionada)) {
      this.selecionada = null;
      this.modo = "esperaJogada";
      mostrarMensagem("Seleção cancelada. É a tua vez.");
      return;
    }
    // clicar noutra peça minha que tenha jogadas troca a seleção
    const peca = this.tabuleiro.obterPeca(pos);
    if (peca !== null && peca.cor === COR_HUMANO && this.jogadasDaPeca(pos).length > 0) {
      this.selecionarPeca(pos);
      return;
    }
    const jogada = this.procurarJogada(this.selecionada, pos);
    if (jogada === null) {
      mostrarMensagem("Jogada inválida.");
      return;
    }
    const origem = this.selecionada;
    const self = this;
    this.caminho = [origem];
    this.capturadas = [];
    // a peça desliza e só depois a jogada é feita
    this.animarEDepois(origem, pos, function () {
      if (jogada.tipo === "movimento") {
        self.tabuleiro.moverPeca(origem, pos);
        self.caminho.push(pos);
        self.terminarJogada();
      } else {
        self.saltar(pos, jogada.capturadas[0]);
        self.continuarOuTerminar();
      }
    });
  }

  cliqueCapturaMultipla(pos) {
    // clicar na própria peça termina a jogada a meio (fica sujeita ao sopro)
    if (pos.igual(this.posicaoAtual())) {
      this.terminarJogada();
      return;
    }
    const saltos = this.tabuleiro.saltosPossiveis(this.posicaoAtual(), COR_HUMANO, this.caminho, this.capturadas);
    for (let i = 0; i < saltos.length; i++) {
      if (saltos[i].destino.igual(pos)) {
        const saltada = saltos[i].saltada;
        const self = this;
        this.animarEDepois(this.posicaoAtual(), pos, function () {
          self.saltar(pos, saltada);
          self.continuarOuTerminar();
        });
        return;
      }
    }
    mostrarMensagem("Jogada inválida. Tens de continuar a capturar com esta peça.");
  }

  // Seleciona uma peça do humano e explica o que fazer a seguir
  selecionarPeca(pos) {
    this.selecionada = pos;
    this.modo = "pecaSelecionada";
    if (this.podiamCapturar.length > 0 && !contemPosicao(this.podiamCapturar, pos)) {
      mostrarMensagem("Atenção: esta peça não captura. Se não capturares com outra, o computador pode soprar-te.");
    } else {
      mostrarMensagem("Peça selecionada. Clica num destino amarelo, ou na peça para cancelar.");
    }
  }

  // Faz a peça deslizar da origem ao destino e, quando a animação acaba,
  // chama a função "depois" (que faz mesmo a jogada na estrutura de dados)
  animarEDepois(origem, destino, depois) {
    this.aAnimar = true;
    animarPeca(origem, destino);
    const self = this;
    this.temporizador = setTimeout(function () {
      self.aAnimar = false;
      depois();
      desenharTabuleiro();
    }, ANIMACAO);
  }

  // Depois de um salto: se ainda dá para capturar continua, senão acaba a jogada
  continuarOuTerminar() {
    if (this.destinosCaptura().length > 0) {
      this.modo = "capturaMultipla";
      mostrarMensagem("Tens de continuar a capturar com esta peça. Se clicares nela paras aqui, mas o computador pode soprá-la.");
    } else {
      this.terminarJogada();
    }
  }

  // O humano sopra uma peça do computador
  soprar(pos) {
    this.tabuleiro.removerPeca(pos);
    this.sopraveis = [];
    // sem essa peça, as jogadas possíveis podem mudar
    this.jogadas = this.tabuleiro.gerarJogadas(COR_HUMANO);
    this.podiamCapturar = this.tabuleiro.pecasQuePodemCapturar(COR_HUMANO);
    if (this.jogadas.length === 0) {
      this.terminarJogo(COR_IA);
      return;
    }
    mostrarMensagem("Sopraste uma peça. Agora faz a tua jogada.");
  }

  // Jogadas válidas que começam na posição dada
  jogadasDaPeca(pos) {
    const lista = [];
    for (let i = 0; i < this.jogadas.length; i++) {
      if (this.jogadas[i].origem.igual(pos)) {
        lista.push(this.jogadas[i]);
      }
    }
    return lista;
  }

  // Procura uma jogada da origem cujo primeiro passo vai para o destino
  procurarJogada(origem, destino) {
    const lista = this.jogadasDaPeca(origem);
    for (let i = 0; i < lista.length; i++) {
      if (lista[i].caminho[1].igual(destino)) {
        return lista[i];
      }
    }
    return null;
  }

  // Destinos possíveis da peça selecionada (primeiro passo de cada jogada)
  destinosSelecionada() {
    const lista = this.jogadasDaPeca(this.selecionada);
    const destinos = [];
    for (let i = 0; i < lista.length; i++) {
      destinos.push(lista[i].caminho[1]);
    }
    return destinos;
  }

  // Destinos onde a peça pode continuar a capturar
  destinosCaptura() {
    const saltos = this.tabuleiro.saltosPossiveis(this.posicaoAtual(), this.jogadorAtual, this.caminho, this.capturadas);
    const destinos = [];
    for (let i = 0; i < saltos.length; i++) {
      destinos.push(saltos[i].destino);
    }
    return destinos;
  }


  // ---------- Jogada do computador ----------

  // Primeiro passo: decidir se sopra
  computadorSopra() {
    let soprou = false;
    if (this.sopraveis.length > 0 && this.computadorQuerSoprar()) {
      const indice = Math.floor(Math.random() * this.sopraveis.length);
      this.tabuleiro.removerPeca(this.sopraveis[indice]);
      soprou = true;
      mostrarMensagem("O computador soprou uma peça tua.");
      this.jogadas = this.tabuleiro.gerarJogadas(COR_IA);
      this.podiamCapturar = this.tabuleiro.pecasQuePodemCapturar(COR_IA);
    }
    this.sopraveis = [];
    desenharTabuleiro();
    if (soprou) {
      const self = this;
      this.temporizador = setTimeout(function () {
        self.computadorJoga();
      }, ESPERA);
    } else {
      this.computadorJoga();
    }
  }

  // Fácil nunca sopra, médio sopra metade das vezes, difícil sopra sempre
  computadorQuerSoprar() {
    if (this.nivel === "facil") {
      return false;
    } else if (this.nivel === "medio") {
      return Math.random() < 0.5;
    } else {
      return true;
    }
  }

  // Segundo passo: escolher a jogada e começar a fazê-la
  computadorJoga() {
    if (this.jogadas.length === 0) {
      this.terminarJogo(COR_HUMANO);
      return;
    }
    // se o jogo está parado há muito tempo, o computador propõe empate (só uma vez)
    if (!this.computadorPropos && this.jogadasSemCaptura >= LIMITE_SEM_CAPTURAS) {
      this.computadorPropos = true;
      this.empateProposto = true;
    }
    const jogada = this.escolherJogada();
    this.caminho = [jogada.origem];
    this.capturadas = [];
    this.passoComputador(jogada, 1);
  }

  // Passo número i da jogada (numa captura múltipla, um salto de cada vez):
  // primeiro a peça desliza, depois o passo é feito na estrutura de dados
  passoComputador(jogada, i) {
    const self = this;
    this.animarEDepois(jogada.caminho[i - 1], jogada.caminho[i], function () {
      self.fazerPassoComputador(jogada, i);
    });
  }

  fazerPassoComputador(jogada, i) {
    const destino = jogada.caminho[i];
    if (jogada.tipo === "captura") {
      this.saltar(destino, jogada.capturadas[i - 1]);
    } else {
      this.tabuleiro.moverPeca(jogada.origem, destino);
      this.caminho.push(destino);
    }
    desenharTabuleiro();

    if (i < jogada.caminho.length - 1) {
      const self = this;
      this.temporizador = setTimeout(function () {
        self.passoComputador(jogada, i + 1);
      }, ESPERA);
    } else {
      this.terminarJogada();
    }
  }

  // Escolhe a jogada conforme o nível
  escolherJogada() {
    if (this.nivel === "facil") {
      return jogadaAleatoria(this.jogadas);
    } else if (this.nivel === "medio") {
      if (Math.random() < 0.5) {
        return jogadaAleatoria(this.jogadas);
      } else {
        return jogadaGulosa(this.jogadas);
      }
    } else {
      return jogadaDificil(this.jogadas, this.tabuleiro);
    }
  }


  // ---------- Empate e desistência ----------

  proporEmpate() {
    if (this.modo === "fimDeJogo") {
      mostrarMensagem("Não há nenhum jogo a decorrer.");
      return;
    }
    if (this.modo === "vezComputador" || this.modo === "capturaMultipla") {
      mostrarMensagem("Só podes propor empate no início da tua vez.");
      return;
    }
    if (this.empateProposto || this.computadorAceitaEmpate()) {
      this.modo = "fimDeJogo";
      mostrarMensagem("Empate aceite.");
      desenharTabuleiro();
    } else {
      mostrarMensagem("O computador recusou o empate. Continua a jogar.");
    }
  }

  // O computador só aceita se já houve 20 jogadas seguidas sem capturas
  computadorAceitaEmpate() {
    return this.jogadasSemCaptura >= LIMITE_SEM_CAPTURAS;
  }

  desistir() {
    if (this.modo === "fimDeJogo") {
      mostrarMensagem("Não há nenhum jogo a decorrer.");
      return;
    }
    clearTimeout(this.temporizador);
    this.modo = "fimDeJogo";
    registarResultado(false, this.nivel);
    mostrarMensagem("Desististe, perdeste.");
    desenharTabuleiro();
  }
}


// ============================================================
// Inteligência artificial: escolha da jogada
// ============================================================

// Escolhe uma jogada qualquer ao acaso
function jogadaAleatoria(jogadas) {
  const indice = Math.floor(Math.random() * jogadas.length);
  return jogadas[indice];
}

// Devolve as jogadas que capturam mais peças (se ninguém captura, são todas)
function maisCapturas(jogadas) {
  let maximo = 0;
  for (let i = 0; i < jogadas.length; i++) {
    if (jogadas[i].capturadas.length > maximo) {
      maximo = jogadas[i].capturadas.length;
    }
  }
  const melhores = [];
  for (let i = 0; i < jogadas.length; i++) {
    if (jogadas[i].capturadas.length === maximo) {
      melhores.push(jogadas[i]);
    }
  }
  return melhores;
}

// Gulosa: a jogada que captura mais peças (se houver empate, sorteia entre as melhores)
function jogadaGulosa(jogadas) {
  return jogadaAleatoria(maisCapturas(jogadas));
}

// Difícil: também é gulosa, mas entre as jogadas que capturam o mesmo,
// experimenta cada uma numa cópia do tabuleiro e escolhe a que deixa
// o humano capturar menos peças na resposta
function jogadaDificil(jogadas, tabuleiro) {
  const candidatas = maisCapturas(jogadas);
  let menorPerda = 1000;
  let melhores = [];
  for (let i = 0; i < candidatas.length; i++) {
    const copia = tabuleiro.copiar();
    copia.aplicarJogada(candidatas[i]);
    const perda = copia.maiorCaptura(COR_HUMANO);
    if (perda < menorPerda) {
      menorPerda = perda;
      melhores = [candidatas[i]];
    } else if (perda === menorPerda) {
      melhores.push(candidatas[i]);
    }
  }
  return jogadaAleatoria(melhores);
}


// ============================================================
// Interface: desenhar o tabuleiro
// ============================================================

// Coordenada (em px) do centro de uma linha ou coluna do tabuleiro
function centro(indice) {
  return MARGEM + indice * ESPACO;
}

// Desenha no canvas as linhas do tabuleiro (só é preciso uma vez).
// Para cada posição, liga-a a cada vizinha nas direções em que pode andar,
// por isso as diagonais só aparecem nas posições que as têm.
function desenharLinhas() {
  const canvas = document.getElementById("linhas");
  const ctx = canvas.getContext("2d");
  ctx.strokeStyle = "#a5d6b4";
  ctx.lineWidth = 3;
  for (let l = 0; l < TAMANHO; l++) {
    for (let c = 0; c < TAMANHO; c++) {
      const pos = new Position(l, c);
      const direcoes = pos.direcoes();
      for (let i = 0; i < direcoes.length; i++) {
        const vizinha = pos.andar(direcoes[i], 1);
        if (vizinha.dentro()) {
          ctx.beginPath();
          ctx.moveTo(centro(pos.coluna), centro(pos.linha));
          ctx.lineTo(centro(vizinha.coluna), centro(vizinha.linha));
          ctx.stroke();
        }
      }
    }
  }
}

// Apaga as peças e volta a criá-las a partir da estrutura de dados
function desenharTabuleiro() {
  const div = document.getElementById("pecas");
  while (div.firstChild) {
    div.removeChild(div.firstChild);
  }
  for (let l = 0; l < TAMANHO; l++) {
    for (let c = 0; c < TAMANHO; c++) {
      div.appendChild(criarPosicao(l, c));
    }
  }
  atualizarInformacao();
}

// Atualiza a contagem de peças e o indicador de quem joga
function atualizarInformacao() {
  const azuis = jogo.tabuleiro.contarPecas(COR_HUMANO);
  const vermelhas = jogo.tabuleiro.contarPecas(COR_IA);
  document.getElementById("contagem").textContent = "Peças azuis: " + azuis + " | Peças vermelhas: " + vermelhas;

  const vez = document.getElementById("vez");
  vez.classList.remove("vezAzul");
  vez.classList.remove("vezVermelha");
  if (jogo.modo === "fimDeJogo") {
    vez.textContent = "Jogo parado";
  } else if (jogo.jogadorAtual === COR_HUMANO) {
    vez.textContent = "Vez: tu (azuis)";
    vez.classList.add("vezAzul");
  } else {
    vez.textContent = "Vez: computador (vermelhas) - a pensar";
    vez.classList.add("vezVermelha");
  }
}

// Faz o círculo da origem deslizar até ao destino.
// A animação é feita pela transição de "left" e "top" que está no CSS.
function animarPeca(origem, destino) {
  const circulo = document.getElementById("pecas").children[origem.linha * TAMANHO + origem.coluna];
  circulo.classList.add("aMover");
  circulo.style.left = (centro(destino.coluna) - RAIO) + "px";
  circulo.style.top = (centro(destino.linha) - RAIO) + "px";
}

// Cria o círculo de uma posição, colocado em cima do cruzamento das linhas
function criarPosicao(linha, coluna) {
  const pos = new Position(linha, coluna);
  const circulo = document.createElement("div");
  circulo.classList.add("posicao");
  circulo.style.left = (centro(coluna) - RAIO) + "px";
  circulo.style.top = (centro(linha) - RAIO) + "px";

  const peca = jogo.tabuleiro.obterPeca(pos);
  if (peca === null) {
    circulo.classList.add("vazia");
  } else {
    circulo.classList.add(peca.cor);
    if (peca.capturada) {
      circulo.classList.add("capturada");
    }
  }

  marcarDestaques(circulo, pos);
  circulo.addEventListener("click", function () {
    jogo.cliqueCasa(linha, coluna);
  });
  return circulo;
}

// Põe as classes de destaque na posição, conforme o modo em que estamos
function marcarDestaques(circulo, pos) {
  if (jogo.modo === "esperaJogada") {
    marcarPecaComJogada(circulo, pos);
    if (contemPosicao(jogo.sopraveis, pos)) {
      circulo.classList.add("sopravel");
      circulo.classList.add("clicavel");
    }
  } else if (jogo.modo === "pecaSelecionada") {
    if (pos.igual(jogo.selecionada)) {
      circulo.classList.add("selecionada");
      circulo.classList.add("clicavel");
    } else {
      // as outras peças com jogada continuam clicáveis (para trocar a seleção)
      marcarPecaComJogada(circulo, pos);
    }
    if (contemPosicao(jogo.destinosSelecionada(), pos)) {
      circulo.classList.add("destino");
      circulo.classList.add("clicavel");
    }
  } else if (jogo.modo === "capturaMultipla") {
    if (pos.igual(jogo.posicaoAtual())) {
      circulo.classList.add("selecionada");
      circulo.classList.add("clicavel");
    }
    if (contemPosicao(jogo.destinosCaptura(), pos)) {
      circulo.classList.add("destino");
      circulo.classList.add("clicavel");
    }
  }
}

// Marca uma peça minha que tem jogadas: as que podem capturar ficam
// com brilho amarelo, as outras com contorno branco
function marcarPecaComJogada(circulo, pos) {
  if (jogo.jogadasDaPeca(pos).length === 0) {
    return;
  }
  if (contemPosicao(jogo.podiamCapturar, pos)) {
    circulo.classList.add("podeCapturar");
  } else {
    circulo.classList.add("temJogada");
  }
  circulo.classList.add("clicavel");
}

// Escreve um texto na faixa de mensagens
function mostrarMensagem(texto) {
  document.getElementById("textoMensagem").textContent = texto;
}


// ============================================================
// Classificações (guardadas no localStorage)
// ============================================================

const CHAVE_CLASSIFICACOES = "alquerqueClassificacoes";

// Lê as classificações. Formato: { nome: { nivel: { vitorias, derrotas } } }
function lerClassificacoes() {
  const texto = localStorage.getItem(CHAVE_CLASSIFICACOES);
  if (texto === null) {
    return {};
  }
  return JSON.parse(texto);
}

// Junta uma vitória ou uma derrota ao jogador atual, no nível dado
function registarResultado(ganhou, nivel) {
  const dados = lerClassificacoes();
  if (dados[nomeJogador] === undefined) {
    dados[nomeJogador] = {};
  }
  if (dados[nomeJogador][nivel] === undefined) {
    dados[nomeJogador][nivel] = { vitorias: 0, derrotas: 0 };
  }
  if (ganhou) {
    dados[nomeJogador][nivel].vitorias++;
  } else {
    dados[nomeJogador][nivel].derrotas++;
  }
  localStorage.setItem(CHAVE_CLASSIFICACOES, JSON.stringify(dados));
}

// Nome do nível para mostrar na tabela
function nomeNivel(nivel) {
  switch (nivel) {
    case "facil":
      return "Fácil";
    case "medio":
      return "Médio";
    default:
      return "Difícil";
  }
}

// Cria uma linha da tabela com os textos dados
function criarLinha(textos) {
  const tr = document.createElement("tr");
  for (let i = 0; i < textos.length; i++) {
    const td = document.createElement("td");
    td.textContent = textos[i];
    tr.appendChild(td);
  }
  return tr;
}

// Preenche a tabela de classificações
function preencherClassificacoes() {
  const corpo = document.getElementById("corpoClassificacoes");
  while (corpo.firstChild) {
    corpo.removeChild(corpo.firstChild);
  }
  const dados = lerClassificacoes();
  const niveis = ["facil", "medio", "dificil"];
  let linhas = 0;
  for (const nome in dados) {
    for (let i = 0; i < niveis.length; i++) {
      const resultado = dados[nome][niveis[i]];
      if (resultado !== undefined) {
        corpo.appendChild(criarLinha([nome, nomeNivel(niveis[i]), resultado.vitorias, resultado.derrotas]));
        linhas++;
      }
    }
  }
  if (linhas === 0) {
    corpo.appendChild(criarLinha(["Ainda não há resultados", "-", "-", "-"]));
  }
}


// ============================================================
// Comandos e painéis
// ============================================================

function iniciarJogo() {
  const nivel = document.getElementById("nivel").value;
  const primeiro = document.getElementById("primeiro").value;
  jogo.iniciar(nivel, primeiro === "eu");
}

function abrirPainel(id) {
  document.getElementById(id).classList.remove("escondido");
}

function fecharPainel(id) {
  document.getElementById(id).classList.add("escondido");
}

// ============================================================
// Identificação: entrar (log in), registar (sign up) e sair.
// Nesta entrega não há autenticação nem registo a sério: só se verifica
// se os campos estão preenchidos e guarda-se o nome para as classificações.
// A autenticação e o registo no servidor ficam para a 2ª entrega.
// ============================================================

// Mostra o formulário de entrar ou o de registar ("entrar" ou "registar")
function mostrarSeparador(qual) {
  const formEntrar = document.getElementById("formEntrar");
  const formRegistar = document.getElementById("formRegistar");
  const separadorEntrar = document.getElementById("separadorEntrar");
  const separadorRegistar = document.getElementById("separadorRegistar");
  if (qual === "entrar") {
    formEntrar.classList.remove("escondido");
    formRegistar.classList.add("escondido");
    separadorEntrar.classList.add("ativo");
    separadorRegistar.classList.remove("ativo");
  } else {
    formEntrar.classList.add("escondido");
    formRegistar.classList.remove("escondido");
    separadorEntrar.classList.remove("ativo");
    separadorRegistar.classList.add("ativo");
  }
  avisoIdentificacao("");
}

// Escreve um aviso por baixo dos formulários (por exemplo, um campo vazio)
function avisoIdentificacao(texto) {
  document.getElementById("avisoIdentificacao").textContent = texto;
}

// Botão Entrar: só verifica se o utilizador e a senha foram preenchidos
function entrar() {
  const nome = document.getElementById("utilizador").value.trim();
  const senha = document.getElementById("senha").value;
  if (nome === "" || senha === "") {
    avisoIdentificacao("Preenche o utilizador e a senha.");
    return;
  }
  iniciarSessao(nome);
}

// Botão Criar conta: verifica os campos e se as duas senhas são iguais
function registar() {
  const nome = document.getElementById("novoUtilizador").value.trim();
  const senha = document.getElementById("novaSenha").value;
  const confirmacao = document.getElementById("confirmarSenha").value;
  if (nome === "" || senha === "") {
    avisoIdentificacao("Preenche o utilizador e a senha.");
    return;
  }
  if (senha !== confirmacao) {
    avisoIdentificacao("As senhas não são iguais.");
    return;
  }
  iniciarSessao(nome);
}

// Depois de entrar: guarda o nome, esconde os formulários e mostra o nome
function iniciarSessao(nome) {
  nomeJogador = nome;
  document.getElementById("nomeSessao").textContent = nome;
  document.getElementById("semSessao").classList.add("escondido");
  document.getElementById("comSessao").classList.remove("escondido");
  limparCamposIdentificacao();
}

// Botão Sair: volta a jogar como "Anónimo" e mostra outra vez os formulários
function sair() {
  nomeJogador = "Anónimo";
  document.getElementById("comSessao").classList.add("escondido");
  document.getElementById("semSessao").classList.remove("escondido");
  mostrarSeparador("entrar");
}

// Apaga o que está escrito nos campos (as senhas não ficam guardadas em lado nenhum)
function limparCamposIdentificacao() {
  const campos = ["utilizador", "senha", "novoUtilizador", "novaSenha", "confirmarSenha"];
  for (let i = 0; i < campos.length; i++) {
    document.getElementById(campos[i]).value = "";
  }
}

// Liga os botões da identificação às suas funções
function prepararIdentificacao() {
  document.getElementById("separadorEntrar").addEventListener("click", function () {
    mostrarSeparador("entrar");
  });
  document.getElementById("separadorRegistar").addEventListener("click", function () {
    mostrarSeparador("registar");
  });
  document.getElementById("botaoEntrar").addEventListener("click", entrar);
  document.getElementById("botaoRegistar").addEventListener("click", registar);
  document.getElementById("botaoSair").addEventListener("click", sair);
}

// Liga os botões às funções e desenha o tabuleiro inicial
function prepararPagina() {
  prepararIdentificacao();
  document.getElementById("botaoIniciar").addEventListener("click", iniciarJogo);
  document.getElementById("botaoEmpate").addEventListener("click", function () {
    jogo.proporEmpate();
  });
  document.getElementById("botaoDesistir").addEventListener("click", function () {
    jogo.desistir();
  });
  document.getElementById("botaoInstrucoes").addEventListener("click", function () {
    abrirPainel("painelInstrucoes");
  });
  document.getElementById("fecharInstrucoes").addEventListener("click", function () {
    fecharPainel("painelInstrucoes");
  });
  document.getElementById("botaoClassificacoes").addEventListener("click", function () {
    preencherClassificacoes();
    abrirPainel("painelClassificacoes");
  });
  document.getElementById("fecharClassificacoes").addEventListener("click", function () {
    fecharPainel("painelClassificacoes");
  });
  desenharLinhas();
  desenharTabuleiro();
}


// ========== Arranque ==========

let nomeJogador = "Anónimo";
const jogo = new Game();
prepararPagina();
