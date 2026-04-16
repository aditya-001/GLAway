import { Player } from "./player.js";
import { Obstacles } from "./obstacles.js";
import { Collectibles } from "./collectibles.js";
import { Weather } from "./weather.js";
import { UI } from "./ui.js";
import { Effects } from "./effects.js";
import { AudioManager } from "./audio.js";

const STORAGE_KEY = "teddy-neon-runner-progress-v1";
const WEATHER_DURATION_MS = 5 * 60 * 1000;
const SPEED_STEP_MS = 10 * 1000;
const CHEST_THRESHOLD = 12;

const DEFAULT_PROGRESS = {
  highScore: 0,
  wallet: 0,
  totalRuns: 0,
  totalCollected: 0,
  chestCharge: 0,
  chestReady: 0,
  leaderboard: [],
  dailyRewardDate: "",
};

const FLOATING_TEXT_COLORS = {
  cyan: "#86f4ff",
  pink: "#ff8fc1",
  gold: "#ffd56e",
  mint: "#9df6bd",
};

export default class Game extends Phaser.Scene {
  constructor() {
    super("TeddyNeonRunner");
  }

  init() {
    this.progress = loadProgress();
    this.pendingDailyReward = 0;
    this.state = this.createFreshRunState();
  }

  create() {
    this.width = this.scale.width;
    this.height = this.scale.height;
    this.centerX = this.width * 0.5;
    this.centerY = this.height * 0.5;
    this.groundLineY = this.height - 154;
    this.playerGroundY = this.groundLineY - 44;
    this.roadY = this.height - 78;
    this.trackFarY = 206;
    this.trackNearFloorY = this.groundLineY + 4;
    this.trackLaneSpreadTop = 24;
    this.trackLaneSpreadBottom = 118;
    this.trackFlow = 0;
    this.nextSpeedRampAt = SPEED_STEP_MS;
    this.saveQueued = false;

    this.createSdkBridge();
    this.createTextures();
    this.createStage();

    this.effects = new Effects(this);
    this.audioManager = new AudioManager(this);
    this.weather = new Weather(this, WEATHER_DURATION_MS);
    this.player = new Player(this, this.getLaneX(1), this.playerGroundY, {
      groundY: this.playerGroundY,
      lineY: this.groundLineY,
    });
    this.obstacles = new Obstacles(this);
    this.collectibles = new Collectibles(this);
    this.ui = new UI(this);

    this.registerInputs();
    this.applyDailyReward();
    this.weather.start();
    this.refreshPersistentUi();
    this.showMenu();
    this.notifyGameReady();
  }

  update(time, delta) {
    const clampedDelta = Math.min(delta, 34);
    const realDt = clampedDelta / 1000;
    const worldDt = realDt * this.state.worldTimeScale;

    this.weather.update(time, clampedDelta);
    this.updateBackdrop(realDt);

    if (this.state.invincibleTimer > 0) {
      this.state.invincibleTimer = Math.max(0, this.state.invincibleTimer - clampedDelta);
      if (this.state.invincibleTimer === 0) {
        this.player.setInvincible(false);
      }
    }

    if (this.state.screen === "menu") {
      this.player.updateIdle(time);
      this.ui.updateHud(this.getHudData());
      return;
    }

    if (this.state.paused) {
      this.player.updateIdle(time, true);
      this.ui.updateHud(this.getHudData());
      return;
    }

    if (!this.state.running) {
      this.ui.updateHud(this.getHudData());
      return;
    }

    this.player.update(time, worldDt, this.state.speed, this.state.running);

    this.state.timeAlive += clampedDelta;
    this.state.distance += this.state.speed * worldDt;
    this.state.score += worldDt * 14;
    this.state.displayedScore = Phaser.Math.Linear(
      this.state.displayedScore,
      this.state.score,
      0.28
    );

    if (this.state.timeAlive >= this.nextSpeedRampAt) {
      this.increaseSpeed();
    }

    this.updateCombo(clampedDelta);
    this.obstacles.update(time, worldDt, this.state.speed, this.player.getBounds());
    this.collectibles.update(time, worldDt, this.state.speed, this.player.getBounds());
    this.ui.updateHud(this.getHudData());
  }

  createFreshRunState() {
    return {
      screen: "menu",
      running: false,
      paused: false,
      gameOver: false,
      score: 0,
      displayedScore: 0,
      comboMultiplier: 1,
      comboChain: 0,
      comboTimer: 0,
      speed: 279,
      timeAlive: 0,
      distance: 0,
      worldTimeScale: 1,
      revived: false,
      invincibleTimer: 0,
      stats: {
        nearMisses: 0,
        collected: 0,
        rareCollected: 0,
        bestCombo: 1,
      },
    };
  }

  createSdkBridge() {
    const scene = this;
    const wait = (ms) =>
      new Promise((resolve) => {
        scene.time.delayedCall(ms, resolve);
      });

    this.sdk = {
      provider: "local",
      label: "Local Demo",
      initialized: false,
      initPromise: null,

      async init() {
        if (this.initPromise) {
          return this.initPromise;
        }

        this.initPromise = (async () => {
          try {
            if (window.PokiSDK) {
              this.provider = "poki";
              this.label = "Poki SDK";
              await window.PokiSDK.init();
              if (window.PokiSDK.gameLoadingFinished) {
                window.PokiSDK.gameLoadingFinished();
              }
              this.initialized = true;
              return;
            }

            if (window.CrazyGames?.SDK) {
              this.provider = "crazygames";
              this.label = "CrazyGames SDK";

              if (window.CrazyGames.SDK.game?.loadingStart) {
                window.CrazyGames.SDK.game.loadingStart();
              }

              await window.CrazyGames.SDK.init();

              if (window.CrazyGames.SDK.game?.loadingStop) {
                window.CrazyGames.SDK.game.loadingStop();
              }

              if (window.CrazyGames.SDK.environment === "disabled") {
                this.provider = "local";
                this.label = "Local Demo";
              }

              this.initialized = true;
              return;
            }
          } catch (error) {
            console.warn("SDK init skipped:", error);
          }

          this.provider = "local";
          this.label = "Local Demo";
          this.initialized = true;
        })();

        return this.initPromise;
      },

      async ensureReady() {
        if (!this.initPromise) {
          await this.init();
        } else {
          await this.initPromise;
        }
      },

      gameplayStart() {
        if (this.provider === "poki" && window.PokiSDK?.gameplayStart) {
          window.PokiSDK.gameplayStart();
        }

        if (
          this.provider === "crazygames" &&
          window.CrazyGames?.SDK?.game?.gameplayStart &&
          window.CrazyGames.SDK.environment !== "disabled"
        ) {
          window.CrazyGames.SDK.game.gameplayStart();
        }
      },

      gameplayStop() {
        if (this.provider === "poki" && window.PokiSDK?.gameplayStop) {
          window.PokiSDK.gameplayStop();
        }

        if (
          this.provider === "crazygames" &&
          window.CrazyGames?.SDK?.game?.gameplayStop &&
          window.CrazyGames.SDK.environment !== "disabled"
        ) {
          window.CrazyGames.SDK.game.gameplayStop();
        }
      },

      async commercialBreak({ onStart, onFinish, onError } = {}) {
        await this.ensureReady();

        if (this.provider === "poki" && window.PokiSDK?.commercialBreak) {
          try {
            await window.PokiSDK.commercialBreak(() => {
              onStart?.();
            });
            onFinish?.(true);
            return true;
          } catch (error) {
            onError?.(error);
            onFinish?.(false);
            return false;
          }
        }

        if (
          this.provider === "crazygames" &&
          window.CrazyGames?.SDK?.ad?.requestAd &&
          window.CrazyGames.SDK.environment !== "disabled"
        ) {
          return new Promise((resolve) => {
            window.CrazyGames.SDK.ad.requestAd("midgame", {
              adStarted: () => onStart?.(),
              adFinished: () => {
                onFinish?.(true);
                resolve(true);
              },
              adError: (error) => {
                onError?.(error);
                onFinish?.(false);
                resolve(false);
              },
            });
          });
        }

        return wait(280).then(() => {
          onFinish?.(false);
          return false;
        });
      },

      async rewardedBreak({ onStart, onReward, onFinish, onError } = {}) {
        await this.ensureReady();

        if (this.provider === "poki" && window.PokiSDK?.rewardedBreak) {
          try {
            const success = await window.PokiSDK.rewardedBreak({
              size: "medium",
              onStart: () => onStart?.(),
            });

            if (success) {
              onReward?.();
            }

            onFinish?.(success);
            return success;
          } catch (error) {
            onError?.(error);
            onFinish?.(false);
            return false;
          }
        }

        if (
          this.provider === "crazygames" &&
          window.CrazyGames?.SDK?.ad?.requestAd &&
          window.CrazyGames.SDK.environment !== "disabled"
        ) {
          return new Promise((resolve) => {
            window.CrazyGames.SDK.ad.requestAd("rewarded", {
              adStarted: () => onStart?.(),
              adFinished: () => {
                onReward?.();
                onFinish?.(true);
                resolve(true);
              },
              adError: (error) => {
                onError?.(error);
                onFinish?.(false);
                resolve(false);
              },
            });
          });
        }

        onStart?.();
        await wait(700);
        onReward?.();
        onFinish?.(true);
        return true;
      },

      triggerHappyTime() {
        if (
          this.provider === "crazygames" &&
          window.CrazyGames?.SDK?.game?.happytime &&
          window.CrazyGames.SDK.environment !== "disabled"
        ) {
          window.CrazyGames.SDK.game.happytime().catch(() => {});
        }
      },
    };
  }

