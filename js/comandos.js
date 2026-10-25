// COMANDOS

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


//PLAY

let nomeJogador = "Anónimo";
const jogo = new Game();
prepararPagina();
