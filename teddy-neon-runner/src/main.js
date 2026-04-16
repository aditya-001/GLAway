import Game from "./game.js";

const GAME_WIDTH = 480;
const GAME_HEIGHT = 860;

const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#0f0f1a",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: false,
    powerPreference: "high-performance",
  },
  fps: {
    target: 60,
    min: 30,
    forceSetTimeOut: true,
  },
  scene: [Game],
};

window.addEventListener("keydown", (event) => {
  if (["ArrowDown", "ArrowUp", " ", "Spacebar"].includes(event.key)) {
    event.preventDefault();
  }
});

window.addEventListener(
  "wheel",
  (event) => {
    if (document.activeElement?.tagName !== "INPUT") {
      event.preventDefault();
    }
  },
  { passive: false }
);

window.addEventListener("load", () => {
  // Phaser is loaded through the CDN script in index.html.
  window.__TEDDY_NEON_RUNNER__ = new Phaser.Game(config);
});
