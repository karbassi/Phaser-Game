let game;
let parent = document.getElementById('window');
let background;
let middleground1;
let sun;
let middleground;
let foreground;

let bgm1;
let bgm;
let hit;
let shoot;
let bomb;
let fall;

let fontLoaded = false;

let gameWidth = 300;
let gameHeight = 160;
let playerDead = false;
let playerTouch = false;
let enemyDead = false;
let bullets;
let bulletTime = 0;
let obstacle;
let scoreText = null;
let score = 0;
let dieTimes = 0;
let scoreFlag = true;
let gameSpeed = 0.2;

window.onload = function () {
  game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, parent);
  game.state.add('Boot', boot);
  game.state.add('Preload', preload);
  game.state.add('TitleScreen', titleScreen);
  game.state.add('PlayGame', playGame);
  game.state.start('Boot');
};

class boot {
  constructor(game) {}
  preload = () => {
    game.load.image('loading', 'assets/sprites/loading.png');
  };
  create = () => {
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.setMinMax(300, 160, 600, 320);
    this.game.state.start('Preload');
    scoreText = this.add.text(180, 10, 'load', {
      font: '1px 04b03regular',
      fill: '#ffffff',
      align: 'center',
    });
  };
}

class preload {
  constructor(game) {}
  preload = () => {
    const loadingBar = this.game.add.sprite(
      game.width / 2,
      game.height / 2,
      'loading'
    );
    loadingBar.anchor.setTo(0.5);
    game.load.setPreloadSprite(loadingBar);

    // load elements in title screen
    game.load.image('title', 'assets/sprites/title.png');
    game.load.image('enter', 'assets/sprites/press-enter-text.png');
    game.load.image('instructions', 'assets/sprites/instruction.png');
    game.load.image('background', 'assets/environment/b-background.png');
    game.load.image('middleground1', 'assets/environment/m-background.png');
    game.load.image('sun', 'assets/environment/sun.png');
    game.load.image('middleground', 'assets/environment/f-background.png');
    game.load.image('foreground', 'assets/environment/road.png');
    game.load.image('collision', 'assets/environment/collision.png');
    game.load.image('obstacle', 'assets/environment/obstacle.png');
    game.load.image('bullet', 'assets/sprites/missile-preview1.png');
    game.load.atlasJSONArray(
      'atlas',
      'assets/atlas/player.png',
      'assets/atlas/player.json'
    );
    game.load.audio('shoot', 'assets/audio/shoot.wav');
    game.load.audio('bomb', 'assets/audio/bomb.wav');
    game.load.audio('hit', 'assets/audio/hit.wav');
    game.load.audio('fall', 'assets/audio/falling.wav');
    game.load.audio('bgm', 'assets/audio/cyberpunk-beat.wav');
  };
  create = () => {
    this.game.state.start('TitleScreen');
  };
}

class titleScreen {
  constructor(game) {}
  create = () => {
    background = game.add.tileSprite(0, 0, gameWidth, gameHeight, 'background');
    sun = game.add.tileSprite(0, 0, gameWidth, gameHeight, 'sun');
    middleground1 = game.add.tileSprite(
      0,
      0,
      gameWidth,
      gameHeight,
      'middleground1'
    );
    middleground = game.add.tileSprite(
      0,
      0,
      gameWidth,
      gameHeight,
      'middleground'
    );

    //set title position
    this.title = game.add.image(game.width / 2, 70, 'title');
    this.title.anchor.setTo(0.5);
    this.title.scale.setTo(0.8);

    // enter btn
    this.pressEnter = game.add.image(game.width / 2, game.height, 'enter');
    this.pressEnter.anchor.setTo(0.5, 1);
    const startKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    startKey.onDown.add(this.startGame, this);
    game.time.events.loop(700, this.blinkText, this);
    this.state = 1;
  };

  blinkText = () => {
    // 在上面设置了loop循环,alpha控制图片透明度
    if (this.pressEnter.alpha) {
      this.pressEnter.alpha = 0;
    } else {
      this.pressEnter.alpha = 1;
    }
  };

  update = () => {
    middleground.tilePosition.x -= 0.6;
    middleground1.tilePosition.x -= 0.2;
  };

  startGame = () => {
    if (this.state == 1) {
      this.state = 2;
      this.title2 = game.add.image(game.width / 2, 70, 'instructions');
      this.title2.anchor.setTo(0.5);
      this.title2.scale.setTo(0.8);
      this.title.destroy();
    } else {
      this.game.state.start('PlayGame');
    }
  };
}