  async notifyGameReady() {
    await this.sdk.init();
    this.ui.showToast(`Portal hook: ${this.sdk.label}`, FLOATING_TEXT_COLORS.cyan, 1800);
  }

  createStage() {
    this.backdropMask = this.add.rectangle(
      this.centerX,
      this.centerY,
      this.width,
      this.height,
      0x0f0f1a,
      0.28
    ).setDepth(-30);

    this.city = this.add
      .tileSprite(this.centerX, this.height * 0.57, this.width + 260, 280, "cityline")
      .setDepth(-8)
      .setAlpha(0.95);

    this.grid = this.add
      .tileSprite(this.centerX, this.height - 210, this.width + 260, 250, "gridline")
      .setDepth(-6)
      .setAlpha(0.32);

    this.trackGlow = this.add
      .ellipse(this.centerX, this.height - 112, 340, 220, 0x48d2ff, 0.08)
      .setDepth(-5);

    this.trackGraphics = this.add.graphics().setDepth(-4);
    this.trackHighlights = this.add.graphics().setDepth(-3);
    this.roadReflection = this.add
      .rectangle(this.centerX, this.height - 76, this.width + 260, 110, 0x76ebff, 0.04)
      .setDepth(-2);

    this.drawTrack();
  }

  getLaneOffsetValue(laneIndex) {
    return [-1, 0, 1][laneIndex] ?? 0;
  }

  projectTrackPoint(offset, depth) {
    const clampedDepth = Phaser.Math.Clamp(depth, 0, 1.15);
    const spread = Phaser.Math.Linear(
      this.trackLaneSpreadTop,
      this.trackLaneSpreadBottom,
      clampedDepth
    );

    return {
      x: this.centerX + offset * spread,
      y: Phaser.Math.Linear(this.trackFarY, this.trackNearFloorY, clampedDepth),
      scale: Phaser.Math.Linear(0.24, 1.06, clampedDepth),
    };
  }

  getLanePoint(laneIndex, depth) {
    return this.projectTrackPoint(this.getLaneOffsetValue(laneIndex), depth);
  }

  getLaneX(laneIndex) {
    return this.getLanePoint(laneIndex, 1).x;
  }

  drawTrack() {
    const track = this.trackGraphics;
    const accents = this.trackHighlights;

    track.clear();
    accents.clear();

    const leftFar = this.projectTrackPoint(-1.72, 0.02);
    const rightFar = this.projectTrackPoint(1.72, 0.02);
    const leftNear = this.projectTrackPoint(-1.8, 1.08);
    const rightNear = this.projectTrackPoint(1.8, 1.08);

    track.fillStyle(0x071220, 0.94);
    track.fillPoints(
      [
        new Phaser.Geom.Point(leftFar.x, leftFar.y),
        new Phaser.Geom.Point(rightFar.x, rightFar.y),
        new Phaser.Geom.Point(rightNear.x, rightNear.y),
        new Phaser.Geom.Point(leftNear.x, leftNear.y),
      ],
      true
    );

    track.lineStyle(4, 0x76ebff, 0.28);
    track.beginPath();
    track.moveTo(leftFar.x, leftFar.y);
    track.lineTo(leftNear.x, leftNear.y);
    track.moveTo(rightFar.x, rightFar.y);
    track.lineTo(rightNear.x, rightNear.y);
    track.strokePath();

    const railOffsets = [-1.28, -0.84, -0.18, 0.18, 0.84, 1.28];
    railOffsets.forEach((offset) => {
      const start = this.projectTrackPoint(offset, 0.05);
      const end = this.projectTrackPoint(offset, 1.04);
      accents.lineStyle(offset === -0.18 || offset === 0.18 ? 4 : 3, 0x76ebff, 0.26);
      accents.beginPath();
      accents.moveTo(start.x, start.y);
      accents.lineTo(end.x, end.y);
      accents.strokePath();
    });

    for (let index = 0; index < 16; index += 1) {
      const z = ((index / 16) + this.trackFlow) % 1;
      if (z < 0.04) {
        continue;
      }

      const left = this.projectTrackPoint(-1.42, z);
      const right = this.projectTrackPoint(1.42, z);
      accents.lineStyle(Math.max(1.4, 4.5 * z), 0xff8cb5, 0.08 + z * 0.18);
      accents.beginPath();
      accents.moveTo(left.x, left.y);
      accents.lineTo(right.x, right.y);
      accents.strokePath();
    }

    [-0.5, 0.5].forEach((divider) => {
      for (let index = 0; index < 12; index += 1) {
        const z1 = ((index / 12) + this.trackFlow * 1.25) % 1;
        const z2 = Math.min(z1 + 0.07, 1.05);
        if (z1 < 0.08) {
          continue;
        }

        const start = this.projectTrackPoint(divider, z1);
        const end = this.projectTrackPoint(divider, z2);
        accents.lineStyle(Math.max(1.2, 5 * z1), 0xffd56e, 0.1 + z1 * 0.24);
        accents.beginPath();
        accents.moveTo(start.x, start.y);
        accents.lineTo(end.x, end.y);
        accents.strokePath();
      }
    });

    // Real road dashed white lane markings
    for (let index = 0; index < 18; index += 1) {
      const z = ((index / 18) + this.trackFlow * 1.5) % 1;
      if (z < 0.05 || z > 0.95) {
        continue;
      }
      
      const start = this.projectTrackPoint(-0.5, z);
      const end = this.projectTrackPoint(0.5, z);
      const dashLength = 0.05;
      const segmentLength = dashLength * 2;
      const segment = ((z / segmentLength) % 1);
      
      if (segment < 0.5) {
        accents.lineStyle(Math.max(2.8, 6 * z), 0xffffff, 0.32 + z * 0.28);
        accents.beginPath();
        accents.moveTo(start.x, start.y);
        accents.lineTo(end.x, end.y);
        accents.strokePath();
      }
    }
  }

