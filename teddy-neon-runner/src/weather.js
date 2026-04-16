const WEATHER_TYPES = {
  sunny: {
    key: "sunny",
    label: "Sunny Day",
    backgroundKey: "sky-sunny",
    accent: 0xffcf69,
    particleMode: "sunny",
  },
  night: {
    key: "night",
    label: "Neon Night",
    backgroundKey: "sky-night",
    accent: 0x76ebff,
    particleMode: "night",
  },
  snow: {
    key: "snow",
    label: "Snow Drift",
    backgroundKey: "sky-snow",
    accent: 0xdaf6ff,
    particleMode: "snow",
  },
  rain: {
    key: "rain",
    label: "Rain Pulse",
    backgroundKey: "sky-rain",
    accent: 0x7bcfff,
    particleMode: "rain",
  },
  cyberstorm: {
    key: "cyberstorm",
    label: "Cyber Storm",
    backgroundKey: "sky-cyberstorm",
    accent: 0xff7fb0,
    particleMode: "cyberstorm",
  },
  candy: {
    key: "candy",
    label: "Candy World",
    backgroundKey: "sky-candy",
    accent: 0xffa0cd,
    particleMode: "candy",
  },
};

export class Weather {
  constructor(scene, durationMs) {
    this.scene = scene;
    this.durationMs = durationMs;
    this.keys = Object.keys(WEATHER_TYPES);
    this.currentKey = Phaser.Utils.Array.GetRandom(this.keys);
    this.current = WEATHER_TYPES[this.currentKey];
    this.particles = [];
    this.transitionQueued = false;

    this.backgroundA = scene.add
      .image(scene.centerX, scene.centerY, this.current.backgroundKey)
      .setDisplaySize(scene.width, scene.height)
      .setDepth(-40);

    this.backgroundB = scene.add
      .image(scene.centerX, scene.centerY, this.current.backgroundKey)
      .setDisplaySize(scene.width, scene.height)
      .setDepth(-39)
      .setAlpha(0);

    this.glow = scene.add
      .circle(scene.width * 0.78, scene.height * 0.2, 138, this.current.accent, 0.08)
      .setDepth(-20);

    this.layer = scene.add.container(0, 0).setDepth(-18);
    this.flash = scene.add
      .rectangle(scene.centerX, scene.centerY, scene.width, scene.height, 0xffffff, 0)
      .setDepth(70);
  }

  start() {
    this.applyWeather(this.currentKey, true);
    this.timer = this.scene.time.addEvent({
      delay: this.durationMs,
      loop: true,
      callback: () => this.advance(),
    });
  }

  advance() {
    const nextOptions = this.keys.filter((key) => key !== this.currentKey);
    this.applyWeather(Phaser.Utils.Array.GetRandom(nextOptions));
  }

  applyWeather(key, immediate = false) {
    if (this.currentKey === key && !immediate) {
      return;
    }

    this.currentKey = key;
    this.current = WEATHER_TYPES[key];

    this.backgroundB.setTexture(this.current.backgroundKey).setAlpha(0);
    this.scene.tweens.add({
      targets: this.backgroundB,
      alpha: 1,
      duration: immediate ? 0 : 1200,
      ease: "Sine.Out",
      onComplete: () => {
        this.backgroundA.setTexture(this.current.backgroundKey).setAlpha(1);
        this.backgroundB.setAlpha(0);
      },
    });

    this.scene.tweens.add({
      targets: this.glow,
      alpha: 0.12,
      duration: immediate ? 0 : 900,
      onUpdate: () => {
        this.glow.fillColor = this.current.accent;
      },
    });

    this.rebuildParticles();
    this.scene.collectibles?.setWeather(key);
    this.scene.ui?.setWeather(this.current.label);
    this.scene.audioManager?.setWeatherMood(key);

    if (!immediate) {
      this.scene.audioManager?.playWeatherSwap();
      this.scene.effects?.backgroundPulse(this.current.accent);
      this.scene.ui?.showToast(`${this.current.label} rolled in`, "#dff9ff", 1600);
    }
  }