// main class
class playGame {
  constructor(game) {}
  create = () => {
    // collision
    this.ground = game.add.sprite(0, 136, 'collision');
    this.ground.scale.setTo(30, 1);
    //graveity
    game.physics.arcade.enable(this.ground);
    this.ground.body.immovable = true;

    //environment
    background = game.add.tileSprite(0, 0, gameWidth, gameHeight, 'background');
    sun = game.add.tileSprite(0, 0, gameWidth, gameHeight, 'sun');
    middleground1 = game.add.tileSprite(
      0,
      0,
      gameWidth,
      gameHeight,
      'middleground1'
    );
    middleground = game.add.tileSprite(
      0,
      0,
      gameWidth,
      gameHeight,
      'middleground'
    );
    foreground = game.add.tileSprite(0, 0, gameWidth, gameHeight, 'foreground');
    // add music
    shoot = game.add.audio('shoot');
    bomb = game.add.audio('bomb');
    hit = game.add.audio('hit');
    fall = game.add.audio('fall');
    bgm = new Phaser.Sound(game, 'bgm', 1, true);
    bgm.play();

    scoreText = this.add.text(
      180,
      10,
      'Die: ' + dieTimes + ' Score: ' + score,
      {
        font: '15px 04b03regular',
        fill: '#00fff0',
        align: 'center',
      }
    );
    // random position
    let ran = game.rnd.between(1, 100);
    obstacle = game.add.sprite(gameWidth + ran, 135, 'obstacle');

    obstacle.scale.setTo(4 * gameSpeed, 1);
    game.physics.arcade.enable(obstacle);

    const animSpeed = 10;

    //start from fall
    this.player = game.add.sprite(50, 0, 'atlas', 'jump-1');

    // animation
    this.isRun = this.player.animations.add(
      'run',
      Phaser.Animation.generateFrameNames('run-', 1, 12, '', 0),
      animSpeed,
      true
    );
    this.player.animations.add(
      'jump',
      Phaser.Animation.generateFrameNames('jump-', 1, 8, '', 0),
      animSpeed,
      false,
      false
    );

    this.player.animations.add(
      'idle',
      Phaser.Animation.generateFrameNames('idle-', 1, 4, '', 0),
      animSpeed,
      false,
      false
    );
    this.player.animations.add('drop', ['jump-7']);

    //dead events
    this.animPlayerDead = this.player.animations.add(
      'dead',
      Phaser.Animation.generateFrameNames('hurt-', 1, 4, '', 0),
      animSpeed,
      false,
      false
    );
    this.animPlayerDead = this.player.animations.add(
      'runShot',
      Phaser.Animation.generateFrameNames('run_shoot-', 1, 12, '', 0),
      animSpeed,
      false,
      false
    );

    this.player.anchor.setTo(0.5);
    game.physics.arcade.enable(this.player);

    this.player.body.gravity.y = 450;

    // real size player
    this.player.body.setSize(16, 39, 20, 10);
    game.time.events.loop(100, this.blinkPlayer, this);

    this.controllers = {
      jump: game.input.keyboard.addKey(Phaser.Keyboard.UP),
      shot: game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR),
    };

    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    // enemies
    this.enemy = game.add.sprite(gameWidth + 100, 125, 'atlas', 'drone-1');
    this.enemy.animations.add(
      'drone',
      Phaser.Animation.generateFrameNames('drone-', 1, 4, '', 0),
      animSpeed,
      true
    );
    this.enemy.animations.add(
      'explosion',
      Phaser.Animation.generateFrameNames('enemy-explosion-', 1, 6, '', 0),
      animSpeed,
      true
    );