  createTextures() {
    if (this.textures.exists("pixel")) {
      return;
    }

    createSolidTexture(this, "pixel", 2, 2, "#ffffff");

    createSkyTexture(this, "sky-sunny", ["#0d1232", "#203d71", "#ffbd72"], {
      orb: { x: 0.78, y: 0.2, r: 82, color: "rgba(255,211,123,0.95)" },
      haze: "rgba(255, 203, 130, 0.18)",
      extras(ctx, w, h) {
        for (let i = 0; i < 18; i += 1) {
          drawGlowCircle(
            ctx,
            Phaser.Math.Between(0, w),
            Phaser.Math.Between(h * 0.12, h * 0.6),
            Phaser.Math.Between(8, 20),
            "rgba(255, 214, 145, 0.16)"
          );
        }
      },
    });

    createSkyTexture(this, "sky-night", ["#070917", "#101433", "#16204e"], {
      orb: { x: 0.2, y: 0.18, r: 58, color: "rgba(132, 229, 255, 0.92)" },
      haze: "rgba(79, 132, 255, 0.14)",
      extras(ctx, w, h) {
        for (let i = 0; i < 72; i += 1) {
          drawGlowCircle(
            ctx,
            Phaser.Math.Between(0, w),
            Phaser.Math.Between(0, h * 0.72),
            Phaser.Math.Between(1, 3),
            "rgba(255,255,255,0.55)"
          );
        }
      },
    });

    createSkyTexture(this, "sky-snow", ["#09111f", "#183051", "#9bc3ff"], {
      orb: { x: 0.72, y: 0.18, r: 74, color: "rgba(205, 238, 255, 0.9)" },
      haze: "rgba(188, 230, 255, 0.18)",
      fogColor: "rgba(226, 242, 255, 0.08)",
    });

    createSkyTexture(this, "sky-rain", ["#05070f", "#121a2e", "#29405d"], {
      orb: { x: 0.8, y: 0.13, r: 52, color: "rgba(109, 177, 255, 0.48)" },
      haze: "rgba(92, 172, 255, 0.15)",
      fogColor: "rgba(103, 154, 225, 0.08)",
    });

    createSkyTexture(this, "sky-cyberstorm", ["#080611", "#132136", "#18385c"], {
      orb: { x: 0.82, y: 0.16, r: 60, color: "rgba(118, 235, 255, 0.82)" },
      haze: "rgba(255, 112, 164, 0.16)",
      extras(ctx, w, h) {
        for (let i = 0; i < 14; i += 1) {
          ctx.fillStyle = i % 2 === 0 ? "rgba(118,235,255,0.12)" : "rgba(255,111,176,0.1)";
          ctx.fillRect(Phaser.Math.Between(0, w), Phaser.Math.Between(0, h * 0.7), 2, Phaser.Math.Between(30, 110));
        }
      },
    });

    createSkyTexture(this, "sky-candy", ["#120721", "#29225a", "#ff8cb6"], {
      orb: { x: 0.26, y: 0.17, r: 72, color: "rgba(255, 184, 226, 0.88)" },
      haze: "rgba(255, 184, 226, 0.16)",
      extras(ctx, w, h) {
        for (let i = 0; i < 18; i += 1) {
          drawGlowCircle(
            ctx,
            Phaser.Math.Between(0, w),
            Phaser.Math.Between(0, h * 0.55),
            Phaser.Math.Between(5, 16),
            "rgba(255, 214, 158, 0.14)"
          );
        }
      },
    });

    createCityTexture(this);
    createGridTexture(this);
    createRoadTexture(this);
    createBearTextures(this);
    createObstacleTextures(this);
    createCollectibleTextures(this);
    createUiTextures(this);
  }

  updateBackdrop(dt) {
    const driftSpeed = this.state.running && !this.state.paused ? this.state.speed : 92;
    this.city.tilePositionX += driftSpeed * dt * 0.08;
    this.grid.tilePositionY += driftSpeed * dt * 0.5;
    this.trackFlow = (this.trackFlow + driftSpeed * dt * 0.0017) % 1;
    this.drawTrack();
  }

