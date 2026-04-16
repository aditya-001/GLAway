export class Effects {
  constructor(scene) {
    this.scene = scene;
    this.transient = [];
    this.flashLayer = scene.add.container(0, 0).setDepth(90);
  }

  clearTransient() {
    this.transient.forEach((item) => item.destroy());
    this.transient.length = 0;
  }

  spawnJumpDust(x, y) {
    this.burst({
      x,
      y,
      count: 8,
      colors: [0x76ebff, 0xffd56e],
      radiusRange: [3, 7],
      speedRange: [20, 120],
      angleRange: [190, 340],
      lifespan: 360,
    });
  }

  spawnLandingSpark(x, y) {
    this.burst({
      x,
      y,
      count: 6,
      colors: [0x76ebff, 0xaef7c9],
      radiusRange: [2, 5],
      speedRange: [16, 84],
      angleRange: [200, 340],
      lifespan: 260,
    });
  }

  spawnCollectBurst(x, y, color) {
    this.burst({
      x,
      y,
      count: 10,
      colors: [color, 0xffffff],
      radiusRange: [2, 6],
      speedRange: [30, 140],
      angleRange: [0, 360],
      lifespan: 420,
    });
  }

  spawnDeathExplosion(x, y, color) {
    this.burst({
      x,
      y,
      count: 20,
      colors: [color, 0xfff1b0, 0xffffff],
      radiusRange: [3, 9],
      speedRange: [40, 190],
      angleRange: [0, 360],
      lifespan: 620,
    });

    const shockwave = this.scene.add
      .circle(x, y, 12, color, 0)
      .setStrokeStyle(4, color, 0.7)
      .setDepth(91);

    this.transient.push(shockwave);
    this.scene.tweens.add({
      targets: shockwave,
      radius: 88,
      alpha: 0,
      duration: 360,
      ease: "Quad.Out",
      onComplete: () => shockwave.destroy(),
    });
  }

  spawnReviveBurst(x, y) {
    this.burst({
      x,
      y,
      count: 18,
      colors: [0x76ebff, 0xaef7c9, 0xffd56e],
      radiusRange: [3, 8],
      speedRange: [50, 170],
      angleRange: [0, 360],
      lifespan: 520,
    });

    const ring = this.scene.add
      .circle(x, y, 18, 0xaef7c9, 0)
      .setStrokeStyle(5, 0xaef7c9, 0.8)
      .setDepth(91);

    this.transient.push(ring);
    this.scene.tweens.add({
      targets: ring,
      radius: 90,
      alpha: 0,
      duration: 420,
      ease: "Quad.Out",
      onComplete: () => ring.destroy(),
    });
  }

  flashNearMiss(x, y, color) {
    const ring = this.scene.add
      .circle(x, y, 14, color, 0)
      .setStrokeStyle(4, color, 0.9)
      .setDepth(91);

    this.transient.push(ring);
    this.scene.tweens.add({
      targets: ring,
      radius: 66,
      alpha: 0,
      duration: 260,
      ease: "Quad.Out",
      onComplete: () => ring.destroy(),
    });

    this.scene.cameras.main.shake(100, 0.004);
  }

  pulseCombo(multiplier) {
    const label = this.scene.add
      .text(this.scene.centerX, 190, `Combo x${multiplier}!`, {
        fontFamily: '"Chakra Petch", sans-serif',
        fontSize: "28px",
        fontStyle: "700",
        color: "#ffd56e",
      })
      .setOrigin(0.5)
      .setDepth(91);

    this.transient.push(label);
    this.scene.tweens.add({
      targets: label,
      y: 158,
      alpha: 0,
      scale: 1.2,
      duration: 460,
      ease: "Back.Out",
      onComplete: () => label.destroy(),
    });
  }

  backgroundPulse(color) {
    const flash = this.scene.add
      .rectangle(this.scene.centerX, this.scene.centerY, this.scene.width, this.scene.height, color, 0.14)
      .setDepth(69);

    this.transient.push(flash);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 320,
      onComplete: () => flash.destroy(),
    });
  }

  floatLabel(text, x, y, color = "#ffffff", size = 18) {
    const label = this.scene.add
      .text(x, y, text, {
        fontFamily: '"Chakra Petch", sans-serif',
        fontSize: `${size}px`,
        fontStyle: "700",
        color,
      })
      .setOrigin(0.5)
      .setDepth(91);

    this.transient.push(label);
    this.scene.tweens.add({
      targets: label,
      y: y - 34,
      alpha: 0,
      duration: 620,
      ease: "Sine.Out",
      onComplete: () => label.destroy(),
    });
  }

  burst({ x, y, count, colors, radiusRange, speedRange, angleRange, lifespan }) {
    for (let i = 0; i < count; i += 1) {
      const radius = Phaser.Math.Between(radiusRange[0], radiusRange[1]);
      const circle = this.scene.add
        .circle(x, y, radius, Phaser.Utils.Array.GetRandom(colors), 0.95)
        .setDepth(90);

      const angle = Phaser.Math.DegToRad(Phaser.Math.Between(angleRange[0], angleRange[1]));
      const speed = Phaser.Math.Between(speedRange[0], speedRange[1]);
      const distanceX = Math.cos(angle) * speed;
      const distanceY = Math.sin(angle) * speed;

      this.transient.push(circle);
      this.scene.tweens.add({
        targets: circle,
        x: x + distanceX,
        y: y + distanceY,
        alpha: 0,
        scale: 0.2,
        duration: lifespan,
        ease: "Quad.Out",
        onComplete: () => circle.destroy(),
      });
    }
  }
}
