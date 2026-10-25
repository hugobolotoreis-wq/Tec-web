// IDENTIFICAÇÃO
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


function avisoIdentificacao(texto) {
  document.getElementById("avisoIdentificacao").textContent = texto;
}


function entrar() {
  const nome = document.getElementById("utilizador").value.trim();
  const senha = document.getElementById("senha").value;
  if (nome === "" || senha === "") {
    avisoIdentificacao("Preenche o utilizador e a senha.");
    return;
  }
  iniciarSessao(nome);
}


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


function iniciarSessao(nome) {
  nomeJogador = nome;
  document.getElementById("nomeSessao").textContent = nome;
  document.getElementById("semSessao").classList.add("escondido");
  document.getElementById("comSessao").classList.remove("escondido");
  limparCamposIdentificacao();
}


function sair() {
  nomeJogador = "Anónimo";
  document.getElementById("comSessao").classList.add("escondido");
  document.getElementById("semSessao").classList.remove("escondido");
  mostrarSeparador("entrar");
}


function limparCamposIdentificacao() {
  const campos = ["utilizador", "senha", "novoUtilizador", "novaSenha", "confirmarSenha"];
  for (let i = 0; i < campos.length; i++) {
    document.getElementById(campos[i]).value = "";
  }
}


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