  registerInputs() {
    this.input.on("pointerdown", (pointer, targets) => {
      this.audioManager.unlock();

      if (targets.length > 0) {
        return;
      }

      if (this.state.screen === "menu") {
        this.beginRun();
        return;
      }

      if (this.state.screen === "gameover") {
        this.beginRun();
        return;
      }

      if (this.state.screen === "pause") {
        this.resumeGame();
        return;
      }

      if (this.state.running && !this.state.paused) {
        this.gestureStart = { x: pointer.x, y: pointer.y };
      }
    });

    this.input.on("pointerup", (pointer) => {
      if (!this.gestureStart || !this.state.running || this.state.paused) {
        this.gestureStart = null;
        return;
      }

      const dx = pointer.x - this.gestureStart.x;
      const dy = pointer.y - this.gestureStart.y;
      this.gestureStart = null;
      this.handleGesture(dx, dy);
    });

    this.keyHandler = (event) => {
      switch (event.code) {
        case "Space":
        case "ArrowUp":
        case "KeyW":
          this.handlePrimaryAction();
          break;

        case "ArrowDown":
        case "KeyS":
          this.handleDownAction();
          break;

        case "ArrowLeft":
        case "KeyA":
          if (!event.repeat) {
            this.handleLaneAction(-1);
          }
          break;

        case "ArrowRight":
        case "KeyD":
          if (!event.repeat) {
            this.handleLaneAction(1);
          }
          break;

        case "KeyP":
        case "Escape":
          if (!event.repeat) {
            this.togglePause();
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", this.keyHandler);
    this.events.once("shutdown", () => {
      window.removeEventListener("keydown", this.keyHandler);
    });
  }

  handleGesture(dx, dy) {
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absX < 18 && absY < 18) {
      this.player.jump();
      return;
    }

    if (absX > absY) {
      this.player.moveLane(dx > 0 ? 1 : -1);
      return;
    }

    if (dy > 20) {
      this.player.slide();
    } else {
      this.player.jump();
    }
  }

  handlePrimaryAction() {
    this.audioManager.unlock();

    if (this.state.screen === "menu") {
      this.beginRun();
      return;
    }

    if (this.state.screen === "gameover") {
      this.beginRun();
      return;
    }

    if (this.state.screen === "pause") {
      this.resumeGame();
      return;
    }

    if (this.state.running && !this.state.paused) {
      this.player.jump();
    }
  }

  handleDownAction() {
    this.audioManager.unlock();

    if (this.state.screen === "menu") {
      this.beginRun();
      return;
    }

    if (this.state.screen === "gameover") {
      this.beginRun();
      return;
    }

    if (this.state.screen === "pause") {
      this.resumeGame();
      return;
    }

    if (this.state.running && !this.state.paused) {
      this.player.slide();
    }
  }

  handleLaneAction(direction) {
    this.audioManager.unlock();

    if (this.state.screen === "menu") {
      this.beginRun();
      return;
    }

    if (this.state.screen === "gameover") {
      this.beginRun();
      return;
    }

    if (this.state.screen === "pause") {
      this.resumeGame();
      return;
    }

    if (this.state.running && !this.state.paused) {
      this.player.moveLane(direction);
    }
  }

  beginRun() {
    this.state = this.createFreshRunState();
    this.state.screen = "running";
    this.state.running = true;
    this.nextSpeedRampAt = SPEED_STEP_MS;
    this.player.reset();
    this.obstacles.reset();
    this.collectibles.reset();
    this.effects.clearTransient();
    this.ui.hideOverlay();
    this.audioManager.resume();
    this.sdk.gameplayStart();
    this.ui.showToast("Swipe or use arrows: left, right, up, down", FLOATING_TEXT_COLORS.gold, 2000);
  }

  showMenu() {
    this.state.screen = "menu";
    this.state.running = false;
    this.state.paused = false;
    this.state.gameOver = false;
    this.state.worldTimeScale = 1;
    this.player.reset();
    this.obstacles.reset();
    this.collectibles.reset();
    this.sdk.gameplayStop();

    const dailyReward = this.pendingDailyReward;

    this.ui.showMenu({
      bestScore: this.progress.highScore,
      wallet: this.progress.wallet,
      leaderboard: this.progress.leaderboard,
      sdkLabel: this.sdk.label,
      chestReady: this.progress.chestReady,
      dailyReward,
    });

    this.pendingDailyReward = 0;
  }

  pauseGame() {
    if (!this.state.running || this.state.paused || this.state.gameOver) {
      return;
    }

    this.state.paused = true;
    this.state.screen = "pause";
    this.sdk.gameplayStop();
    this.audioManager.pause();
    this.ui.showPause({
      score: Math.floor(this.state.score),
      bestScore: this.progress.highScore,
      weather: this.weather.getCurrentDefinition().label,
    });
  }

  resumeGame() {
    if (!this.state.paused || this.state.gameOver) {
      return;
    }

    this.state.paused = false;
    this.state.screen = "running";
    this.sdk.gameplayStart();
    this.audioManager.resume();
    this.ui.hideOverlay();
  }

  togglePause() {
    if (this.state.screen === "menu" || this.state.screen === "gameover") {
      return;
    }

    if (this.state.paused) {
      this.resumeGame();
    } else {
      this.pauseGame();
    }
  }

  returnToMenu() {
    this.audioManager.resume();
    this.showMenu();
  }

  increaseSpeed() {
    this.state.speed += 20;
    this.nextSpeedRampAt += SPEED_STEP_MS;
    this.effects.floatLabel(
      "Speed Up",
      this.centerX,
      148,
      FLOATING_TEXT_COLORS.pink,
      22
    );
    this.effects.backgroundPulse(this.weather.getCurrentDefinition().accent);
    this.ui.showToast(`Road speed: ${Math.floor(this.state.speed)}`, FLOATING_TEXT_COLORS.pink, 1300);
    this.audioManager.playWeatherSwap();
  }

  addScore(amount) {
    this.state.score += amount;
  }

  registerCombo(comboGain = 1) {
    this.state.comboChain += comboGain;
    this.state.comboTimer = 2400;

    const previous = this.state.comboMultiplier;
    this.state.comboMultiplier = Math.min(5, 1 + Math.floor(this.state.comboChain / 3));
    this.state.stats.bestCombo = Math.max(this.state.stats.bestCombo, this.state.comboMultiplier);

    if (this.state.comboMultiplier > previous) {
      this.effects.pulseCombo(this.state.comboMultiplier);
      this.audioManager.playCollect("combo");
    }
  }

  updateCombo(delta) {
    if (this.state.comboTimer <= 0) {
      return;
    }

    this.state.comboTimer -= delta;

    if (this.state.comboTimer <= 0) {
      this.state.comboChain = 0;
      this.state.comboMultiplier = 1;
    }
  }

  handleCollect(item) {
    this.state.stats.collected += 1;

    if (item.definition.rare) {
      this.state.stats.rareCollected += 1;
    }

    this.registerCombo(item.definition.comboGain ?? 1);

    const totalValue = Math.round(item.definition.value * this.state.comboMultiplier);
    this.addScore(totalValue);
    this.progress.wallet += item.definition.bankValue;
    this.progress.totalCollected += item.definition.bankValue;

    this.progress.chestCharge += item.definition.chestCharge;
    while (this.progress.chestCharge >= CHEST_THRESHOLD) {
      this.progress.chestCharge -= CHEST_THRESHOLD;
      this.progress.chestReady += 1;
      this.ui.notifyChestReady(this.progress.chestReady);
      this.audioManager.playChest();
    }

    this.effects.spawnCollectBurst(item.sprite.x, item.sprite.y, item.definition.color);
    this.effects.floatLabel(
      `+${totalValue}`,
      item.sprite.x,
      item.sprite.y - 10,
      item.definition.textColor,
      item.definition.rare ? 22 : 18
    );
    this.audioManager.playCollect(item.definition.audioKey);
    this.queueSave();
  }

  handleNearMiss(obstacle) {
    if (!this.state.running || this.state.gameOver) {
      return;
    }

    this.state.stats.nearMisses += 1;
    this.registerCombo(2);

    const bonus = 70 * this.state.comboMultiplier;
    this.addScore(bonus);
    this.effects.flashNearMiss(
      obstacle.sprite.x,
      obstacle.sprite.y - obstacle.config.height * 0.45,
      obstacle.config.glowColor
    );
    this.effects.floatLabel(
      `NEAR MISS +${bonus}`,
      this.player.sprite.x + 86,
      this.player.sprite.y - 72,
      FLOATING_TEXT_COLORS.gold,
      17
    );
    this.audioManager.playNearMiss();

    this.state.worldTimeScale = 0.42;
    this.tweens.killTweensOf(this.state);
    this.tweens.add({
      targets: this.state,
      worldTimeScale: 1,
      duration: 240,
      ease: "Quad.easeOut",
    });

    this.cameras.main.stopFollow();
    this.cameras.main.zoomTo(1.045, 90);
    this.time.delayedCall(150, () => {
      this.cameras.main.zoomTo(1, 180);
    });
  }

  handleCrash(obstacle) {
    if (!this.state.running || this.state.invincibleTimer > 0) {
      return;
    }

    this.state.running = false;
    this.state.gameOver = true;
    this.state.screen = "gameover";
    this.state.worldTimeScale = 1;

    this.player.crash();
    this.effects.spawnDeathExplosion(
      this.player.sprite.x,
      this.player.sprite.y,
      obstacle.config.glowColor
    );
    this.cameras.main.shake(180, 0.015);
    this.audioManager.playCrash();
    this.sdk.gameplayStop();

    const finalScore = Math.floor(this.state.score);
    const bestScore = Math.max(this.progress.highScore, finalScore);
    const isNewBest = finalScore > this.progress.highScore;

    this.progress.highScore = bestScore;
    this.progress.totalRuns += 1;
    this.progress.leaderboard = updateLeaderboard(this.progress.leaderboard, finalScore);
    this.queueSave(true);

    if (isNewBest || finalScore >= 2600) {
      this.sdk.triggerHappyTime();
    }

    if (this.sdk.provider !== "local" && this.state.timeAlive > 18000) {
      this.playInterstitialBreak();
    }

    this.refreshPersistentUi();

    this.ui.showGameOver({
      score: finalScore,
      bestScore,
      leaderboard: this.progress.leaderboard,
      canRevive: !this.state.revived,
      wallet: this.progress.wallet,
      chestReady: this.progress.chestReady,
      stats: this.state.stats,
      newBest: isNewBest,
    });
  }

  async playInterstitialBreak() {
    await this.sdk.commercialBreak({
      onStart: () => this.audioManager.setAdMuted(true),
      onFinish: () => this.audioManager.setAdMuted(false),
      onError: () => this.audioManager.setAdMuted(false),
    });
  }

  async useRewardedBoost() {
    const bonus = Phaser.Math.Between(150, 230);
    this.ui.showToast("Reward break requested", FLOATING_TEXT_COLORS.cyan, 1100);

    const rewarded = await this.sdk.rewardedBreak({
      onStart: () => this.audioManager.setAdMuted(true),
      onReward: () => {
        this.progress.wallet += bonus;
        this.progress.chestCharge = Math.min(CHEST_THRESHOLD - 1, this.progress.chestCharge + 2);
        this.effects.spawnReviveBurst(this.centerX, this.centerY - 20);
        this.effects.floatLabel(
          `BONUS +${bonus}`,
          this.centerX,
          this.centerY - 10,
          FLOATING_TEXT_COLORS.mint,
          24
        );
        this.audioManager.playChest();
        this.queueSave(true);
      },
      onFinish: () => {
        this.audioManager.setAdMuted(false);
        this.refreshPersistentUi();
        if (this.state.screen === "menu") {
          this.showMenu();
        }
      },
      onError: () => this.audioManager.setAdMuted(false),
    });

    if (!rewarded) {
      this.ui.showToast("No rewarded ad available right now", FLOATING_TEXT_COLORS.pink, 1600);
    }
  }

  async useRevive() {
    if (!this.state.gameOver || this.state.revived) {
      return;
    }

    const rewarded = await this.sdk.rewardedBreak({
      onStart: () => this.audioManager.setAdMuted(true),
      onReward: () => {
        this.reviveRun();
      },
      onFinish: () => this.audioManager.setAdMuted(false),
      onError: () => this.audioManager.setAdMuted(false),
    });

    if (!rewarded) {
      this.ui.showToast("Revive ad unavailable", FLOATING_TEXT_COLORS.pink, 1400);
    }
  }

  reviveRun() {
    this.state.running = true;
    this.state.gameOver = false;
    this.state.screen = "running";
    this.state.revived = true;
    this.state.invincibleTimer = 1400;
    this.player.revive();
    this.player.setInvincible(true);
    this.obstacles.clearUnsafeObstacles(0.72);
    this.collectibles.nudgeForward(0.48);
    this.effects.spawnReviveBurst(this.player.sprite.x, this.player.sprite.y - 8);
    this.ui.hideOverlay();
    this.sdk.gameplayStart();
    this.audioManager.playRevive();
  }

  claimChestReward() {
    if (this.progress.chestReady <= 0) {
      this.ui.showToast("Chest still charging", FLOATING_TEXT_COLORS.gold, 1200);
      return;
    }

    const reward = Phaser.Math.Between(180, 320);
    this.progress.chestReady -= 1;
    this.progress.wallet += reward;
    this.queueSave(true);
    this.refreshPersistentUi();
    this.effects.spawnReviveBurst(this.centerX, this.centerY - 16);
    this.effects.floatLabel(
      `CHEST +${reward}`,
      this.centerX,
      this.centerY - 8,
      FLOATING_TEXT_COLORS.gold,
      24
    );
    this.audioManager.playChest();

    if (this.state.screen === "menu") {
      this.showMenu();
    } else if (this.state.screen === "gameover") {
      this.ui.showGameOver({
        score: Math.floor(this.state.score),
        bestScore: this.progress.highScore,
        leaderboard: this.progress.leaderboard,
        canRevive: !this.state.revived && this.state.gameOver,
        wallet: this.progress.wallet,
        chestReady: this.progress.chestReady,
        stats: this.state.stats,
        newBest: false,
      });
    }
  }

  applyDailyReward() {
    const today = new Date().toISOString().slice(0, 10);

    if (this.progress.dailyRewardDate === today) {
      return;
    }

    const reward = Phaser.Math.Between(100, 180);
    this.progress.dailyRewardDate = today;
    this.progress.wallet += reward;
    this.pendingDailyReward = reward;
    this.queueSave(true);
  }

  queueSave(force = false) {
    if (force) {
      saveProgress(this.progress);
      this.saveQueued = false;
      return;
    }

    if (this.saveQueued) {
      return;
    }

    this.saveQueued = true;
    this.time.delayedCall(320, () => {
      saveProgress(this.progress);
      this.saveQueued = false;
      this.refreshPersistentUi();
    });
  }

  refreshPersistentUi() {
    this.ui?.refreshPersistentPanels?.({
      bestScore: this.progress.highScore,
      wallet: this.progress.wallet,
      chestReady: this.progress.chestReady,
      chestCharge: this.progress.chestCharge,
    });
  }

  getHudData() {
    return {
      score: Math.floor(this.state.displayedScore || this.state.score),
      bestScore: this.progress.highScore,
      comboMultiplier: this.state.comboMultiplier,
      speed: Math.floor(this.state.speed),
      weather: this.weather.getCurrentDefinition().label,
      wallet: this.progress.wallet,
      chestReady: this.progress.chestReady,
      chestCharge: this.progress.chestCharge / CHEST_THRESHOLD,
      paused: this.state.paused,
      screen: this.state.screen,
    };
  }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return cloneDefaultProgress();
    }

    const parsed = JSON.parse(raw);
    return {
      ...cloneDefaultProgress(),
      ...parsed,
      leaderboard: Array.isArray(parsed.leaderboard) ? parsed.leaderboard.slice(0, 5) : [],
    };
  } catch (error) {
    console.warn("Progress reset:", error);
    return cloneDefaultProgress();
  }
}

