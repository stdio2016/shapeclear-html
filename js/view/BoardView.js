function BoardView(game, board) {
    this.board = board;
    this.game = game;
    this.boardGroup = game.add.group(game.world, 'boardGroup');
    this.boardGroup.alpha = 0.8;
    this.shapeGroup = game.add.group(game.world, 'shapeGroup');
    this.brightShader = null;
    this.cachedHint = null;
    this.hintTimer = 0;
    this.x = 0;
    this.y = 0;
    this.gridSize = 64;
}

BoardView.prototype.drawShape = function () {
    var board = this.board;
    var gridSize = this.gridSize;
    var gridPx = this.game.state.states.Load.gridPx;
    var scale = gridSize / gridPx;
    var startX = this.x;
    var startY = this.y;
    var used = 0;
    for (var y = 0; y < board.height; y++){
        for (var x = 0; x < board.width; x++){
            var shape = board.shapes[y * board.width + x];
            var spr = null;
            if (shape.type <= 0) ;
            else if (used >= this.shapeGroup.length) {
                spr = this.shapeGroup.create(100, 100, 'shapes', Shape.typeNames[shape.type - 1]);
                spr.shader = this.brightShader;
                spr.alpha = 1;
                spr.anchor = new Phaser.Point(0, 0);
                used++;
            }
            else {
                spr = this.shapeGroup.children[used++];
                spr.visible = true;
            }
            if (spr !== null) {
                var pos = shape.pos;
                var frameName = Shape.typeNames[shape.type - 1];
                var adjX = 0, adjY = 0;
                if (shape.special == 1) frameName += "HStripe";
                if (shape.special == 2) frameName += "VStripe";
                if (shape.special == 3) frameName += "Wrapped";
                if (shape.special === 5) frameName = "elc";
                if (spr.frameName !== frameName)
                    spr.frameName = frameName;
                if (shape.special == 4) {
                    var t = shape.tick % 30 / 30;
                    if (t < 0.5) t = t * 2;
                    else t = (1 - t) * 2;
                    spr.tint = 0x010101 * Math.round(t * 95 + 160);
                }
                else {
                    var isHint = false;
                    if (this.cachedHint) {
                        this.cachedHint.forEach(function (h) {
                            if (shape.x == h.x && shape.y == h.y)
                                isHint = true;
                        });
                    }
                    if (isHint && this.hintTimer > 180) {
                        var t = (this.hintTimer - 180) % 30 / 30;
                        if (t < 0.5) t = t * 2;
                        else t = (1 - t) * 2;
                        spr.tint = 0x010101 * Math.round((1-t) * 95 + 160);
                        adjY -= t * 0.1;
                    }
                    else
                        spr.tint = 0xffffff;
                }
                spr.alpha = shape.tickClear / shape.tickClearTotal;
                if (board.state === Board.SHUFFLING) {
                    if (board.tick > 30)
                        spr.alpha = Math.max(0, (board.tick - 49) / 10);
                    else
                        spr.alpha = Math.max(0, (10 - board.tick) / 10);
                }
                if (board.tiles[y * board.width + x].isDispenser) {
                    var f = spr.animations.currentFrame;
                    var yy = shape.dir.y * pos/10;
                    if (yy > (f.spriteSourceSizeY+f.height)/gridPx) spr.visible = false;
                    else if (yy > f.spriteSourceSizeY/gridPx) {
                        spr.crop(new Phaser.Rectangle(0, yy * gridPx - f.spriteSourceSizeY, gridPx, gridPx));
                        adjY += yy-f.spriteSourceSizeY/gridPx;
                    }
                    else spr.crop(null);
                }
                else spr.crop(null);
                spr.scale.x = scale * spr.alpha;
                spr.scale.y = scale * spr.alpha;
                adjX += 0.5 - spr.alpha * 0.5;
                adjY += 0.5 - spr.alpha * 0.5;
                spr.x = startX + (x - shape.dir.x * pos/10 + adjX) * gridSize;
                spr.y = startY + (y - shape.dir.y * pos/10 + adjY) * gridSize;
            }
            var tile = board.tiles[y * board.width + x];
            if (!tile.sprite) {
                tile.sprite = this.boardGroup.create(0, 0, 'shapes', 'board');
                tile.sprite.shader = this.brightShader;
            }
            tile = tile.sprite;
            tile.x = startX + x * gridSize;
            tile.y = startY + y * gridSize;
            tile.scale.x = scale;
            tile.scale.y = scale;
            tile.visible = shape.type >= 0;
        }
    }
    for (var i = this.shapeGroup.length-1; i >= used; i--) {
        this.shapeGroup.children[i].visible = false;
    }
};

BoardView.prototype.drawEffects = function (effectGroup) {
    var startX = this.x, startY = this.y;
    var gridSize = this.gridSize;
    var scale = gridSize / this.game.state.states.Load.gridPx;
    var items = this.board.runningItems;
    var sc = 0;
    for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var pos = it.getSpritePositions();
        for (var j = 0; j < pos.length; j++) {
            var sp = effectGroup.children[sc++];
            var frameName = pos[j][4];
            if (!sp) {
                sp = effectGroup.create(100, 100, 'shapes', frameName);
                sp.shader = this.brightShader;
                sp.alpha = 1;
                sp.anchor = new Phaser.Point(0.5, 0.5);
            }
            if (sp.frameName !== frameName)
                sp.frameName = frameName;
            sp.x = startX + (pos[j][0] + 0.5) * gridSize;
            sp.y = startY + (pos[j][1] + 0.5) * gridSize;
            sp.scale.x = pos[j][2] * scale;
            sp.scale.y = pos[j][3] * scale;
            sp.visible = true;
        }
    }
    while (sc < effectGroup.length) {
        effectGroup.children[sc++].visible = false;
    }
};
