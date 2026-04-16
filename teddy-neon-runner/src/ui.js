export class UI {
  constructor(scene) {
    this.scene = scene;
    this.hudObjects = [];
    this.overlayObjects = [];
    this.buttons = {};
    this.currentOverlay = null;
    this.latestPersistent = {
      bestScore: 0,
      wallet: 0,
      chestReady: 0,
      chestCharge: 0,
    };

    this.createHud();
    this.createOverlay();
  }

  createHud() {
    const { scene } = this;

    this.topLeftCard = scene.add.image(96, 56, "ui-card-bear").setDisplaySize(166, 88).setDepth(120);
    this.topRightCard = scene.add
      .image(scene.width - 90, 56, "ui-card-bear")
      .setDisplaySize(156, 88)
      .setDepth(120);

    this.centerChip = scene.add
      .image(scene.centerX, 38, "ui-chip-bear")
      .setDisplaySize(172, 42)
      .setDepth(120);

    this.scoreLabel = this.makeText(28, 18, "HONEY", 14, "#ffd4e6", 120);
    this.scoreText = this.makeText(28, 38, "0", 28, "#fff8fb", 120, "700");
    this.comboText = this.makeText(28, 66, "Snuggle x1", 15, "#ffd98a", 120);

    this.bestText = this.makeText(scene.width - 154, 22, "BEST HUG 0", 14, "#ffd4e6", 120);
    this.walletText = this.makeText(scene.width - 154, 44, "Treats 0", 18, "#9ef6ff", 120, "700");
    this.speedText = this.makeText(scene.width - 154, 66, "Zoom 340", 14, "#ffc2de", 120);

    this.weatherText = this.makeText(scene.centerX - 56, 26, "Neon Night", 15, "#fff8fb", 120, "700");
    this.weatherText.setOrigin(0.5, 0.5);

    this.pauseButton = this.makeButton({
      x: scene.width - 42,
      y: 116,
      width: 60,
      height: 42,
      label: "II",
      fontSize: 22,
      onClick: () => scene.togglePause(),
      depth: 122,
      textureKey: "ui-button-cyan",
    });

    this.chestShell = scene.add
      .image(222, 118, "ui-progress-bear")
      .setDisplaySize(210, 24)
      .setDepth(120);

    this.chestBack = scene.add
      .rectangle(120, 118, 204, 14, 0x2e2136, 0.96)
      .setDepth(120)
      .setOrigin(0, 0.5);

    this.chestFill = scene.add
      .rectangle(122, 118, 0, 10, 0xffd56e, 0.88)
      .setDepth(121)
      .setOrigin(0, 0.5);

    this.chestLabel = this.makeText(120, 100, "Toy Chest", 13, "#ffd98a", 120);

    this.toast = this.makeText(scene.centerX, 156, "", 16, "#fffdfd", 130, "700");
    this.toast
      .setOrigin(0.5, 0.5)
      .setAlpha(0)
      .setPadding(14, 6, 14, 6)
      .setBackgroundColor("rgba(77, 52, 85, 0.58)")
      .setStroke("#ffe2ee", 2);
  }

  createOverlay() {
    const { scene } = this;

    this.overlayShade = scene.add
      .rectangle(scene.centerX, scene.centerY, scene.width, scene.height, 0x05070f, 0.76)
      .setDepth(180)
      .setVisible(false);

    this.overlayGlow = scene.add
      .ellipse(scene.centerX, scene.centerY + 10, 386, 496, 0xffc3de, 0.07)
      .setDepth(181)
      .setVisible(false);

    this.overlayPanel = scene.add
      .image(scene.centerX, scene.centerY + 10, "ui-overlay-bear")
      .setDisplaySize(360, 470)
      .setDepth(182)
      .setVisible(false);

    this.overlayTitle = this.makeText(scene.centerX, scene.centerY - 178, "", 34, "#f5f7ff", 183, "700");
    this.overlayTitle.setOrigin(0.5).setVisible(false);

    this.overlaySubtitle = this.makeText(scene.centerX, scene.centerY - 136, "", 16, "#86f4ff", 183);
    this.overlaySubtitle.setOrigin(0.5).setVisible(false);

    this.overlayStats = this.makeText(scene.centerX, scene.centerY - 96, "", 17, "#d9e6ff", 183, "600");
    this.overlayStats.setOrigin(0.5, 0).setVisible(false).setAlign("center");

    this.overlayLeaderboardTitle = this.makeText(
      scene.centerX,
      scene.centerY - 12,
      "Local Leaderboard",
      16,
      "#ffd56e",
      183,
      "700"
    );
    this.overlayLeaderboardTitle.setOrigin(0.5).setVisible(false);

    this.overlayLeaderboard = this.makeText(scene.centerX, scene.centerY + 20, "", 15, "#f1f4ff", 183);
    this.overlayLeaderboard.setOrigin(0.5, 0).setVisible(false).setAlign("center");

    this.overlayFootnote = this.makeText(scene.centerX, scene.centerY + 126, "", 14, "#9fb5d6", 183);
    this.overlayFootnote.setOrigin(0.5, 0).setVisible(false).setAlign("center");

    this.buttons.primary = this.makeButton({
      x: scene.centerX,
      y: scene.centerY + 188,
      width: 232,
      height: 54,
      label: "Play Run",
      onClick: () => scene.beginRun(),
      depth: 184,
      textureKey: "ui-button-cyan",
    });

    this.buttons.secondary = this.makeButton({
      x: scene.centerX,
      y: scene.centerY + 248,
      width: 232,
      height: 50,
      label: "Main Menu",
      onClick: () => scene.returnToMenu(),
      depth: 184,
      textureKey: "ui-button-pink",
    });

    this.buttons.reward = this.makeButton({
      x: scene.centerX,
      y: scene.centerY + 128,
      width: 232,
      height: 48,
      label: "Rewarded Boost",
      onClick: () => scene.useRewardedBoost(),
      depth: 184,
      textureKey: "ui-button-mint",
      fontSize: 18,
    });

    this.buttons.chest = this.makeButton({
      x: scene.centerX,
      y: scene.centerY + 74,
      width: 232,
      height: 48,
      label: "Claim Chest",
      onClick: () => scene.claimChestReward(),
      depth: 184,
      textureKey: "ui-button-gold",
      fontSize: 18,
    });

    this.buttons.revive = this.makeButton({
      x: scene.centerX,
      y: scene.centerY + 128,
      width: 232,
      height: 48,
      label: "Second Chance",
      onClick: () => scene.useRevive(),
      depth: 184,
      textureKey: "ui-button-mint",
      fontSize: 18,
    });

    this.hideOverlay();
  }

  makeText(x, y, text, size, color, depth, weight = "600") {
    return this.scene.add
      .text(x, y, text, {
        fontFamily: '"Chakra Petch", sans-serif',
        fontSize: `${size}px`,
      fontStyle: weight,
        color,
      })
      .setDepth(depth);
  }

  makeButton({
    x,
    y,
    width,
    height,
    label,
    onClick,
    depth,
    textureKey,
    fontSize = 20,
  }) {
    const background = this.scene.add
      .image(x, y, textureKey)
      .setDisplaySize(width, height)
      .setDepth(depth)
      .setInteractive({ useHandCursor: true });

    const text = this.makeText(x, y, label, fontSize, "#fff9fc", depth + 1, "700")
      .setOrigin(0.5)
      .setStroke("#7d5067", 2);

    background.on("pointerover", () => {
      background.setScale(1.02);
      text.setScale(1.02);
    });

    background.on("pointerout", () => {
      background.setScale(1);
      text.setScale(1);
    });

    background.on("pointerdown", onClick);

    return {
      background,
      text,
      setAction(handler) {
        background.removeAllListeners("pointerdown");
        background.on("pointerdown", handler);
      },
      setVisible(visible) {
        background.setVisible(visible);
        text.setVisible(visible);
        if (!visible) {
          background.disableInteractive();
        } else {
          background.setInteractive({ useHandCursor: true });
        }
      },
      setLabel(value) {
        text.setText(value);
      },
    };
  }

  updateHud(data) {
    this.scoreText.setText(data.score.toString());
    this.comboText.setText(`Snuggle x${data.comboMultiplier}`);
    this.bestText.setText(`BEST ${data.bestScore}`);
    this.walletText.setText(`Treats ${data.wallet}`);
    this.speedText.setText(`Zoom ${data.speed}`);
    this.weatherText.setText(data.weather);

    const fillWidth = Phaser.Math.Clamp(data.chestCharge, 0, 1) * 196;
    this.chestFill.width = fillWidth;
    this.chestFill.setFillStyle(data.chestReady > 0 ? 0xaef7c9 : 0xffd56e, 0.86);
    this.chestLabel.setText(data.chestReady > 0 ? `Toy Chest x${data.chestReady}` : "Toy Chest");
    this.pauseButton.setVisible(data.screen === "running" || data.screen === "pause");
  }

  refreshPersistentPanels(data = this.latestPersistent) {
    this.latestPersistent = { ...this.latestPersistent, ...data };
  }

  setWeather(label) {
    this.weatherText?.setText(label);
  }

  showToast(message, color = "#ffffff", duration = 1400) {
    this.toast.setText(message);
    this.toast.setColor(color);
    this.toast.setAlpha(1);
    this.scene.tweens.killTweensOf(this.toast);
    this.scene.tweens.add({
      targets: this.toast,
      y: 144,
      alpha: 0,
      duration,
      ease: "Sine.Out",
      onStart: () => {
        this.toast.y = 164;
      },
    });
  }

  notifyChestReady(count) {
    this.showToast(`Reward chest ready x${count}`, "#ffd56e", 1700);
    this.scene.tweens.add({
      targets: [this.chestBack, this.chestFill],
      scaleX: 1.04,
      scaleY: 1.08,
      duration: 180,
      yoyo: true,
    });
  }

  showMenu({ bestScore, wallet, leaderboard, sdkLabel, chestReady, dailyReward }) {
    this.currentOverlay = "menu";
    this.showOverlay();

    this.overlayTitle.setText("TEDDY NEON RUNNER");
    this.overlaySubtitle.setText("Baby bear mode with soft neon paws.");
    this.overlayStats.setText(
      `Best score ${bestScore}\nTreat jar ${wallet}\nPortal mode ${sdkLabel}`
    );
    this.overlayLeaderboardTitle.setVisible(true);
    this.overlayLeaderboard.setText(this.formatLeaderboard(leaderboard));
    this.overlayFootnote.setText(
      dailyReward
        ? `Daily cuddle reward: +${dailyReward} treats`
        : "Left and right switch lanes. Up jumps. Down slides. Tap also hops."
    );

    this.buttons.primary.setLabel("Start Bear Dash");
    this.buttons.primary.setAction(() => this.scene.beginRun());
    this.buttons.primary.setVisible(true);
    this.buttons.secondary.setAction(() => this.scene.returnToMenu());
    this.buttons.secondary.setVisible(false);
    this.buttons.reward.setLabel("Treat Boost");
    this.buttons.reward.setVisible(true);
    this.buttons.revive.setVisible(false);
    this.buttons.chest.setVisible(chestReady > 0);
  }

  showPause({ score, bestScore, weather }) {
    this.currentOverlay = "pause";
    this.showOverlay();

    this.overlayTitle.setText("Paused");
    this.overlaySubtitle.setText(`${weather} cuddle break`);
    this.overlayStats.setText(`Current score ${score}\nBest score ${bestScore}`);
    this.overlayLeaderboardTitle.setVisible(false);
    this.overlayLeaderboard.setVisible(false);
    this.overlayFootnote.setText("Tiny bear is catching breath. Resume when ready.");

    this.buttons.primary.setLabel("Back To Zoom");
    this.buttons.primary.setAction(() => this.scene.resumeGame());
    this.buttons.primary.setVisible(true);

    this.buttons.secondary.setLabel("Back To Den");
    this.buttons.secondary.setAction(() => this.scene.returnToMenu());
    this.buttons.secondary.setVisible(true);

    this.buttons.reward.setVisible(false);
    this.buttons.revive.setVisible(false);
    this.buttons.chest.setVisible(false);
  }

  showGameOver({ score, bestScore, leaderboard, canRevive, wallet, chestReady, stats, newBest }) {
    this.currentOverlay = "gameover";
    this.showOverlay();

    this.overlayTitle.setText(newBest ? "New Best Hug!" : "Bear Bump!");
    this.overlaySubtitle.setText(
      `Near misses ${stats.nearMisses}  •  Best snuggle x${stats.bestCombo}`
    );
    this.overlayStats.setText(
      `Final score ${score}\nBest score ${bestScore}\nTreat jar ${wallet}\nCollected ${stats.collected}`
    );
    this.overlayLeaderboardTitle.setVisible(true);
    this.overlayLeaderboard.setVisible(true).setText(this.formatLeaderboard(leaderboard));
    this.overlayFootnote.setText(
      canRevive
        ? "One sweet second chance is ready for this run."
        : "Second chance already used on this run."
    );

    this.buttons.primary.setLabel("Dash Again");
    this.buttons.primary.setAction(() => this.scene.beginRun());
    this.buttons.primary.setVisible(true);

    this.buttons.secondary.setLabel("Back To Den");
    this.buttons.secondary.setAction(() => this.scene.returnToMenu());
    this.buttons.secondary.setVisible(true);

    this.buttons.reward.setVisible(false);
    this.buttons.revive.setVisible(canRevive);
    this.buttons.chest.setVisible(chestReady > 0);
  }

  showOverlay() {
    [
      this.overlayShade,
      this.overlayGlow,
      this.overlayPanel,
      this.overlayTitle,
      this.overlaySubtitle,
      this.overlayStats,
      this.overlayLeaderboardTitle,
      this.overlayLeaderboard,
      this.overlayFootnote,
    ].forEach((object) => object.setVisible(true));
  }

  hideOverlay() {
    [
      this.overlayShade,
      this.overlayGlow,
      this.overlayPanel,
      this.overlayTitle,
      this.overlaySubtitle,
      this.overlayStats,
      this.overlayLeaderboardTitle,
      this.overlayLeaderboard,
      this.overlayFootnote,
    ].forEach((object) => object.setVisible(false));

    Object.values(this.buttons).forEach((button) => button.setVisible(false));
    this.currentOverlay = null;
  }

  formatLeaderboard(leaderboard) {
    if (!leaderboard || leaderboard.length === 0) {
      return "1. Start a run to set the first local record";
    }

    return leaderboard
      .map((entry, index) => `${index + 1}. ${entry.score}  •  ${entry.stamp}`)
      .join("\n");
  }
}