function cloneDefaultProgress() {
  return JSON.parse(JSON.stringify(DEFAULT_PROGRESS));
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.warn("Progress save failed:", error);
  }
}

function updateLeaderboard(existing, score) {
  const stamp = new Date().toISOString().slice(5, 10).replace("-", "/");
  return [...existing, { score, stamp }]
    .sort((left, right) => right.score - left.score)
    .slice(0, 5);
}

function createSolidTexture(scene, key, width, height, color) {
  const texture = scene.textures.createCanvas(key, width, height);
  const { context } = texture;
  context.fillStyle = color;
  context.fillRect(0, 0, width, height);
  texture.refresh();
}

function createSkyTexture(scene, key, colors, options = {}) {
  const width = 480;
  const height = 860;
  const texture = scene.textures.createCanvas(key, width, height);
  const { context: ctx } = texture;

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  if (options.haze) {
    ctx.fillStyle = options.haze;
    ctx.fillRect(0, height * 0.46, width, height * 0.42);
  }

  if (options.fogColor) {
    ctx.fillStyle = options.fogColor;
    ctx.fillRect(0, height * 0.58, width, height * 0.28);
  }

  if (options.orb) {
    drawGlowCircle(
      ctx,
      width * options.orb.x,
      height * options.orb.y,
      options.orb.r,
      options.orb.color
    );
  }

  options.extras?.(ctx, width, height);
  texture.refresh();
}