  rebuildParticles() {
    this.layer.removeAll(true);
    this.particles.length = 0;

    switch (this.current.particleMode) {
      case "sunny":
        this.buildSunnyParticles();
        break;
      case "snow":
        this.buildSnowParticles();
        break;
      case "rain":
        this.buildRainParticles();
        break;
      case "cyberstorm":
        this.buildCyberstormParticles();
        break;
      case "candy":
        this.buildCandyParticles();
        break;
      default:
        this.buildNightParticles();
        break;
    }
  }

  update(time, delta) {
    const dt = delta / 1000;

    this.particles.forEach((particle) => {
      particle.sprite.x += particle.vx * dt;
      particle.sprite.y += particle.vy * dt;
      particle.sprite.rotation += particle.spin * dt;

      if (particle.twinkle) {
        particle.sprite.alpha =
          particle.baseAlpha + Math.sin(time * particle.twinkle + particle.phase) * particle.twinkleRange;
      }

      if (particle.respawn) {
        particle.respawn(particle.sprite);
      }
    });

    if (this.current.key === "cyberstorm" && Math.random() > 0.992) {
      this.flash.setFillStyle(0xffffff, 0.18);
      this.scene.tweens.add({
        targets: this.flash,
        alpha: 0,
        duration: 180,
      });
    }
  }

  getCurrentDefinition() {
    return this.current;
  }

  buildSunnyParticles() {
    for (let i = 0; i < 18; i += 1) {
      const circle = this.scene.add
        .circle(
          Phaser.Math.Between(0, this.scene.width),
          Phaser.Math.Between(50, this.scene.height - 200),
          Phaser.Math.Between(4, 11),
          Phaser.Math.Between(0xffd56e, 0xffefb2),
          0.18
        );

      this.layer.add(circle);
      this.particles.push({
        sprite: circle,
        vx: Phaser.Math.FloatBetween(-6, 8),
        vy: Phaser.Math.FloatBetween(8, 16),
        spin: Phaser.Math.FloatBetween(-0.2, 0.2),
        baseAlpha: Phaser.Math.FloatBetween(0.08, 0.18),
        twinkle: 0.004,
        twinkleRange: 0.06,
        phase: Phaser.Math.FloatBetween(0, Math.PI * 2),
        respawn: (sprite) => {
          if (sprite.y > this.scene.height + 24) {
            sprite.y = -24;
            sprite.x = Phaser.Math.Between(0, this.scene.width);
          }
        },
      });
    }
  }

  buildNightParticles() {
    for (let i = 0; i < 30; i += 1) {
      const star = this.scene.add
        .star(
          Phaser.Math.Between(0, this.scene.width),
          Phaser.Math.Between(20, this.scene.height - 260),
          4,
          Phaser.Math.Between(2, 3),
          Phaser.Math.Between(4, 7),
          0xfff1aa,
          0.45
        )
        .setDepth(-18);

      this.layer.add(star);
      this.particles.push({
        sprite: star,
        vx: -2,
        vy: 0,
        spin: Phaser.Math.FloatBetween(-0.12, 0.12),
        baseAlpha: Phaser.Math.FloatBetween(0.22, 0.6),
        twinkle: 0.006,
        twinkleRange: 0.18,
        phase: Phaser.Math.FloatBetween(0, Math.PI * 2),
        respawn: (sprite) => {
          if (sprite.x < -18) {
            sprite.x = this.scene.width + 18;
            sprite.y = Phaser.Math.Between(20, this.scene.height - 260);
          }
        },
      });
    }
  }

