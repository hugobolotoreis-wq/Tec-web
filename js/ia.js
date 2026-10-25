// IA

// Aleatória: escolhe uma jogada ao acaso
function jogadaAleatoria(jogadas) {
  const indice = Math.floor(Math.random() * jogadas.length);
  return jogadas[indice];
}

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

// Gulosa: a jogada que captura mais peças 
function jogadaGulosa(jogadas) {
  return jogadaAleatoria(maisCapturas(jogadas));
}

// Difícil: também é gulosa, mas entre as jogadas que capturam o mesmo, escolhe a que deixa o adversário com menos capturas possíveis
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