function createCityTexture(scene) {
  const width = 960;
  const height = 280;
  const texture = scene.textures.createCanvas("cityline", width, height);
  const { context: ctx } = texture;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(6, 10, 23, 0.95)";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#0a1022";
  ctx.fillRect(0, 0, width, height * 0.16);

  for (let x = 0; x < width; ) {
    const buildingWidth = Phaser.Math.Between(38, 94);
    const buildingHeight = Phaser.Math.Between(60, 210);
    const y = height - buildingHeight;

    ctx.fillStyle = `rgba(${Phaser.Math.Between(4, 18)}, ${Phaser.Math.Between(
      10,
      30
    )}, ${Phaser.Math.Between(28, 60)}, 0.95)`;
    roundRect(ctx, x, y, buildingWidth, buildingHeight, 8, true, false);

    for (let wx = x + 8; wx < x + buildingWidth - 6; wx += 14) {
      for (let wy = y + 12; wy < y + buildingHeight - 10; wy += 16) {
        if (Math.random() > 0.38) {
          ctx.fillStyle = Math.random() > 0.5 ? "rgba(118, 235, 255, 0.68)" : "rgba(255, 111, 176, 0.52)";
          ctx.fillRect(wx, wy, 4, 7);
        }
      }
    }

    if (Math.random() > 0.64) {
      ctx.fillStyle = "rgba(118, 235, 255, 0.65)";
      ctx.fillRect(x + buildingWidth * 0.5 - 2, y - 16, 4, 18);
      drawGlowCircle(ctx, x + buildingWidth * 0.5, y - 16, 6, "rgba(118,235,255,0.4)");
    }

    x += buildingWidth - 4;
  }

  const horizonGradient = ctx.createLinearGradient(0, 0, 0, height);
  horizonGradient.addColorStop(0, "rgba(118,235,255,0)");
  horizonGradient.addColorStop(1, "rgba(118,235,255,0.12)");
  ctx.fillStyle = horizonGradient;
  ctx.fillRect(0, 0, width, height);

  texture.refresh();
}

function createGridTexture(scene) {
  const width = 960;
  const height = 250;
  const texture = scene.textures.createCanvas("gridline", width, height);
  const { context: ctx } = texture;

  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "rgba(118,235,255,0)");
  gradient.addColorStop(0.52, "rgba(33,71,109,0.06)");
  gradient.addColorStop(1, "rgba(118,235,255,0.12)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(118, 235, 255, 0.18)";
  ctx.lineWidth = 2;

  const horizonY = 18;
  for (let i = 0; i < 18; i += 1) {
    const x = (i / 17) * width;
    ctx.beginPath();
    ctx.moveTo(width * 0.5, horizonY);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = horizonY + 14; y < height; y += 22) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  texture.refresh();
}

function createRoadTexture(scene) {
  const width = 960;
  const height = 164;
  const texture = scene.textures.createCanvas("road", width, height);
  const { context: ctx } = texture;

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#11243f");
  gradient.addColorStop(0.3, "#0f1424");
  gradient.addColorStop(1, "#05060a");
  ctx.fillStyle = gradient;
  roundRect(ctx, 0, 0, width, height, 30, true, false);

  ctx.fillStyle = "rgba(118,235,255,0.09)";
  ctx.fillRect(0, 0, width, 20);

  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  ctx.lineWidth = 3;
  ctx.setLineDash([18, 18]);
  ctx.beginPath();
  ctx.moveTo(0, height * 0.42);
  ctx.lineTo(width, height * 0.42);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(118,235,255,0.07)";
  for (let x = 0; x < width; x += 58) {
    roundRect(ctx, x, height - 44, 28, 12, 6, true, false);
  }

  texture.refresh();
}

function createBearTextures(scene) {
  createBearTexture(scene, "teddy-run-a", { armSwing: 7, legSwing: 10, tilt: -3 });
  createBearTexture(scene, "teddy-run-b", { armSwing: -7, legSwing: -10, tilt: 3 });
  createBearTexture(scene, "teddy-jump", { armSwing: 1, legSwing: 0, tilt: -8 });
  createBearTexture(scene, "teddy-hurt", { armSwing: -2, legSwing: 1, tilt: 9, hurt: true });
}

function createBearTexture(scene, key, frame) {
  const width = 120;
  const height = 120;
  const texture = scene.textures.createCanvas(key, width, height);
  const { context: ctx } = texture;
  const glow = frame.hurt ? "#ff6f9c" : "#78f0ff";

  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(60, 66);
  ctx.rotate((frame.tilt * Math.PI) / 180);
  ctx.shadowColor = glow;
  ctx.shadowBlur = 22;
  ctx.lineWidth = 5;
  ctx.strokeStyle = glow;

  const fur = frame.hurt ? "#8e5a60" : "#9a6a4f";
  const inner = "#f5d7c0";
  const neonCore = frame.hurt ? "#ff8cb1" : "#93f7ff";

  // Ears
  fillCircle(ctx, -23, -30, 13, fur, glow, 4);
  fillCircle(ctx, 23, -30, 13, fur, glow, 4);
  fillCircle(ctx, -23, -30, 6, "#f7b2c1");
  fillCircle(ctx, 23, -30, 6, "#f7b2c1");

  // Head
  fillCircle(ctx, 0, -12, 28, fur, glow, 5);
  fillCircle(ctx, 0, -6, 12, inner);
  fillCircle(ctx, 0, 0, 9, inner);

  // Arms
  ctx.lineCap = "round";
  ctx.strokeStyle = glow;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(-25, 14);
  ctx.lineTo(-38, 28 + frame.armSwing);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(25, 14);
  ctx.lineTo(38, 28 - frame.armSwing);
  ctx.stroke();

  ctx.strokeStyle = fur;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(-25, 14);
  ctx.lineTo(-38, 28 + frame.armSwing);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(25, 14);
  ctx.lineTo(38, 28 - frame.armSwing);
  ctx.stroke();

  // Body
  ctx.fillStyle = fur;
  ctx.strokeStyle = glow;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(0, 28, 27, 32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Belly heart
  drawHeart(ctx, 0, 34, 12, frame.hurt ? "#ffd1de" : "#9af5ff");

  // Legs
  ctx.lineCap = "round";
  ctx.strokeStyle = glow;
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(-12, 52);
  ctx.lineTo(-15 + frame.legSwing, 74);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(12, 52);
  ctx.lineTo(15 - frame.legSwing, 74);
  ctx.stroke();

  ctx.strokeStyle = fur;
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(-12, 52);
  ctx.lineTo(-15 + frame.legSwing, 74);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(12, 52);
  ctx.lineTo(15 - frame.legSwing, 74);
  ctx.stroke();

  // Face
  fillCircle(ctx, -10, -16, 4, "#182335");
  fillCircle(ctx, 10, -16, 4, "#182335");
  fillCircle(ctx, -10, -17, 1.7, "#ffffff");
  fillCircle(ctx, 10, -17, 1.7, "#ffffff");
  fillCircle(ctx, 0, -4, 4, "#5b392c");

  ctx.strokeStyle = neonCore;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 1, 8, 0.35, Math.PI - 0.35);
  ctx.stroke();

  fillCircle(ctx, 0, 8, 1.8, neonCore);
  ctx.restore();
  texture.refresh();
}

