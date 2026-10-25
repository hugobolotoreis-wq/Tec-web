// INTERFACE
function centro(indice) {
  return MARGEM + indice * ESPACO;
}


function desenharLinhas() {
  const div = document.getElementById("linhas");
  for (let l = 0; l < TAMANHO - 1; l++) {
    for (let c = 0; c < TAMANHO - 1; c++) {
      const quadrado = document.createElement("div");
      quadrado.classList.add("quadrado");
      if (new Position(l, c).temDiagonais()) {
        quadrado.classList.add("diagDesce");
      } else {
        quadrado.classList.add("diagSobe");
      }
      // a borda tem 3px, por isso recua 1.5px para a linha ficar centrada
      quadrado.style.left = (centro(c) - 1.5) + "px";
      quadrado.style.top = (centro(l) - 1.5) + "px";
      div.appendChild(quadrado);
    }
  }
}

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


  const botaoEmpate = document.getElementById("botaoEmpate");
  if (jogo.empateProposto && jogo.modo !== "fimDeJogo") {
    botaoEmpate.textContent = "Aceitar empate";
  } else {
    botaoEmpate.textContent = "Propor empate";
  }
}

function animarPeca(origem, destino) {
  const circulo = document.getElementById("pecas").children[origem.linha * TAMANHO + origem.coluna];
  circulo.classList.add("aMover");
  circulo.style.left = (centro(destino.coluna) - RAIO) + "px";
  circulo.style.top = (centro(destino.linha) - RAIO) + "px";
}

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


function mostrarMensagem(texto) {
  document.getElementById("textoMensagem").textContent = texto;
  const caixa = document.getElementById("mensagens");
  caixa.classList.remove("destaque");
  void caixa.offsetWidth;
  caixa.classList.add("destaque");
}

function mostrarVez(texto) {
  document.getElementById("textoMensagem").textContent = texto;
  document.getElementById("mensagens").classList.remove("destaque");
}
