// 整个的游戏界面
let game;
let parent = document.getElementById("window");
// 背景图
let background;
let middleground1;
let middleground;
let foreground;
//audio
let bgm1;
let bgm;
let hit;
let shoot;
let bomb;
let fall;
//font
let fontLoaded = false;
// 游戏界面大小,不要乱调
let gameWidth = 300;
let gameHeight = 160;
// 人物死亡标识符
let playerDead = false;
// 人物复活后短时间内关闭碰撞检测
// 之所以不用playerDead因为他还控制了和地面的碰撞
let playerTouch = false;
let enemyDead = false;
// 子弹的对象池
let bullets;
// 控制子弹密集程度,不是在这里设置
let bulletTime = 0;
// 坑的图
let obstacle;
// 文字
let scoreText = null;
// 记录得分和死亡
let score = 0;
let dieTimes = 0;
// 得分标识符
let scoreFlag = true;
// 调节游戏速度
let gameSpeed = 0.2;

window.onload = function () {
  game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, parent);
  // 添加scene
  game.state.add('Boot', boot);
  game.state.add('Preload', preload);
  game.state.add('TitleScreen', titleScreen);
  game.state.add('PlayGame', playGame);
  // 开始初始化scene，很快，几乎看不到
  game.state.start('Boot');
};

class boot {
  constructor(game) {}
  preload = () => {
    game.load.image('loading', 'assets/sprites/loading.png');
  };
  create = () => {
    // 全屏
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.setMinMax(300, 160, 600, 320);
    // 打开预加载scene
    this.game.state.start('Preload');
    scoreText = this.add.text(
      180,
      10,
      'load',
      {
        font: '1px 04b03regular',
        fill: '#ffffff',
        align: 'center',
      }
    );
  };
}

class preload {
  constructor(game) {}
  preload = () => {
   
    // 加载内容
    const loadingBar = this.game.add.sprite(
      game.width / 2,
      game.height / 2,
      'loading'
    );
    loadingBar.anchor.setTo(0.5);
    game.load.setPreloadSprite(loadingBar);
    // load elements in title screen
    //start page img
    game.load.image('title', 'assets/sprites/title.png');
    game.load.image('enter', 'assets/sprites/press-enter-text.png');
    game.load.image('instructions', 'assets/sprites/instruction.png');
    // environment--background
    game.load.image('background', 'assets/environment/b-background.png');
    game.load.image('middleground1', 'assets/environment/m-background.png');
    game.load.image('middleground', 'assets/environment/f-background.png');
    game.load.image('foreground', 'assets/environment/road.png');
    game.load.image('collision', 'assets/environment/collision.png');
    game.load.image('obstacle', 'assets/environment/obstacle.png');
    // 子弹
    game.load.image('bullet', 'assets/sprites/missile-preview1.png');

    // 加载player纹理
    game.load.atlasJSONArray(
      'atlas',
      'assets/atlas/player.png',
      'assets/atlas/player.json'
    );
    // 加载音乐
    game.load.audio('shoot', 'assets/audio/shoot.wav');
    game.load.audio('bomb', 'assets/audio/bomb.wav');
    game.load.audio('hit', 'assets/audio/hit.wav');
    game.load.audio('fall', 'assets/audio/falling.wav');
    game.load.audio('bgm', 'assets/audio/cyberpunk-beat.wav');
  };
  create = () => {
    // 进入游戏开始界面
    this.game.state.start('TitleScreen');
  };
}

