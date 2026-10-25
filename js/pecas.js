// POSIÇÕES
class Position {
  constructor(linha, coluna) {
    this.linha = linha;
    this.coluna = coluna;
  }

  temDiagonais() {
    return this.linha % 2 === this.coluna % 2;
  }

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


//PEÇAS
class Piece {
  constructor(cor) {
    this.cor = cor;           
    this.capturada = false;  
  }
}

function corAdversaria(cor) {
  if (cor === COR_HUMANO) {
    return COR_IA;
  } else {
    return COR_HUMANO;
  }
}

// Sentido das peças azuis e vermelhas
function sentidoFrente(cor) {
  if (cor === COR_HUMANO) {
    return -1;
  } else {
    return 1;
  }
}

function ultimaFila(cor) {
  if (cor === COR_HUMANO) {
    return 0;
  } else {
    return TAMANHO - 1;
  }
}
