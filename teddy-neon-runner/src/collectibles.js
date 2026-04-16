const COLLECTIBLE_DEFS = {
  chocolate: {
    texture: "collect-chocolate",
    value: 20,
    bankValue: 12,
    chestCharge: 1.1,
    color: 0xffd56e,
    textColor: "#ffd56e",
    audioKey: "sweet",
    comboGain: 1,
  },
  flower: {
    texture: "collect-flower",
    value: 26,
    bankValue: 14,
    chestCharge: 1.2,
    color: 0xff8cb5,
    textColor: "#ff9cc4",
    audioKey: "petal",
    comboGain: 1,
  },
  candy: {
    texture: "collect-candy",
    value: 64,
    bankValue: 28,
    chestCharge: 1.8,
    color: 0x76ebff,
    textColor: "#86f4ff",
    audioKey: "rare",
    comboGain: 2,
    rare: true,
  },
  honey: {
    texture: "collect-honey",
    value: 30,
    bankValue: 18,
    chestCharge: 1.3,
    color: 0xffc75f,
    textColor: "#ffd56e",
    audioKey: "sweet",
    comboGain: 1,
  },
  star: {
    texture: "collect-star",
    value: 32,
    bankValue: 18,
    chestCharge: 1.3,
    color: 0x8ac9ff,
    textColor: "#b5e7ff",
    audioKey: "bright",
    comboGain: 1,
  },
  snowman: {
    texture: "collect-snowman",
    value: 36,
    bankValue: 20,
    chestCharge: 1.5,
    color: 0xd7f6ff,
    textColor: "#dff8ff",
    audioKey: "bright",
    comboGain: 1,
  },
  droplet: {
    texture: "collect-droplet",
    value: 28,
    bankValue: 16,
    chestCharge: 1.2,
    color: 0x76ebff,
    textColor: "#86f4ff",
    audioKey: "bright",
    comboGain: 1,
  },
  microchip: {
    texture: "collect-microchip",
    value: 42,
    bankValue: 22,
    chestCharge: 1.6,
    color: 0x76ebff,
    textColor: "#8ff5ff",
    audioKey: "rare",
    comboGain: 2,
    rare: true,
  },
  cupcake: {
    texture: "collect-cupcake",
    value: 38,
    bankValue: 20,
    chestCharge: 1.5,
    color: 0xff8cb5,
    textColor: "#ffc1da",
    audioKey: "sweet",
    comboGain: 1,
  },
};

const WEATHER_POOLS = {
  sunny: ["honey", "flower", "chocolate", "chocolate", "candy"],
  night: ["star", "chocolate", "flower", "candy"],
  snow: ["snowman", "chocolate", "flower", "candy"],
  rain: ["droplet", "chocolate", "flower", "candy"],
  cyberstorm: ["microchip", "star", "chocolate", "candy"],
  candy: ["cupcake", "flower", "candy", "chocolate"],
};

export class Collectibles {
  constructor(scene) {
    this.scene = scene;
    this.items = [];
    this.weatherKey = "night";
    this.spawnTimer = 760;
  }

  reset() {
    this.items.forEach((item) => item.sprite.destroy());
    this.items.length = 0;
    this.spawnTimer = 760;
  }

  setWeather(key) {
    this.weatherKey = key;
  }

  update(time, dt, speed, playerBounds) {
    this.spawnTimer -= dt * 1000;

    if (this.spawnTimer <= 0) {
      this.spawnPattern(speed);
    }

    for (let index = this.items.length - 1; index >= 0; index -= 1) {
      const item = this.items[index];
      item.life += dt;
      item.z += dt * (speed / 380) * item.zSpeed;

      const point = this.scene.getLanePoint(item.lane, item.z);
      const bob = Math.sin(item.life * item.floatSpeed + item.floatOffset) * item.floatAmount;
      const scale = point.scale * item.visualScale;

      item.sprite.x = point.x;
      item.sprite.y = point.y - item.heightLift * scale - 18 * scale + bob;
      item.sprite.rotation += item.spin * dt;
      item.sprite.setScale(scale);
      item.sprite.setDepth(18 + Math.round(item.z * 20));

      const itemBounds = new Phaser.Geom.Rectangle(
        item.sprite.x - 18 * scale,
        item.sprite.y - 18 * scale,
        36 * scale,
        36 * scale
      );

      if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, itemBounds)) {
        this.scene.handleCollect(item);
        item.sprite.destroy();
        this.items.splice(index, 1);
        continue;
      }