class titleScreen {
  constructor(game) {}
  create = () => {
    // 布置场景
    background = game.add.tileSprite(0, 0, gameWidth, gameHeight, 'background');
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
    //bgm
    // bgm = game.add.audio('bgm');
    // bgm.play();

    //set title position	游戏图标
    this.title = game.add.image(game.width / 2, 70, 'title');
    this.title.anchor.setTo(0.5);
    this.title.scale.setTo(0.8);

    // enter btn图标
    this.pressEnter = game.add.image(game.width / 2, game.height , 'enter');
    this.pressEnter.anchor.setTo(0.5, 1);
    // this.pressEnter.scale.setTo(0.7);
    //add keydown event	检测ENTER按键
    const startKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    // 当检测到按键时启动事件this.startGame,就在下面
    startKey.onDown.add(this.startGame, this);
    //animate text	enterbtn事件this.blinkText,就在下面
    game.time.events.loop(700, this.blinkText, this);

    // 标记按了几次enter
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

  // update方法带动了整个游戏的运行,这里是游戏开始界面的控制背景运动
  // 后面还有一个是游戏运行界面的
  update = () => {
    // background.tilePosition.x -= 0.1;
    middleground.tilePosition.x -= 0.6;
    middleground1.tilePosition.x -= 0.2;
  };

  startGame = () => {
    // 如果按了一次就是显示游戏提示,按了两次就是开始游戏
    if (this.state == 1) {
      this.state = 2;
      this.title2 = game.add.image(game.width / 2, 70, 'instructions');
      this.title2.anchor.setTo(0.5);
      this.title2.scale.setTo(0.8);
      // 销毁第一个游戏图标
      this.title.destroy();
    } else {
      // 开始游戏
      this.game.state.start('PlayGame');
      //bgm1.stop();
    }
  };
}

// main class
class playGame {
  constructor(game) {}
  create = () => {
    // collision	地面的碰撞体
    this.ground = game.add.sprite(0, 136, 'collision');
    this.ground.scale.setTo(30, 1);
    // console.log(this.ground);

    //graveity	添加物理引擎
    game.physics.arcade.enable(this.ground);
    // 固定ground
    this.ground.body.immovable = true;

    //environment	放置背景
    background = game.add.tileSprite(0, 0, gameWidth, gameHeight, 'background');
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
    // 添加音乐
    shoot = game.add.audio('shoot');
    bomb = game.add.audio('bomb');
    hit = game.add.audio('hit');
    fall = game.add.audio('fall');
    bgm = new Phaser.Sound(game, 'bgm', 1, true);
    bgm.play();
    // 添加分数文字

    scoreText = this.add.text(
      180,
      10,
      'Die: ' + dieTimes + ' Score: ' + score,
      {
        font: '15px 04b03regular',
        fill: '#ffffff',
        align: 'center',
      }
    );

    // 坑
    // 随机坑的位置
    let ran = game.rnd.between(1, 100);
    // 坑比地面高一个像素的距离，使人可以撞到
    obstacle = game.add.sprite(gameWidth + ran, 135, 'obstacle');
    // 调节0.4的大小,使边宽变窄,不要调,会跳不过去
    obstacle.scale.setTo(4 * gameSpeed, 1);
    game.physics.arcade.enable(obstacle);

    //player
    // 动画速度
    const animSpeed = 10;
    // 50, 0是为了让player从空中掉下来
    // 50是人物的x轴
    // 修改这个值需要同步修改resetPlayer中的值
    this.player = game.add.sprite(50, 0, 'atlas', 'jump-1');
    // console.log(1);
    // 添加动画
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
    // this.isCrouch = this.player.animations.add(
    //   'crouch',
    //   ['crouch-3'],
    //   animSpeed,
    //   true
    // );
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
    // 设置锚点和物理引擎
    this.player.anchor.setTo(0.5);
    game.physics.arcade.enable(this.player);

    // 人物的重力，决定了下落的速度
    this.player.body.gravity.y = 450;
    // 设置人物碰撞范围，要不然就会包含png的空白部分
    //  This adjusts the collision body size to be a 16, 39 box.
    //  20, 10 is the X and Y offset of the newly sized box.
    this.player.body.setSize(16, 39, 20, 10);
    // 通过循环事件来闪烁角色，与press enter的方法相同
    game.time.events.loop(100, this.blinkPlayer, this);

    // controls	键盘事件
    this.controllers = {
      jump: game.input.keyboard.addKey(Phaser.Keyboard.UP),
      // crouch: game.input.keyboard.addKey(Phaser.Keyboard.DOWN),
      shot: game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR),
      // right: game.input.keyboard.addKey(Phaser.Keyboard.RIGHT)
    };

    // 子弹
    // 所有的子弹都放在bullets中,有三十发
    // 当子弹碰到游戏界面右侧会被回收
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
    // 设置怪物的大小
    this.enemy.scale.set(0.6, 0.6);
    this.enemy.body.gravity.y = 0;
    // 怪物的x方向重力
    this.enemy.body.velocity.x = -1000 * gameSpeed;
    this.enemy.body.setSize(32, 32, 13, 15);
  };