function createObstacleTextures(scene) {
  createCrateTexture(scene, "crate", 58, 58, "#11263e", "#ff8a73");
  createDoubleCrateTexture(scene, "crate-double");
  createHoverCrateTexture(scene, "robo-crate");
  createLaserGateTexture(scene, "laser-gate");
}

function createCrateTexture(scene, key, width, height, fill, glow) {
  const texture = scene.textures.createCanvas(key, width, height);
  const { context: ctx } = texture;

  ctx.clearRect(0, 0, width, height);
  roundRect(ctx, 3, 3, width - 6, height - 6, 10, true, true, fill, glow, 4);
  ctx.strokeStyle = glow;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(14, 16);
  ctx.lineTo(width - 14, height - 16);
  ctx.moveTo(width - 14, 16);
  ctx.lineTo(14, height - 16);
  ctx.stroke();

  ctx.strokeStyle = "rgba(118,235,255,0.75)";
  ctx.beginPath();
  ctx.moveTo(10, 8);
  ctx.lineTo(width - 10, 8);
  ctx.stroke();

  texture.refresh();
}

function createDoubleCrateTexture(scene, key) {
  const width = 64;
  const height = 108;
  const texture = scene.textures.createCanvas(key, width, height);
  const { context: ctx } = texture;

  ctx.clearRect(0, 0, width, height);
  drawCrateBlock(ctx, 3, 52, 58, 53, "#101c2d", "#ff8a73");
  drawCrateBlock(ctx, 6, 2, 52, 53, "#15263d", "#ffd173");
  texture.refresh();
}

function drawCrateBlock(ctx, x, y, w, h, fill, glow) {
  roundRect(ctx, x, y, w, h, 9, true, true, fill, glow, 4);
  ctx.strokeStyle = glow;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 12, y + 14);
  ctx.lineTo(x + w - 12, y + h - 14);
  ctx.moveTo(x + w - 12, y + 14);
  ctx.lineTo(x + 12, y + h - 14);
  ctx.stroke();
}

