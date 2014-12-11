"use strict";

var mapStore = new MapStore();

function FloorMap(level, canvas, left, top) {
	var mapData = mapStore.getMap(level);
	var height = mapData.length;
	var width = (height > 0) ? mapData[0].length : 0;
	this.left = left;
	this.top = top;
	this.height = height;
	this.width = width;
	this.tiles = new Array(height);
	for (var i = 0; i < height; i++) {
		this.tiles[i] = new Array(width);
	}
	this.startPos = [0, 0];
	this.finishPos = [0, 0];
	for (var row = 0; row < height; row++) {
		for (var col = 0; col < width; col++) {
			var tile = new Tile(this.left + TILE_SIZE * col, this.top + TILE_SIZE * row, canvas);
			switch(mapData[row][col]) {
				case '.':
					break;
				case 'X':
					tile.setState(TileState.BLOCKED);
					break;
				case 'S':
					this.startPos = [row, col];
					break;
				case 'F':
					this.finishPos = [row, col];
					break;
				default:
					throw new Error("Invalid map data. (" + row + ", " + col + ") at level " + level);
			}
			tile.render();
			this.tiles[row][col] = tile;
		}
	}

}

FloorMap.prototype.render = function() {
	for (var row = 0; row < this.height; row++) {
		for (var col = 0; col < this.width; col++) {
			this.tiles[row][col].update();
			this.tiles[row][col].render();
		}
	}
};

FloorMap.prototype.renderEvery = function(millis) {
	var map = this;
	setInterval(function() {
		map.render();
	}, millis);
};

FloorMap.prototype.isSatisfied = function() {
	for (var row = 0; row < this.height; row++) {
		for (var col = 0; col < this.width; col++) {
			if (this.tiles[row][col].state === TileState.CLEAN) {
				return false;
			}
		}
	}
	return true;
};

FloorMap.prototype.getStartingPosition = function() {
	var left = this.startPos[1] * TILE_SIZE + this.left;
	var top = this.startPos[0] * TILE_SIZE + this.top;
	return {
		"left": left,
		"top": top,
	}
}

FloorMap.prototype.getFinishingPosition = function() {
	var left = this.finishPos[1] * TILE_SIZE + this.left;
	var top = this.finishPos[0] * TILE_SIZE + this.top;
	return {
		"left": left,
		"top": top,
	}
}

FloorMap.prototype.willStepOn = function(left, top, width, height) {
	for (var i = 0; i < this.height; ++i) {
		for (var j = 0; j < this.width; ++j) {
			var tileTop = i * TILE_SIZE + this.top + 8;
			var tileLeft = j * TILE_SIZE + this.left + 8;
			var isContained = true;
			if(tileTop <= top) {
				if(tileTop + TILE_SIZE - 16 < top) isContained = false;
			} else {
				if(top + height < tileTop) isContained = false;
			}
			if(tileLeft <= left) {
				if(tileLeft + TILE_SIZE - 16 < left) isContained = false;
			} else {
				if(left + width < tileLeft) isContained = false;
			}
			if(isContained) {
				if (this.tiles[i][j].isBrokenOrBlocked()) return false;
				else {
					this.tiles[i][j].stepIn();
				}
			}
		}
	}
	return true;
}