  blinkPlayer = () => {
    if (!playerTouch) {
      // 在上面设置了loop循环,alpha控制图片透明度
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
    // 随机一个数，来决定怪物的y轴高度
    let ran = game.rnd.between(1, 4);
    // 200可以控制怪物间隔，建议大于150
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

  // 开火
  fireBullet = () => {
    //  To avoid them being allowed to fire too fast we set a time limit
    if (game.time.now > bulletTime) {
      //  Grab the first bullet we can from the pool
      let bullet = bullets.getFirstExists(false);

      if (bullet) {
        //  And fire it
        // 因为蹲着的时候player的y值不变，需要手动调节子弹位置
        // if (crouchFlag) {
        // bullet.reset(this.player.x + 28, this.player.y + 12);
        // } else {
        bullet.reset(this.player.x + 28, this.player.y + 2);
        // }
        // 攻击速度
        bullet.body.velocity.x = 1000 * gameSpeed;
        // 攻击间隔
        bulletTime = game.time.now + 250;
        // this.bullet.animations.play('flash')
      }
    }
  };

  collisionHandler = (enemy, bullet) => {
    bullet.kill();
    enemyDead = true;
    // 播放爆炸动画，停止敌人移动，重定义敌人坐标
    this.enemy.animations.play('explosion');
    bomb.play();
    // this.enemy.body.velocity.x = 0;

    game.time.events.add(Phaser.Timer.SECOND * 0.6, this.resetEnemy, this);
    // console.log(2,scoreFlag)
    if (scoreFlag) {
      // 得分
      // 因为update在不断检测的关系
      // 会碰撞很多次,而每次都会加分,不行
      // 因此用scoreFlag标记,使其只加分一次
      // scoreFlag的重置在update中
      score++;
      scoreText.setText('Die: ' + dieTimes + ' Score: ' + score);
      // console.log(1);
      scoreFlag = false;
    }
  };

  // 第二个update,控制整个游戏的运行
  update = () => {
    // debug
    // 就是那个绿色的框,删掉下面两个就会消失
    // game.debug.body(this.enemy);
    // game.debug.body(this.player);

    // collisions
    // player与地面
    if (!playerDead) {
      game.physics.arcade.collide(this.player, this.ground);
    }
    // 子弹与敌人
    game.physics.arcade.overlap(
      bullets,
      this.enemy,
      this.collisionHandler,
      null,
      this
    );
    // player与敌人
    if (!enemyDead && playerTouch) {
      game.physics.arcade.overlap(
        this.player,
        this.enemy,
        this.killPlayer,
        null,
        this
      );
    }
    // player与坑
    if (!playerDead && playerTouch) {
      game.physics.arcade.collide(
        this.player,
        obstacle,
        this.killPlayerFall,
        null,
        this
      );
    }

    // player移动,在最下面,被删的没什么了
    this.movePlayer();

    // 背景运动
    // 通过不同的移动速度，制造景深的效果
    background.tilePosition.x -= 4 * gameSpeed;
    middleground1.tilePosition.x -= 6 * gameSpeed;
    middleground.tilePosition.x -= 8 * gameSpeed;
    foreground.tilePosition.x -= 10 * gameSpeed;
    obstacle.x -= 10 * gameSpeed;

    // 控制敌人刷新
    // 从头到尾就一个敌人，只是不断的重定义他的坐标
    if (this.enemy.x < -100) {
      this.resetEnemy();
    }
    // 重置得分标志,因为是取整运算,有时取不到gameWidth
    // 设置为两个值,因为UPDATE的帧数不够快的关系,出现重置两次,加分两次的情况是小概率事件
    // 甚至重置两次本身就是小概率事件
    if (
      Math.floor(this.enemy.x) == gameWidth ||
      Math.floor(this.enemy.x) == gameWidth - 1
    ) {
      scoreFlag = true;
    }
    // 控制坑刷新
    // 从头到尾就一个坑，只是不断的重定义他的坐标
    if (obstacle.x < -100) {
      this.resetObstacle();
    }

    // 动画控制以及碰撞体控制
    if (playerDead) {
      // this.player.animations.play('dead', 10, false);
      // game.time.events.add(Phaser.Timer.SECOND * 1, this.resetPlayer, this);
      this.player.animations.play('dead');
      game.time.events.add(Phaser.Timer.SECOND * 0.8, this.resetPlayer, this);
      // this.resetPlayer();
    }
    // else if (crouchFlag) {
    // 	this.player.animations.play('crouch');
    // 	this.player.body.setSize(15, 30, 21, 19);
    // }
    // 检测人物有没有接触地面，以此实现人物可以在跳起时移动
    // 要不然，人物就会在半空中run
    // else if (runFlag && this.player.body.touching.down) {
    // 	this.player.animations.play('run');
    // 	this.player.body.setSize(16, 39, 20, 10);
    // }
    // 射击
    else if (this.controllers.shot.isDown) {
      this.fireBullet();
      shoot.play();
      this.player.body.setSize(16, 39, 20, 10);
      // 使人物在空中也能射击,就像魂斗罗
      // this.player.body.touching.down是检测人物有没有在地面
      if (this.player.body.touching.down) {
        this.player.animations.play('runShot');
      } else {
        this.player.animations.play('jump');
      }
    } else if (this.player.body.touching.down) {
      // 复活后在落地后3秒内无敌
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
    }
    // 跳跃键使人物的重力向上，人物跳起
    // 跳起后人物的重力有被设置为向下，因此检测到重力向下，就播放人物落下的动作
    else if (this.player.body.velocity.y > 100) {
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
    // 为了增加复活落地的视觉效果减小重力
    this.player.body.gravity.y = 200;
    this.player.animations.play('jump');
    this.player.body.setSize(20, 23, 18, 14);
    this.player.reset(50, 0);
    if (playerDead) {
      // 与得分相似.只不过用playerDead来标记
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
    // 如果player死亡则return使按键不生效
    if (playerDead) {
      return;
    }
    // 跳跃
    if (this.controllers.jump.isDown && this.player.body.touching.down) {
      this.player.body.velocity.y = -200;
    }
    // 蹲下
    // else if (
    // 	this.controllers.crouch.isDown &&
    // 	this.player.body.touching.down
    // ) {
    // 	// console.log(1)
    // 	crouchFlag = true;
    // }
    // run
    // else if (
    // 	this.controllers.right.isDown
    // ) {
    // 	runFlag = true;

    // }
  };
}
