# Notas para a defesa (não entra no ZIP)

1. `Position` guarda linha e coluna; `temDiagonais()` é `linha % 2 === coluna % 2`, e `direcoes()` devolve 8 direções nesse caso e só 4 (retas) nos outros.
2. `Position.andar(direcao, passos)` dá a casa vizinha (1 passo) ou a casa de aterragem de um salto (2 passos); `igual()` compara posições.
3. `Board.posicaoInicial()` põe as filas 0-1 e (2,0),(2,1) vermelhas, (2,3),(2,4) e as filas 3-4 azuis; o centro fica vazio.
4. `Board.movimentosSimples(pos)` testa cada direção: não pode recuar (`d[0] === -sentidoFrente`), na última fila só horizontal, e o destino tem de estar vazio.
5. `Board.saltosPossiveis(atual, cor, caminho, capturadas)` dá os saltos: peça adversária no meio, ainda não saltada, destino vazio e fora do `caminho`.
6. `Board.procurarCapturas(...)` é recursiva: faz cada salto, chama-se a si própria, desfaz (`pop`); só guarda a sequência quando já não dá para saltar mais.
7. `Board.gerarJogadas(cor)` junta movimentos e capturas de todas as peças em objetos `{ origem, caminho, capturadas, tipo }`. Serve para validar o humano, para a IA e para o fim do jogo.
8. `Game.iniciarVez()` limpa a seleção, calcula as jogadas e quem podia capturar; o humano passa a `"esperaJogada"` (ou perde se não tiver jogadas), o computador a `"vezComputador"`.
9. `Game.cliqueCasa()` usa um `switch` no `modo` e chama `cliqueEsperaJogada`, `cliquePecaSelecionada` ou `cliqueCapturaMultipla`; noutros modos o tabuleiro está bloqueado.
10. `Game.saltar()` move a peça, marca a saltada como `capturada` e guarda tudo em `caminho` e `capturadas`; `continuarOuTerminar()` decide se fica em `"capturaMultipla"`. `animarEDepois()` faz a peça deslizar (`animarPeca` muda `left`/`top` e o CSS tem `transition`) e só 300 ms depois faz a jogada; durante isso `aAnimar` bloqueia os cliques.
11. `Game.terminarJogada()` calcula primeiro os `sopraveis` (`calcularSopraveis`), só depois retira as capturadas, conta jogadas sem captura e passa a vez.
12. `calcularSopraveis()`: se capturou, só a peça que parou a meio; se não capturou, todas as que podiam (a que se mexeu fica na posição nova).
13. IA: `computadorSopra()` (fácil nunca, médio 50%, difícil sempre) e depois `computadorJoga()` → `escolherJogada()`: fácil `jogadaAleatoria`, médio sorteia, difícil `jogadaDificil` (as que capturam mais, `maisCapturas`, e entre essas a que, testada numa `copiar()` do tabuleiro, deixa o humano capturar menos: `maiorCaptura`) → `passoComputador()` faz um salto de cada vez.
14. `proporEmpate()` aceita se o computador já tinha proposto, ou se `computadorAceitaEmpate()` (só quando há 20 jogadas seguidas sem capturas); `desistir()` regista derrota.
15. `desenharLinhas()` desenha uma vez no canvas as linhas (cada posição ligada às vizinhas das suas `direcoes()`); `desenharTabuleiro()`/`criarPosicao()` refazem os 25 círculos com `createElement`, `classList`, `style.left`/`style.top` (por cima dos cruzamentos) e um `addEventListener` de clique; `registarResultado()` guarda vitórias e derrotas no `localStorage` em JSON. Identificação: `entrar()` e `registar()` só verificam os campos (e se as senhas coincidem) e chamam `iniciarSessao()`, que mostra o nome; `sair()` volta a "Anónimo".
