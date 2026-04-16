export class Player {
  constructor(scene, x, y, { groundY, lineY }) {
    this.scene = scene;
    this.startX = x;
    this.groundY = groundY;
    this.lineY = lineY;

    this.shadow = scene.add
      .ellipse(x, lineY + 10, 76, 18, 0x76ebff, 0.18)
      .setDepth(18);

    this.sprite = scene.add
      .image(x, y, "teddy-run-a")
      .setDisplaySize(92, 92)
      .setDepth(30);

    this.gravity = 2500;
    this.jumpVelocity = -980;
    this.velocityY = 0;
    this.positionY = y;
    this.grounded = true;
    this.lastGroundedAt = 0;
    this.frameTimer = 0;
    this.runFrame = 0;
    this.slideTimer = 0;
    this.slideDuration = 460;
    this.laneIndex = 1;
    this.targetLaneIndex = 1;
    this.invincibleTween = null;
  }

  reset() {
    this.sprite.setTexture("teddy-run-a");
    this.sprite.setPosition(this.scene.getLaneX(1), this.groundY);
    this.sprite.setScale(1);
    this.sprite.setAngle(0);
    this.sprite.setAlpha(1);
    this.positionY = this.groundY;
    this.velocityY = 0;
    this.grounded = true;
    this.frameTimer = 0;
    this.runFrame = 0;
    this.slideTimer = 0;
    this.laneIndex = 1;
    this.targetLaneIndex = 1;
    this.updateShadow();
    this.setInvincible(false);
  }

  update(time, dt, speed, isRunning) {
    if (!isRunning) {
      this.updateIdle(time, false);
      return;
    }

    this.velocityY += this.gravity * dt;
    this.positionY += this.velocityY * dt;

    if (this.positionY >= this.groundY) {
      if (!this.grounded) {
        this.scene.effects.spawnLandingSpark(this.sprite.x - 4, this.lineY + 2);
      }

      this.positionY = this.groundY;
      this.velocityY = 0;
      this.grounded = true;
      this.lastGroundedAt = time;
    } else {
      this.grounded = false;
    }

    if (this.slideTimer > 0) {
      this.slideTimer = Math.max(0, this.slideTimer - dt * 1000);
    }

    const targetX = this.scene.getLaneX(this.targetLaneIndex);
    const laneLerp = 1 - Math.exp(-dt * 16);
    this.sprite.x = Phaser.Math.Linear(this.sprite.x, targetX, laneLerp);

    if (Math.abs(this.sprite.x - targetX) < 5) {
      this.laneIndex = this.targetLaneIndex;
      this.sprite.x = targetX;
    }

    const slideOffset = this.isSliding() ? 12 : 0;
    this.sprite.y = this.positionY + slideOffset;

    if (!this.grounded) {
      this.sprite.setTexture("teddy-jump");
      this.sprite.setScale(
        Phaser.Math.Linear(this.sprite.scaleX, 1.02, 0.2),
        Phaser.Math.Linear(this.sprite.scaleY, 1.02, 0.2)
      );
      this.sprite.setAngle(Phaser.Math.Clamp(this.velocityY * 0.024, -18, 18));
    } else if (this.isSliding()) {
      this.sprite.setTexture("teddy-run-b");
      this.sprite.setScale(
        Phaser.Math.Linear(this.sprite.scaleX, 1.08, 0.2),
        Phaser.Math.Linear(this.sprite.scaleY, 0.72, 0.2)
      );
      this.sprite.setAngle(Phaser.Math.Linear(this.sprite.angle, -8, 0.18));
    } else {
      this.frameTimer += dt * (2.8 + speed / 260);

      if (this.frameTimer >= 0.12) {
        this.frameTimer = 0;
        this.runFrame = (this.runFrame + 1) % 2;
      }

      this.sprite.setTexture(this.runFrame === 0 ? "teddy-run-a" : "teddy-run-b");
      this.sprite.setScale(
        Phaser.Math.Linear(this.sprite.scaleX, 1, 0.2),
        Phaser.Math.Linear(this.sprite.scaleY, 1, 0.2)
      );
      this.sprite.setAngle(Math.sin(time * 0.018) * 1.5);
    }

    this.updateShadow();
  }

  updateIdle(time, paused = false) {
    const targetX = this.scene.getLaneX(1);
    const bob = paused ? 0 : Math.sin(time * 0.004) * 4;
    this.sprite.x = Phaser.Math.Linear(this.sprite.x, targetX, 0.18);
    this.positionY = this.groundY + bob;
    this.sprite.y = this.positionY;
    this.sprite.setScale(1);
    this.sprite.setTexture(Math.sin(time * 0.006) > 0 ? "teddy-run-a" : "teddy-run-b");
    this.sprite.setAngle(paused ? 0 : Math.sin(time * 0.0034) * 2.5);
    this.updateShadow();
  }

  moveLane(direction) {
    const nextLane = Phaser.Math.Clamp(this.targetLaneIndex + direction, 0, 2);

    if (nextLane === this.targetLaneIndex) {
      return;
    }

    this.targetLaneIndex = nextLane;
    this.scene.effects.spawnJumpDust(this.sprite.x, this.lineY + 4);
    this.scene.audioManager.playCollect("bright");
  }

  jump() {
    const graceWindow = this.scene.time.now - this.lastGroundedAt < 90;

    if (!this.grounded && !graceWindow) {
      return;
    }

    this.velocityY = this.jumpVelocity;
    this.grounded = false;
    this.slideTimer = 0;
    this.sprite.setTexture("teddy-jump");
    this.sprite.setScale(0.94, 1.08);
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1,
      scaleY: 1,
      duration: 160,
      ease: "Back.Out",
    });
    this.scene.effects.spawnJumpDust(this.sprite.x - 10, this.lineY + 2);
    this.scene.audioManager.playJump();
  }

  slide() {
    if (!this.grounded) {
      return;
    }

    this.slideTimer = this.slideDuration;
    this.scene.effects.spawnJumpDust(this.sprite.x, this.lineY + 2);
    this.scene.audioManager.playCollect("petal");
  }

  crash() {
    this.sprite.setTexture("teddy-hurt");
    this.sprite.setAngle(18);
    this.sprite.setScale(1.08);
  }

  revive() {
    this.sprite.setTexture("teddy-jump");
    this.sprite.setScale(1);
    this.sprite.setAngle(-8);
    this.velocityY = -320;
    this.positionY = this.groundY - 6;
    this.grounded = false;
    this.slideTimer = 0;
  }

  setInvincible(active) {
    if (this.invincibleTween) {
      this.invincibleTween.stop();
      this.invincibleTween = null;
    }

    this.sprite.setAlpha(1);

    if (active) {
      this.invincibleTween = this.scene.tweens.add({
        targets: this.sprite,
        alpha: 0.35,
        duration: 90,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  isSliding() {
    return this.slideTimer > 0;
  }

  isAirborne() {
    return !this.grounded;
  }

  getVerticalLift() {
    return this.groundY - this.positionY;
  }

  getLaneOffset() {
    const leftX = this.scene.getLaneX(0);
    const rightX = this.scene.getLaneX(2);
    return Phaser.Math.Clamp(
      Phaser.Math.Linear(-1, 1, (this.sprite.x - leftX) / (rightX - leftX)),
      -1.1,
      1.1
    );
  }

  getBounds() {
    const width = this.isSliding() ? 54 : 46;
    const height = this.isSliding() ? 42 : this.isAirborne() ? 62 : 72;
    const topOffset = this.isSliding() ? 32 : 42;

    return new Phaser.Geom.Rectangle(
      this.sprite.x - width * 0.5,
      this.sprite.y - topOffset,
      width,
      height
    );
  }

  updateShadow() {
    const lift = this.getVerticalLift();
    this.shadow.x = this.sprite.x;
    this.shadow.y = this.lineY + 10;
    this.shadow.scaleX = Phaser.Math.Linear(this.shadow.scaleX, this.isAirborne() ? 0.66 : this.isSliding() ? 1.08 : 1, 0.2);
    this.shadow.alpha = Phaser.Math.Linear(this.shadow.alpha, Phaser.Math.Clamp(0.18 - lift * 0.00018, 0.06, 0.18), 0.18);
  }
}
