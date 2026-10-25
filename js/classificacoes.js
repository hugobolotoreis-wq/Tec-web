// CLASSIFICAÇÕES
const CHAVE_CLASSIFICACOES = "alquerqueClassificacoes";

// Formato: { nome: { nivel: { vitorias, derrotas, empates } } }
function lerClassificacoes() {
  const texto = localStorage.getItem(CHAVE_CLASSIFICACOES);
  if (texto === null) {
    return {};
  }
  return JSON.parse(texto);
}

function registarResultado(resultado, nivel) {
  const dados = lerClassificacoes();
  if (dados[nomeJogador] === undefined) {
    dados[nomeJogador] = {};
  }
  if (dados[nomeJogador][nivel] === undefined) {
    dados[nomeJogador][nivel] = { vitorias: 0, derrotas: 0, empates: 0 };
  }

  if (dados[nomeJogador][nivel].empates === undefined) {
    dados[nomeJogador][nivel].empates = 0;
  }
  dados[nomeJogador][nivel][resultado]++;
  localStorage.setItem(CHAVE_CLASSIFICACOES, JSON.stringify(dados));
}


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


function criarLinha(textos) {
  const tr = document.createElement("tr");
  for (let i = 0; i < textos.length; i++) {
    const td = document.createElement("td");
    td.textContent = textos[i];
    tr.appendChild(td);
  }
  return tr;
}


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
        const empates = resultado.empates === undefined ? 0 : resultado.empates;
        corpo.appendChild(criarLinha([nome, nomeNivel(niveis[i]), resultado.vitorias, resultado.derrotas, empates]));
        linhas++;
      }
    }
  }
  if (linhas === 0) {
    corpo.appendChild(criarLinha(["Ainda não há resultados", "-", "-", "-", "-"]));
  }
}
