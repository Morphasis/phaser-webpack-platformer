/* globals __DEV__ */
import Phaser from 'phaser'
import Mushroom from '../sprites/Mushroom'

var map;
var base_layer;
var lava_layer;
var non_colide_layer;
var background_layer;
var coinSound;
var teleporters;
var teleported = false;

export default class extends Phaser.State {
  init (){
    // Start the Arcade physics system (for movements and collisions)
    this.physics.startSystem(Phaser.Physics.ARCADE);
    // Add the physics engine to all `game` objects
    this.world.enableBody = true;
  }
  preload () {
    game.load.audio('coinSound', 'assets/coin_sound.wav');

    // Platformer images
    game.load.image('player', 'assets/player.png');
    game.load.image('coin', 'assets/coin.png');

    game.load.tilemap('level', 'assets/level.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/Set_01.png');
    game.load.spritesheet("teleporter_ani", "assets/teleporter_ani.png", 64, 96);
    if (teleported === true) {
      setTimeout(function(){
        teleported = false;
      }, 3000);
    }
  }

  create () {
    // capture coin sound
    coinSound = game.add.audio('coinSound');

    map = game.add.tilemap('level');

    // Tileset
    map.addTilesetImage('Set_01', 'tiles');

    // Create Layers
    background_layer = map.createLayer('background');
    base_layer = map.createLayer('base');
    non_colide_layer = map.createLayer('non_colide');
    non_colide_layer = map.createLayer('non_colide2');
    lava_layer = map.createLayer('lava');

    // Setup groups
    this.coins = game.add.group();
    this.player = game.add.group();
    teleporters = game.add.group();



    // Here we set the physics
    this.coins.enableBody = true;
    teleporters.enableBody = true;
    this.player.enableBody = true;

    base_layer.resizeWorld();

    // Variable to store the arrow key pressed
    this.cursor = game.input.keyboard.createCursorKeys();

    // Substtute player
    map.createFromObjects('player', 1, 'player', 0, true, false, this.player);
    // Substtute teleporter
    map.createFromObjects('Object Layer 1', 14766, 'teleporter_ani', 0, true, false, teleporters);
    // Substtute coins
    map.createFromObjects('Object Layer 1', 121, 'coin', 0, true, false, this.coins);

    // Animations
    teleporters.callAll('animations.add', 'animations', 'teleporterAnimation', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23], 25, false);

    // Renames the player group to be the one sprite that is the child.
    // Reason for this is to keep the code consistant with what was there before.
    this.player = this.player.children[0]

    // Add gravity to make it fall
    this.player.body.gravity.y = 600;

    // This is the base (floor)
    map.setCollision([3,4,5,6,7,8,9,10,11,12,13], true, base_layer);
    // This is the lava_layer
    // TODO: Fix spikes (they should act the same as lava)
    map.setCollision([1,2,3], true, lava_layer);

    // Camera follow player
    game.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER)
  }

  update () {
    // Make the player and the walls collide
    game.physics.arcade.collide(this.player, base_layer);

    // Call the 'takeCoin' function when the player takes a coin
    game.physics.arcade.overlap(this.player, this.coins, this.takeCoin, null, this);

    game.physics.arcade.overlap(this.player, teleporters, this.teleport, null, this);

    // Call the 'restart' function when the player touches the enemy
    game.physics.arcade.collide(this.player, lava_layer, this.restart, null, this);

    // Move the player when an arrow key is pressed
    if (this.cursor.left.isDown) {
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
    coinSound.play();
    coin.kill();
  }

  teleport () {

    teleporters.callAll('animations.play', 'animations', 'teleporterAnimation');
    setTimeout(function(){
      if (teleported === false){
        game.state.start('Game');
        teleported = true;
      }
     }, 1000);
  }

  // Function to restart the game
  restart () {
    game.state.start('Game');
  }
}