function createHoverCrateTexture(scene, key) {
  const width = 68;
  const height = 62;
  const texture = scene.textures.createCanvas(key, width, height);
  const { context: ctx } = texture;

  ctx.clearRect(0, 0, width, height);
  ctx.shadowColor = "#76ebff";
  ctx.shadowBlur = 16;
  ctx.fillStyle = "#17334e";
  ctx.strokeStyle = "#76ebff";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(34, 26, 24, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  fillCircle(ctx, 24, 24, 4, "#ff8cb5");
  fillCircle(ctx, 44, 24, 4, "#ff8cb5");
  ctx.fillStyle = "#a8faff";
  ctx.fillRect(18, 44, 32, 4);
  texture.refresh();
}

function createLaserGateTexture(scene, key) {
  const width = 92;
  const height = 40;
  const texture = scene.textures.createCanvas(key, width, height);
  const { context: ctx } = texture;

  ctx.clearRect(0, 0, width, height);
  roundRect(ctx, 2, 10, width - 4, 20, 12, true, true, "#151729", "#ff6f9c", 4);
  ctx.fillStyle = "rgba(118,235,255,0.85)";
  ctx.fillRect(10, 18, width - 20, 4);
  texture.refresh();
}

function createCollectibleTextures(scene) {
  createChocolateTexture(scene);
  createFlowerTexture(scene);
  createCandyTexture(scene);
  createHoneyTexture(scene);
  createStarTexture(scene);
  createSnowmanTexture(scene);
  createDropletTexture(scene);
  createChipTexture(scene);
  createCupcakeTexture(scene);
}

function createChocolateTexture(scene) {
  const texture = scene.textures.createCanvas("collect-chocolate", 50, 50);
  const { context: ctx } = texture;
  roundRect(ctx, 8, 10, 34, 28, 10, true, true, "#6c351c", "#ffcf69", 3);
  ctx.strokeStyle = "rgba(255,225,180,0.6)";
  ctx.lineWidth = 2;
  for (let x = 18; x <= 32; x += 8) {
    ctx.beginPath();
    ctx.moveTo(x, 12);
    ctx.lineTo(x, 36);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(10, 24);
  ctx.lineTo(40, 24);
  ctx.stroke();
  texture.refresh();
}

function createFlowerTexture(scene) {
  const texture = scene.textures.createCanvas("collect-flower", 52, 52);
  const { context: ctx } = texture;
  const petals = [
    [26, 11],
    [14, 22],
    [38, 22],
    [18, 36],
    [34, 36],
  ];

  petals.forEach(([x, y]) => fillCircle(ctx, x, y, 9, "#ff89bb", "#ffd5e8", 2));
  fillCircle(ctx, 26, 26, 8, "#ffd56e", "#fff0b0", 2);
  ctx.fillStyle = "#7ef2a9";
  ctx.fillRect(24, 32, 4, 14);
  texture.refresh();
}

function createCandyTexture(scene) {
  const texture = scene.textures.createCanvas("collect-candy", 52, 52);
  const { context: ctx } = texture;
  ctx.strokeStyle = "#76ebff";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(8, 26);
  ctx.lineTo(16, 18);
  ctx.lineTo(16, 34);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(44, 26);
  ctx.lineTo(36, 18);
  ctx.lineTo(36, 34);
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = "#ff8cb5";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(26, 26, 10, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "#ffd56e";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(26, 26, 5, 0, Math.PI * 2);
  ctx.stroke();
  texture.refresh();
}

function createHoneyTexture(scene) {
  const texture = scene.textures.createCanvas("collect-honey", 50, 54);
  const { context: ctx } = texture;
  ctx.fillStyle = "#ffd56e";
  ctx.strokeStyle = "#fff3bc";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(25, 8);
  ctx.bezierCurveTo(40, 18, 38, 34, 25, 44);
  ctx.bezierCurveTo(12, 34, 10, 18, 25, 8);
  ctx.fill();
  ctx.stroke();
  texture.refresh();
}

function createStarTexture(scene) {
  const texture = scene.textures.createCanvas("collect-star", 56, 56);
  const { context: ctx } = texture;
  drawStar(ctx, 28, 28, 5, 9, 18, "#ffef9d", "#76ebff");
  texture.refresh();
}

function createSnowmanTexture(scene) {
  const texture = scene.textures.createCanvas("collect-snowman", 52, 56);
  const { context: ctx } = texture;
  fillCircle(ctx, 26, 36, 12, "#eaf4ff", "#c9e9ff", 2);
  fillCircle(ctx, 26, 20, 9, "#f7fbff", "#c9e9ff", 2);
  ctx.fillStyle = "#ff9d69";
  ctx.beginPath();
  ctx.moveTo(26, 22);
  ctx.lineTo(34, 24);
  ctx.lineTo(26, 26);
  ctx.fill();
  fillCircle(ctx, 22, 18, 1.6, "#162335");
  fillCircle(ctx, 30, 18, 1.6, "#162335");
  texture.refresh();
}

function createDropletTexture(scene) {
  const texture = scene.textures.createCanvas("collect-droplet", 48, 56);
  const { context: ctx } = texture;
  ctx.fillStyle = "#76ebff";
  ctx.strokeStyle = "#b9faff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(24, 8);
  ctx.bezierCurveTo(38, 20, 36, 42, 24, 48);
  ctx.bezierCurveTo(12, 42, 10, 20, 24, 8);
  ctx.fill();
  ctx.stroke();
  texture.refresh();
}

function createChipTexture(scene) {
  const texture = scene.textures.createCanvas("collect-microchip", 54, 54);
  const { context: ctx } = texture;
  roundRect(ctx, 10, 10, 34, 34, 8, true, true, "#15364f", "#76ebff", 3);
  ctx.fillStyle = "#ff8cb5";
  ctx.fillRect(18, 18, 18, 18);
  for (let i = 12; i <= 40; i += 8) {
    ctx.fillStyle = "#76ebff";
    ctx.fillRect(i, 4, 2, 8);
    ctx.fillRect(i, 42, 2, 8);
    ctx.fillRect(4, i, 8, 2);
    ctx.fillRect(42, i, 8, 2);
  }
  texture.refresh();
}

function createCupcakeTexture(scene) {
  const texture = scene.textures.createCanvas("collect-cupcake", 54, 54);
  const { context: ctx } = texture;
  ctx.fillStyle = "#ffd56e";
  ctx.beginPath();
  ctx.moveTo(16, 24);
  ctx.lineTo(38, 24);
  ctx.lineTo(34, 42);
  ctx.lineTo(20, 42);
  ctx.closePath();
  ctx.fill();
  fillCircle(ctx, 27, 21, 12, "#ff8cb5", "#ffe0ef", 2);
  fillCircle(ctx, 22, 16, 6, "#76ebff", "#d7fbff", 2);
  fillCircle(ctx, 31, 14, 4, "#9df6bd", "#effff6", 2);
  texture.refresh();
}

function createUiTextures(scene) {
  createSoftPanelTexture(scene, "ui-card-bear", 220, 120, {
    top: "#4a314d",
    bottom: "#2f233e",
    stroke: "#ffd6e7",
    glow: "rgba(255, 190, 220, 0.24)",
    paw: "#ffe6f0",
    accent: "#9ef6ff",
    radius: 28,
  });

  createSoftPanelTexture(scene, "ui-chip-bear", 220, 64, {
    top: "#4a314d",
    bottom: "#2f233e",
    stroke: "#ffd6e7",
    glow: "rgba(158, 246, 255, 0.16)",
    paw: "#ffe6f0",
    accent: "#ffd98a",
    radius: 24,
  });

  createSoftPanelTexture(scene, "ui-progress-bear", 280, 40, {
    top: "#3a2c44",
    bottom: "#261d31",
    stroke: "#ffe0ed",
    glow: "rgba(255, 190, 220, 0.18)",
    paw: "#ffe6f0",
    accent: "#ffd98a",
    radius: 22,
  });

  createSoftPanelTexture(scene, "ui-overlay-bear", 420, 540, {
    top: "#35223f",
    bottom: "#24192f",
    stroke: "#ffd6e7",
    glow: "rgba(158, 246, 255, 0.18)",
    paw: "#ffe6f0",
    accent: "#aef7c9",
    radius: 36,
  });

  createSoftPanelTexture(scene, "ui-button-cyan", 280, 76, {
    top: "#3f3d66",
    bottom: "#2d3257",
    stroke: "#9ef6ff",
    glow: "rgba(158, 246, 255, 0.24)",
    paw: "#f7fcff",
    accent: "#9ef6ff",
    radius: 28,
  });

  createSoftPanelTexture(scene, "ui-button-pink", 280, 74, {
    top: "#65415d",
    bottom: "#482d43",
    stroke: "#ffb7d6",
    glow: "rgba(255, 183, 214, 0.26)",
    paw: "#ffeaf2",
    accent: "#ffdb8a",
    radius: 28,
  });

  createSoftPanelTexture(scene, "ui-button-mint", 280, 74, {
    top: "#34514e",
    bottom: "#233b39",
    stroke: "#c3ffe5",
    glow: "rgba(195, 255, 229, 0.22)",
    paw: "#f3fff9",
    accent: "#9ef6ff",
    radius: 28,
  });

  createSoftPanelTexture(scene, "ui-button-gold", 280, 74, {
    top: "#62492a",
    bottom: "#47341c",
    stroke: "#ffd98a",
    glow: "rgba(255, 217, 138, 0.24)",
    paw: "#fff7df",
    accent: "#ffb7d6",
    radius: 28,
  });
}

function createSoftPanelTexture(scene, key, width, height, palette) {
  const texture = scene.textures.createCanvas(key, width, height);
  const { context: ctx } = texture;
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, palette.top);
  gradient.addColorStop(1, palette.bottom);

  roundRect(ctx, 4, 6, width - 8, height - 12, palette.radius, true, false, gradient);
  roundRect(ctx, 4, 6, width - 8, height - 12, palette.radius, false, true, undefined, palette.stroke, 3);

  ctx.fillStyle = "rgba(255,255,255,0.07)";
  roundRect(ctx, 10, 12, width - 20, height * 0.3, palette.radius - 8, true, false);

  drawGlowCircle(ctx, width * 0.78, height * 0.28, Math.min(width, height) * 0.32, palette.glow);
  drawGlowCircle(ctx, width * 0.2, height * 0.2, Math.min(width, height) * 0.18, "rgba(255,255,255,0.06)");
  drawPaw(ctx, width - 38, height - 28, 10, palette.paw, 0.24);
  fillCircle(ctx, 26, 24, 5, palette.accent);

  texture.refresh();
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke, fillStyle, strokeStyle, lineWidth = 1) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();

  if (fill) {
    if (fillStyle !== undefined) {
      ctx.fillStyle = fillStyle;
    }
    ctx.fill();
  }

  if (stroke) {
    if (strokeStyle !== undefined) {
      ctx.strokeStyle = strokeStyle;
    }
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function fillCircle(ctx, x, y, r, fillStyle, strokeStyle, lineWidth = 0) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fillStyle;
  ctx.fill();

  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function drawGlowCircle(ctx, x, y, radius, color) {
  const gradient = ctx.createRadialGradient(x, y, radius * 0.15, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawHeart(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.55);
  ctx.bezierCurveTo(size * 0.9, -size * 0.2, size * 1.2, -size * 0.95, 0, -size * 1.15);
  ctx.bezierCurveTo(-size * 1.2, -size * 0.95, -size * 0.9, -size * 0.2, 0, size * 0.55);
  ctx.fill();
  ctx.restore();
}

function drawPaw(ctx, x, y, size, color, alpha = 0.3) {
  ctx.save();
  ctx.globalAlpha = alpha;
  fillCircle(ctx, x, y, size * 0.82, color);
  fillCircle(ctx, x - size * 0.95, y - size * 1.08, size * 0.36, color);
  fillCircle(ctx, x - size * 0.28, y - size * 1.34, size * 0.34, color);
  fillCircle(ctx, x + size * 0.28, y - size * 1.34, size * 0.34, color);
  fillCircle(ctx, x + size * 0.95, y - size * 1.08, size * 0.36, color);
  ctx.restore();
}

function drawStar(ctx, x, y, spikes, innerRadius, outerRadius, fill, stroke) {
  let rotation = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(x, y - outerRadius);

  for (let i = 0; i < spikes; i += 1) {
    ctx.lineTo(
      x + Math.cos(rotation) * outerRadius,
      y + Math.sin(rotation) * outerRadius
    );
    rotation += step;
    ctx.lineTo(
      x + Math.cos(rotation) * innerRadius,
      y + Math.sin(rotation) * innerRadius
    );
    rotation += step;
  }

  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2.5;
  ctx.stroke();
}
