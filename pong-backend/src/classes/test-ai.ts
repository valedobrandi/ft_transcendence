import { PingPong } from "./PingPong.js";

async function main() {
  // 1. Créer un match "fake"
  const game = new PingPong('test-match');

  // On simule 2 joueurs : LEFT = IA, RIGHT = humain
  const aiId = 'AI_PLAYER';
  const humanId = 'HUMAN_PLAYER';

  game.add(aiId);
  game.add(humanId);

  game.side.LEFT = aiId;
  game.side.RIGHT = humanId;

  // si tu as un playerKind:
  // game.playerKind = { LEFT: 'AI', RIGHT: 'HUMAN' };

  // On se met directement en mode PLAYING
  game.matchState = 'PLAYING';
  game.resetBall('LEFT');

  // 2. Boucle de test manuelle (pas de startGame, pas de WebSocket)
  let nowMs = 0;

  for (let step = 0; step < 500; step++) {
    nowMs += 16; // on simule ~60 FPS → 16ms par frame

    // IA décide (met {up, down} dans this.inputs pour aiId)
    game.updateAI(nowMs);

    // Moteur de jeu applique inputs + physique
    game.updateGame();

    // 3. Log pour voir ce qu'il se passe
    const ball = game.gameState.ball;
    const paddle = game.gameState.userX; // IA à gauche

    console.log(
      `step=${step}`,
      `ball=(${ball.x.toFixed(3)}, ${ball.y.toFixed(3)})`,
      `paddleY=${paddle.y.toFixed(3)}`
    );
  }
}

main();
