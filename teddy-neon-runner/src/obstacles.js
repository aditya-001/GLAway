const OBSTACLE_TYPES = {
  jump: {
    key: "crate",
    width: 58,
    height: 58,
    hitWidth: 42,
    hitHeight: 46,
    glowColor: 0xff8a73,
    weight: 0.38,
    minSpeed: 0,
    lift: 0,
    zSpeed: 0.92,
  },
  train: {
    key: "crate-double",
    width: 88,
    height: 138,
    hitWidth: 72,
    hitHeight: 124,
    glowColor: 0xffd56e,
    weight: 0.28,
    minSpeed: 0,
    lift: 0,
    zSpeed: 0.88,
  },
  slide: {
    key: "laser-gate",
    width: 132,
    height: 48,
    hitWidth: 104,
    hitHeight: 26,
    glowColor: 0xff6f9c,
    weight: 0.18,
    minSpeed: 390,
    lift: 76,
    zSpeed: 0.98,
  },
  mover: {
    key: "robo-crate",
    width: 68,
    height: 62,
    hitWidth: 48,
    hitHeight: 42,
    glowColor: 0x76ebff,
    weight: 0.16,
    minSpeed: 430,
    lift: 12,
    zSpeed: 1.02,
    sweepAmplitude: 0.52,
    sweepSpeed: 2.1,
  },
};

export class Obstacles {
  constructor(scene) {
    this.scene = scene;
    this.items = [];
    this.spawnTimer = 980;
  }

  reset() {
    this.items.forEach((item) => item.sprite.destroy());
    this.items.length = 0;
    this.spawnTimer = 1100;
  }

  update(time, dt, speed, playerBounds) {
    this.spawnTimer -= dt * 1000;

    if (this.spawnTimer <= 0) {
      this.spawn(speed);
    }

    for (let index = this.items.length - 1; index >= 0; index -= 1) {
      const item = this.items[index];
      item.life += dt;
      item.z += dt * (speed / 370) * item.config.zSpeed;

      const laneOffset = item.config.sweepAmplitude
        ? item.baseLaneOffset + Math.sin(item.life * item.config.sweepSpeed) * item.config.sweepAmplitude
        : this.scene.getLaneOffsetValue(item.lane);
      const point = this.scene.projectTrackPoint(laneOffset, item.z);
      const scale = point.scale * item.visualScale;

      item.sprite.x = point.x;
      item.sprite.y = point.y - item.config.lift * scale - item.config.height * scale * 0.5;
      item.sprite.setScale(scale);
      item.sprite.setDepth(20 + Math.round(item.z * 20));

      const obstacleBounds = this.getBounds(item, scale);

      if (
        !item.nearMissAwarded &&
        this.scene.player.isAirborne() &&
        item.z > 0.9 &&
        Math.abs(obstacleBounds.centerX - playerBounds.centerX) < 54
      ) {
        const clearance = obstacleBounds.top - playerBounds.bottom;
        if (clearance > -6 && clearance < 12) {
          item.nearMissAwarded = true;
          this.scene.handleNearMiss(item);
        }
      }

      if (
        this.scene.state.invincibleTimer <= 0 &&
        Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, obstacleBounds)
      ) {
        this.scene.handleCrash(item);
        return;
      }

      if (item.z > 1.18) {
        item.sprite.destroy();
        this.items.splice(index, 1);
      }
    }
  }

  spawn(speed) {
    const config = OBSTACLE_TYPES[this.pickType(speed)];
    const lane = Phaser.Math.Between(0, 2);
    const sprite = this.scene.add
      .image(this.scene.centerX, this.scene.trackFarY, config.key)
      .setDepth(18);

    this.items.push({
      sprite,
      config,
      lane,
      baseLaneOffset: this.scene.getLaneOffsetValue(lane),
      z: Phaser.Math.FloatBetween(0.02, 0.12),
      life: 0,
      nearMissAwarded: false,
      visualScale: Phaser.Math.FloatBetween(0.92, 1.06),
    });

    const difficulty = Phaser.Math.Clamp((speed - 340) / 260, 0, 1);
    const minDelay = Phaser.Math.Linear(980, 610, difficulty);
    const maxDelay = Phaser.Math.Linear(1480, 980, difficulty);
    this.spawnTimer = Phaser.Math.Between(minDelay, maxDelay);
  }

  pickType(speed) {
    const pool = [];

    Object.entries(OBSTACLE_TYPES).forEach(([key, config]) => {
      if (speed >= config.minSpeed) {
        pool.push({ key, weight: config.weight });
      }
    });

    const total = pool.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = Math.random() * total;

    for (const entry of pool) {
      roll -= entry.weight;
      if (roll <= 0) {
        return entry.key;
      }
    }

    return "jump";
  }

  clearUnsafeObstacles(zLimit = 0.78) {
    this.items = this.items.filter((item) => {
      const unsafe = item.z >= zLimit;

      if (unsafe) {
        item.sprite.destroy();
      }

      return !unsafe;
    });
  }

  getBounds(item, scale = item.sprite.scale) {
    return new Phaser.Geom.Rectangle(
      item.sprite.x - item.config.hitWidth * scale * 0.5,
      item.sprite.y - item.config.hitHeight * scale * 0.5,
      item.config.hitWidth * scale,
      item.config.hitHeight * scale
    );
  }
}