      if (item.z > 1.16) {
        item.sprite.destroy();
        this.items.splice(index, 1);
      }
    }
  }

  spawnPattern(speed) {
    const basePool = WEATHER_POOLS[this.weatherKey] || WEATHER_POOLS.night;
    const difficulty = Phaser.Math.Clamp((speed - 340) / 260, 0, 1);
    const lane = Phaser.Math.Between(0, 2);
    const pattern = Phaser.Utils.Array.GetRandom(["line", "jump-arc", "zigzag", "burst"]);

    switch (pattern) {
      case "jump-arc":
        this.spawnOne(basePool[0], lane, 0.18, 12);
        this.spawnOne("chocolate", lane, 0.32, 68);
        this.spawnOne(basePool[1] || "flower", lane, 0.48, 124);
        this.spawnOne("chocolate", lane, 0.64, 76);
        break;

      case "zigzag":
        this.spawnOne("chocolate", lane, 0.2, 12);
        this.spawnOne(basePool[Phaser.Math.Between(0, basePool.length - 1)], (lane + 1) % 3, 0.36, 18);
        this.spawnOne("chocolate", (lane + 2) % 3, 0.52, 12);
        this.spawnOne(Math.random() > 0.6 ? "candy" : basePool[0], lane, 0.7, 26);
        break;

      case "burst":
        this.spawnOne(basePool[0], 0, 0.28, 20);
        this.spawnOne("flower", 1, 0.38, 30);
        this.spawnOne(Math.random() > 0.55 ? "candy" : "chocolate", 2, 0.5, 20);
        break;

      default:
        for (let index = 0; index < 5; index += 1) {
          const z = 0.16 + index * 0.14;
          const lift = index % 2 === 1 ? Phaser.Math.Between(10, 26) : 8;
          const typeKey =
            index === 4 && Math.random() > 0.76
              ? "candy"
              : basePool[Phaser.Math.Between(0, basePool.length - 1)];
          this.spawnOne(typeKey, lane, z, lift);
        }
        break;
    }

    const minDelay = Phaser.Math.Linear(980, 720, difficulty);
    const maxDelay = Phaser.Math.Linear(1480, 1060, difficulty);
    this.spawnTimer = Phaser.Math.Between(minDelay, maxDelay);
  }

  spawnOne(typeKey, lane, z, heightLift = 10) {
    const definition = COLLECTIBLE_DEFS[typeKey];

    if (!definition) {
      return;
    }

    const sprite = this.scene.add
      .image(this.scene.centerX, this.scene.trackFarY, definition.texture)
      .setDepth(18);

    this.items.push({
      sprite,
      definition,
      lane,
      z,
      heightLift,
      life: 0,
      visualScale: Phaser.Math.FloatBetween(0.82, 0.98),
      floatAmount: Phaser.Math.Between(2, 7),
      floatSpeed: Phaser.Math.FloatBetween(2.3, 4.6),
      floatOffset: Phaser.Math.FloatBetween(0, Math.PI * 2),
      spin: Phaser.Math.FloatBetween(-0.8, 0.8),
      zSpeed: Phaser.Math.FloatBetween(0.94, 1.05),
    });
  }

  nudgeForward(zLimit = 0.5) {
    this.items.forEach((item) => {
      if (item.z > zLimit) {
        item.z = Phaser.Math.FloatBetween(0.18, 0.42);
      }
    });
  }
}