  buildSnowParticles() {
    for (let i = 0; i < 40; i += 1) {
      const snow = this.scene.add
        .circle(
          Phaser.Math.Between(0, this.scene.width),
          Phaser.Math.Between(-40, this.scene.height),
          Phaser.Math.Between(2, 5),
          0xf3fbff,
          0.8
        )
        .setDepth(-18);

      this.layer.add(snow);
      this.particles.push({
        sprite: snow,
        vx: Phaser.Math.FloatBetween(-10, 12),
        vy: Phaser.Math.FloatBetween(30, 70),
        spin: Phaser.Math.FloatBetween(-0.4, 0.4),
        baseAlpha: 0.6,
        twinkle: 0,
        twinkleRange: 0,
        phase: 0,
        respawn: (sprite) => {
          if (sprite.y > this.scene.height + 16) {
            sprite.y = -20;
            sprite.x = Phaser.Math.Between(0, this.scene.width);
          }
        },
      });
    }
  }

  buildRainParticles() {
    for (let i = 0; i < 42; i += 1) {
      const drop = this.scene.add
        .rectangle(
          Phaser.Math.Between(0, this.scene.width),
          Phaser.Math.Between(-80, this.scene.height),
          2,
          Phaser.Math.Between(16, 26),
          0x8ad9ff,
          0.55
        )
        .setAngle(18)
        .setDepth(-18);

      this.layer.add(drop);
      this.particles.push({
        sprite: drop,
        vx: -60,
        vy: Phaser.Math.FloatBetween(320, 430),
        spin: 0,
        baseAlpha: 0.55,
        twinkle: 0,
        twinkleRange: 0,
        phase: 0,
        respawn: (sprite) => {
          if (sprite.y > this.scene.height + 28 || sprite.x < -28) {
            sprite.y = Phaser.Math.Between(-100, -20);
            sprite.x = Phaser.Math.Between(0, this.scene.width + 60);
          }
        },
      });
    }
  }

  buildCyberstormParticles() {
    for (let i = 0; i < 32; i += 1) {
      const column = this.scene.add
        .rectangle(
          Phaser.Math.Between(0, this.scene.width),
          Phaser.Math.Between(-100, this.scene.height),
          Phaser.Math.Between(2, 3),
          Phaser.Math.Between(20, 54),
          i % 2 === 0 ? 0x76ebff : 0xff8cb5,
          0.28
        )
        .setDepth(-18);

      this.layer.add(column);
      this.particles.push({
        sprite: column,
        vx: Phaser.Math.FloatBetween(-12, 12),
        vy: Phaser.Math.FloatBetween(140, 260),
        spin: 0,
        baseAlpha: 0.22,
        twinkle: 0.008,
        twinkleRange: 0.18,
        phase: Phaser.Math.FloatBetween(0, Math.PI * 2),
        respawn: (sprite) => {
          if (sprite.y > this.scene.height + 60) {
            sprite.y = Phaser.Math.Between(-120, -40);
            sprite.x = Phaser.Math.Between(0, this.scene.width);
          }
        },
      });
    }
  }

  buildCandyParticles() {
    const colors = [0xff8cb5, 0xffd56e, 0x76ebff, 0xaef7c9];

    for (let i = 0; i < 24; i += 1) {
      const radius = Phaser.Math.Between(4, 8);
      const candy = this.scene.add
        .circle(
          Phaser.Math.Between(0, this.scene.width),
          Phaser.Math.Between(-60, this.scene.height - 120),
          radius,
          Phaser.Utils.Array.GetRandom(colors),
          0.34
        )
        .setDepth(-18);

      this.layer.add(candy);
      this.particles.push({
        sprite: candy,
        vx: Phaser.Math.FloatBetween(-18, 18),
        vy: Phaser.Math.FloatBetween(24, 58),
        spin: Phaser.Math.FloatBetween(-0.4, 0.4),
        baseAlpha: 0.3,
        twinkle: 0.005,
        twinkleRange: 0.08,
        phase: Phaser.Math.FloatBetween(0, Math.PI * 2),
        respawn: (sprite) => {
          if (sprite.y > this.scene.height + 20) {
            sprite.y = -20;
            sprite.x = Phaser.Math.Between(0, this.scene.width);
          }
        },
      });
    }
  }
}
