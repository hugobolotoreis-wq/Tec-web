// TABULEIRO
class Board {
  constructor() {
    this.casas = [];
    for (let l = 0; l < TAMANHO; l++) {
      const linha = [];
      for (let c = 0; c < TAMANHO; c++) {
        linha.push(null);
      }
      this.casas.push(linha);
    }
  }

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

  moverPeca(origem, destino) {
    this.casas[destino.linha][destino.coluna] = this.obterPeca(origem);
    this.removerPeca(origem);
  }

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

  movimentosSimples(origem) {
    const cor = this.obterPeca(origem).cor;
    const direcoes = origem.direcoes();
    const lista = [];
    for (let i = 0; i < direcoes.length; i++) {
      const d = direcoes[i];
      // Não recua
      if (d[0] === -sentidoFrente(cor)) {
        continue;
      }
      // Só horizontal 
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
      // Peça do adeversário
      if (saltada === null || saltada.cor === cor) {
        continue;
      }
      // Não salta 2x a mesma peça
      if (saltada.capturada || contemPosicao(capturadas, meio)) {
        continue;
      }
      // Destino vazio
      if (!this.estaVazia(destino) || contemPosicao(caminho, destino)) {
        continue;
      }
      saltos.push({ destino: destino, saltada: meio });
    }
    return saltos;
  }


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
      caminho.pop();
      capturadas.pop();
    }
  }


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


  aplicarJogada(jogada) {
    this.moverPeca(jogada.origem, jogada.caminho[jogada.caminho.length - 1]);
    for (let i = 0; i < jogada.capturadas.length; i++) {
      this.removerPeca(jogada.capturadas[i]);
    }
  }


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
