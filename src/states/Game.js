/* globals __DEV__ */
import Phaser from 'phaser'
import Mushroom from '../sprites/Mushroom'

var map;
var scaleRatio;
var base_layer;
var lava_layer;
var non_colide_layer;
var gameSound;
var teleporter;
var teleporterAnimation;

export default class extends Phaser.State {
  init (){
    // Start the Arcade physics system (for movements and collisions)
    this.physics.startSystem(Phaser.Physics.ARCADE);
    // Add the physics engine to all `game` objects
    this.world.enableBody = true;
  }
  preload () {

    game.load.audio('gameSound', 'assets/coin_sound.wav');

    // Platformer images
    game.load.image('player', 'assets/player.png');
    game.load.image('coin', 'assets/coin.png');

    game.load.tilemap('level', 'assets/level.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/Set_01.png');
    game.load.spritesheet("teleporter_ani", "assets/teleporter_ani.png", 64, 96);
  }

  create () {
    // capture coin sound
    gameSound = game.add.audio('gameSound');

    map = game.add.tilemap('level');

    // Tileset
    map.addTilesetImage('Set_01', 'tiles');

    // Create the base layer
    base_layer = map.createLayer('base');
    // Create the lava layer
    lava_layer = map.createLayer('lava');
    // Create the non player interatction layer
    non_colide_layer = map.createLayer('non_colide');
    non_colide_layer = map.createLayer('non_colide2');

    // Animations
    this.teleporter = game.add.sprite(game.width / 2, game.height / 2, "teleporter_ani");

    this.teleporterAnimation = this.teleporter.animations.add('teleporterAnimation', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]);

    this.teleporter.idleFrame = 0;

    this.walls = game.add.group();
    this.coins = game.add.group();
    this.enemies = game.add.group();
    this.player = game.add.group();

    //  Here we create our coins group
    this.coins = game.add.group();
    this.coins.enableBody = true;

    base_layer.resizeWorld();

    // Variable to store the arrow key pressed
    this.cursor = game.input.keyboard.createCursorKeys();

    // Create the player from the player object layer
    map.createFromObjects('player', 1, 'player', 0, true, false, this.player);

    // Enables physics on the player of type arcade
    game.physics.arcade.enableBody(this.player.children[0]);

    // Renames the player group to be the one sprite that is the child.
    // Reason for this is to keep the code consistant with what was there before.
    this.player = this.player.children[0]


    // Add gravity to make it fall
    this.player.body.gravity.y = 600;

    // This is the base (floor)
    map.setCollision([3,4,5,6,7,8,9,10,11,12,13]);
    // This is the lava_layer
    // TODO: Fix spikes (they should act the same as lava)
    map.setCollision([1,2,3], true, lava_layer);

    //  And now we convert all of the Tiled objects with an ID of 34 into sprites within the coins group
    map.createFromObjects('Object Layer 1', 121, 'coin', 0, true, false, this.coins);
    // map.createFromObjects('Object Layer 1', 1, 'coin', 0, true, false, this.coins);


    game.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER)
  }

  update () {
    // Make the player and the walls collide
    game.physics.arcade.collide(this.player, base_layer);

    // Call the 'takeCoin' function when the player takes a coin
    game.physics.arcade.overlap(this.player, this.coins, this.takeCoin, null, this);

    // Call the 'restart' function when the player touches the enemy
    game.physics.arcade.collide(this.player, lava_layer, this.restart, null, this);

    // Move the player when an arrow key is pressed
    if (this.cursor.left.isDown) {
      this.teleporter.animations.play("teleporterAnimation", 25, false);
      this.teleporter.idleFrame = 0;
      this.player.body.velocity.x = -200;
    }
    else if (this.cursor.right.isDown) {
      this.player.body.velocity.x = 200;
    }
    else {
      this.player.body.velocity.x = 0;
    }

    if (this.cursor.up.isDown && this.player.body.blocked.down) {
      this.player.body.velocity.y = -350;
    }
  }

  render () {}

  // Function to kill a coin
  takeCoin (player, coin) {
    gameSound.play();
    coin.kill();
  }

  // Function to restart the game
  restart () {
    game.state.start('Game');
  }
}
