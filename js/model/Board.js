function Board(game){
  this.shapes = [];
  this.height = 9;
  this.width = 9;
  this.game = game;
}

Board.prototype.generateSimple = function(){
  this.shapes = new Array(this.height * this.width);
  var arr = this.shapes;
  var height = this.height;
  var width = this.width;
  var color = [0xffffff, 0x00ff00, 0x0000ff];
  var gameWidth = this.game.width;
  var gameHeight = this.game.height;
  var gridSize = Math.min(gameWidth, gameHeight) / 10;
  for(var i=0; i<height; i++){
    for(var j=0; j<width; j++){
      var r = Math.floor(Math.random() * 3);
      var sprite = game.add.sprite(i * gridSize, (j + 1) * gridSize, 'ball');
      arr[i * width + j] = sprite;
      sprite.tint = color[r];
      sprite.width = gridSize;
      sprite.height = gridSize;
    }
  }
}
