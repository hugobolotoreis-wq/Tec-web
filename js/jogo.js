// JOGO
class Game {
  constructor() {
    this.tabuleiro = new Board();
    this.tabuleiro.posicaoInicial();
    this.modo = "fimDeJogo";
    this.jogadorAtual = COR_HUMANO;
    this.nivel = "facil";
    this.jogadas = [];        
    this.selecionada = null;    
    this.caminho = [];         
    this.capturadas = [];     
    this.podiamCapturar = [];   
    this.sopraveis = [];        
    this.jogadasSemCaptura = 0;
    this.computadorPropos = false;   
    this.empateProposto = false;    
    this.temporizador = null;
    this.aAnimar = false;            
  }

  // Novo jogo
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
      texto = texto + " O adversário propôs empate: carrega em Aceitar empate, ou joga para recusar.";
    }
    mostrarVez(texto);
  }

  iniciarVezComputador() {
    this.modo = "vezComputador";
    let texto = "Vez do computador.";
    if (this.sopraveis.length > 0) {
      texto = texto + " Deixaste peças que podiam capturar: o computador pode soprá-las.";
    }
    mostrarVez(texto);
    const self = this;
    this.temporizador = setTimeout(function () {
      self.computadorSopra();
    }, ESPERA);
  }

  terminarJogada() {
    this.sopraveis = this.calcularSopraveis();
    for (let i = 0; i < this.capturadas.length; i++) {
      this.tabuleiro.removerPeca(this.capturadas[i]);
    }
    if (this.capturadas.length > 0) {
      this.jogadasSemCaptura = 0;
    } else {
      this.jogadasSemCaptura++;
    }
    if (this.jogadorAtual === COR_HUMANO) {
      this.empateProposto = false;
    }
    this.jogadorAtual = corAdversaria(this.jogadorAtual);
    this.iniciarVez();
  }

  calcularSopraveis() {
    const origem = this.caminho[0];
    const fim = this.caminho[this.caminho.length - 1];
    const lista = [];
    if (this.capturadas.length > 0) {
      const saltos = this.tabuleiro.saltosPossiveis(fim, this.jogadorAtual, this.caminho, this.capturadas);
      if (saltos.length > 0) {
        lista.push(fim);
      }
    } else {
      for (let i = 0; i < this.podiamCapturar.length; i++) {
        if (this.podiamCapturar[i].igual(origem)) {
          lista.push(fim);   
        } else {
          lista.push(this.podiamCapturar[i]);
        }
      }
    }
    return lista;
  }

  terminarJogo(vencedor) {
    clearTimeout(this.temporizador);
    this.modo = "fimDeJogo";
    if (vencedor === COR_HUMANO) {
      mostrarMensagem("Ganhaste!");
      registarResultado("vitorias", this.nivel);
    } else {
      mostrarMensagem("O computador ganhou.");
      registarResultado("derrotas", this.nivel);
    }
    desenharTabuleiro();
  }

  saltar(destino, saltada) {
    this.tabuleiro.moverPeca(this.posicaoAtual(), destino);
    this.tabuleiro.obterPeca(saltada).capturada = true;
    this.caminho.push(destino);
    this.capturadas.push(saltada);
  }

  posicaoAtual() {
    return this.caminho[this.caminho.length - 1];
  }



  cliqueCasa(linha, coluna) {
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
        return;
    }
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
    if (pos.igual(this.selecionada)) {
      this.selecionada = null;
      this.modo = "esperaJogada";
      mostrarMensagem("Seleção cancelada. É a tua vez.");
      return;
    }
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

  selecionarPeca(pos) {
    this.selecionada = pos;
    this.modo = "pecaSelecionada";
    if (this.podiamCapturar.length > 0 && !contemPosicao(this.podiamCapturar, pos)) {
      mostrarMensagem("Atenção: esta peça não captura. Se não capturares com outra, o computador pode soprar-te.");
    } else {
      mostrarMensagem("Peça selecionada. Clica num destino amarelo, ou na peça para cancelar.");
    }
  }


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

  continuarOuTerminar() {
    if (this.destinosCaptura().length > 0) {
      this.modo = "capturaMultipla";
      mostrarMensagem("Tens de continuar a capturar com esta peça. Se clicares nela paras aqui, mas o computador pode soprá-la.");
    } else {
      this.terminarJogada();
    }
  }


  soprar(pos) {
    this.tabuleiro.removerPeca(pos);
    this.sopraveis = [];
    this.jogadas = this.tabuleiro.gerarJogadas(COR_HUMANO);
    this.podiamCapturar = this.tabuleiro.pecasQuePodemCapturar(COR_HUMANO);
    if (this.jogadas.length === 0) {
      this.terminarJogo(COR_IA);
      return;
    }
    mostrarMensagem("Sopraste uma peça. Agora faz a tua jogada.");
  }


  jogadasDaPeca(pos) {
    const lista = [];
    for (let i = 0; i < this.jogadas.length; i++) {
      if (this.jogadas[i].origem.igual(pos)) {
        lista.push(this.jogadas[i]);
      }
    }
    return lista;
  }

  procurarJogada(origem, destino) {
    const lista = this.jogadasDaPeca(origem);
    for (let i = 0; i < lista.length; i++) {
      if (lista[i].caminho[1].igual(destino)) {
        return lista[i];
      }
    }
    return null;
  }

  destinosSelecionada() {
    const lista = this.jogadasDaPeca(this.selecionada);
    const destinos = [];
    for (let i = 0; i < lista.length; i++) {
      destinos.push(lista[i].caminho[1]);
    }
    return destinos;
  }

  destinosCaptura() {
    const saltos = this.tabuleiro.saltosPossiveis(this.posicaoAtual(), this.jogadorAtual, this.caminho, this.capturadas);
    const destinos = [];
    for (let i = 0; i < saltos.length; i++) {
      destinos.push(saltos[i].destino);
    }
    return destinos;
  }


  
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


  // Empate

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
      this.empateProposto = false;
      registarResultado("empates", this.nivel);
      mostrarMensagem("Empate aceite. O jogo terminou empatado.");
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
    registarResultado("derrotas", this.nivel);
    mostrarMensagem("Desististe, perdeste.");
    desenharTabuleiro();
  }
}