    this.enemy.animations.play('drone');
    game.physics.arcade.enable(this.enemy);
    this.enemy.anchor.setTo(0.5);
    this.enemy.scale.set(0.6, 0.6);
    this.enemy.body.gravity.y = 0;
    this.enemy.body.velocity.x = -1000 * gameSpeed;
    this.enemy.body.setSize(32, 32, 13, 15);
  };

  blinkPlayer = () => {
    if (!playerTouch) {
      if (this.player.alpha) {
        this.player.alpha = 0;
      } else {
        this.player.alpha = 1;
      }
    } else {
      this.player.alpha = 1;
    }
  };

  resetEnemy = () => {
    this.enemy.body.velocity.x = -1000 * gameSpeed;
    this.enemy.animations.play('drone');
    // random position.y
    let ran = game.rnd.between(1, 4);
    this.enemy.x = gameWidth + 200;
    if (ran == 1) {
      this.enemy.y = 100;
    } else if (ran == 2) {
      this.enemy.y = 125;
    } else {
      this.enemy.y = 75;
    }
    enemyDead = false;
  };

  resetObstacle = () => {
    let ran = game.rnd.between(1, 100);
    obstacle.x = gameWidth + ran;
    obstacle.y = 135;
  };

  fireBullet = () => {
    //  To avoid them being allowed to fire too fast we set a time limit
    if (game.time.now > bulletTime) {
      //  Grab the first bullet we can from the pool
      let bullet = bullets.getFirstExists(false);

      if (bullet) {
        bullet.reset(this.player.x + 28, this.player.y + 2);
        bullet.body.velocity.x = 1000 * gameSpeed;
        bulletTime = game.time.now + 250;
      }
    }
  };

  collisionHandler = (enemy, bullet) => {
    bullet.kill();
    enemyDead = true;
    this.enemy.animations.play('explosion');
    bomb.play();

    game.time.events.add(Phaser.Timer.SECOND * 0.6, this.resetEnemy, this);

    if (scoreFlag) {
      score++;
      scoreText.setText('Die: ' + dieTimes + ' Score: ' + score);
      scoreFlag = false;
    }
  };

  update = () => {
    // ** debug
    // game.debug.body(this.enemy);
    // game.debug.body(this.player);
    // game.debug.body(obstacle);

    // collisions
    if (!playerDead) {
      game.physics.arcade.collide(this.player, this.ground);
    }

    game.physics.arcade.overlap(
      bullets,
      this.enemy,
      this.collisionHandler,
      null,
      this
    );

    if (!enemyDead && playerTouch) {
      game.physics.arcade.overlap(
        this.player,
        this.enemy,
        this.killPlayer,
        null,
        this
      );
    }

    if (!playerDead && playerTouch) {
      game.physics.arcade.collide(
        this.player,
        obstacle,
        this.killPlayerFall,
        null,
        this
      );
    }

    this.movePlayer();

    background.tilePosition.x -= 1 * gameSpeed;
    middleground1.tilePosition.x -= 4 * gameSpeed;
    middleground.tilePosition.x -= 8 * gameSpeed;
    foreground.tilePosition.x -= 10 * gameSpeed;
    obstacle.x -= 10 * gameSpeed;

    //reset enemy position
    if (this.enemy.x < -100) {
      this.resetEnemy();
    }

    if (
      Math.floor(this.enemy.x) == gameWidth ||
      Math.floor(this.enemy.x) == gameWidth - 1
    ) {
      scoreFlag = true;
    }

    if (obstacle.x < -100) {
      this.resetObstacle();
    }

    if (playerDead) {
      this.player.animations.play('dead');
      game.time.events.add(Phaser.Timer.SECOND * 0.8, this.resetPlayer, this);
    }

    // shoot
    else if (this.controllers.shot.isDown) {
      this.fireBullet();
      shoot.play();
      this.player.body.setSize(16, 39, 20, 10);

      if (this.player.body.touching.down) {
        this.player.animations.play('runShot');
      } else {
        this.player.animations.play('jump');
      }
    } else if (this.player.body.touching.down) {
      if (!playerTouch) {
        game.time.events.add(
          Phaser.Timer.SECOND * 3,
          function () {
            playerTouch = true;
          },
          this
        );
      }

      this.player.body.gravity.y = 450;
      this.player.animations.play('run');
      this.player.body.setSize(16, 39, 20, 10);
    } else if (this.player.body.velocity.y > 100) {
      this.player.animations.play('drop');
      this.player.body.setSize(16, 39, 20, 10);
    } else if (this.player.body.velocity.y < 0) {
      this.player.animations.play('jump');
      this.player.body.setSize(20, 23, 18, 14);
    }
  };

  //later will create  gameover page
  resetPlayer = () => {
    playerTouch = false;

    this.player.body.gravity.y = 200;
    this.player.animations.play('jump');
    this.player.body.setSize(20, 23, 18, 14);
    this.player.reset(50, 0);
    if (playerDead) {
      dieTimes++;
      scoreText.setText('Die: ' + dieTimes + ' Score: ' + score);
    }
    playerDead = false;
  };

  killPlayer = () => {
    playerDead = true;
    hit.play();
  };
  killPlayerFall = () => {
    playerDead = true;
    fall.play();
  };

  movePlayer = () => {
    if (playerDead) {
      return;
    }
    if (this.controllers.jump.isDown && this.player.body.touching.down) {
      this.player.body.velocity.y = -200;
    }
  };
}
