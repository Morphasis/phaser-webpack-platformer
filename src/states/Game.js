/* globals __DEV__ */
import Phaser from 'phaser'
import Mushroom from '../sprites/Mushroom'

var map;
var base_layer;
var lava_layer;

export default class extends Phaser.State {
  init (){
    // Start the Arcade physics system (for movements and collisions)
    this.physics.startSystem(Phaser.Physics.ARCADE);
    // Add the physics engine to all game objects
    this.world.enableBody = true;
  }
  preload () {
    // Platformer images
    game.load.image('player', 'assets/player.png');
    game.load.image('wall', 'assets/wall.png');
    game.load.image('coin', 'assets/coin.png');
    game.load.image('enemy', 'assets/enemy.png');

    game.load.tilemap('level', 'assets/level.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/Set_01.png');
  }

  create () {

    map = game.add.tilemap('level');

    var game_width = map.widthInPixels;
    var game_height = map.heightInPixels;

    // Tileset
    map.addTilesetImage('Set_01', 'tiles');

    // Create the base layer
    base_layer = map.createLayer('base');
    // Create the lava layer
    lava_layer = map.createLayer('lava');


    this.walls = game.add.group();
    this.coins = game.add.group();
    this.enemies = game.add.group();

    //  Here we create our coins group
    this.coins = game.add.group();
    this.coins.enableBody = true;

    base_layer.resizeWorld();

    // Variable to store the arrow key pressed
    this.cursor = game.input.keyboard.createCursorKeys();

    // Create the player in the middle of the game
    this.player = game.add.sprite(70, 100, 'player');

    // Add gravity to make it fall
    this.player.body.gravity.y = 600;

    // This is the base (floor)
    map.setCollision(3);
    // This is the lava_layer
    map.setCollision(2, true, lava_layer);

    //  And now we convert all of the Tiled objects with an ID of 34 into sprites within the coins group
    map.createFromObjects('Object Layer 1', 1, 'coin', 0, true, false, this.coins);
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
      this.player.body.velocity.x = -200;
    }
    else if (this.cursor.right.isDown) {
      this.player.body.velocity.x = 200;
    }
    else {
      this.player.body.velocity.x = 0;
    }

    if (this.cursor.up.isDown && this.player.body.blocked.down) {
      this.player.body.velocity.y = -250;
    }
  }

  render () {}

  // Function to kill a coin
  takeCoin (player, coin) {
      coin.kill();
  }

  // Function to restart the game
  restart () {
      game.state.start('Game');
  }
}
