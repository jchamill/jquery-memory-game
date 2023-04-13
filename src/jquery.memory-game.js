;(function(factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof exports !== 'undefined') {
    module.exports = factory(require('jquery'));
  } else {
    factory(jQuery);
  }
}(function($) {
  'use strict';

  $.memoryGame = function(el, options) {
    var base = this;

    // Access to jQuery version of element
    base.$el = $(el);

    // Add a reverse reference to the DOM object
    base.$el.data('memoryGame', base);

    base.options = $.extend({
      tileClass: 'memory-tile',
      flipTimeout: 2000,
      maxTiles: 1000,
      showScore: true,
      showRestart: true,
      createDuplicates: true
    }, options);

    base.Game = {
      _state: 'not_ready',
      _originalTiles: [], // These are the non duplicated tiles. Necessary for the maxTiles functionality.
      _originalTilesMatches: [], // These are the user provided match tiles when createDuplicates is false.
      _tiles: [],
      _numTiles: 0,
      _tile1idx: undefined,
      _tile2idx: undefined,
      _matches: 0,
      _guesses: 0,
      setTiles: function(tiles, tilesMatches) {
        this._originalTiles = tiles;
        this._originalTilesMatches = tilesMatches;
        this.loadTiles();
        this.shuffleTiles();
      },
      shuffleTiles: function() {
        this._shuffle(this._tiles);
      },
      shuffleOriginalTiles: function() {
        this._shuffle(this._originalTiles, this._originalTilesMatches);
      },
      _shuffle: function(arr, arr2) {
        for (var i = arr.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = arr[i];
          arr[i] = arr[j];
          arr[j] = temp;
          if (arr2 && arr2.length > 0) {
            var temp = arr2[i];
            arr2[i] = arr2[j];
            arr2[j] = temp;
          }
        }
      },
      openTile: function(index) {
        if (this._state !== 'locked') {
          if (!this._tiles[index]._opened) {
            this._tiles[index].turnOver();
            base.$el.find('.game-tile-' + index)
              .removeClass('game-tile-closed')
              .addClass('game-tile-open')
              .html(this._tiles[index]._html);
            if (this._state === 'one_open') {
              this._tile2idx = index;
              var game = this;
              this._state = 'locked';
              if (this.isMatch()) {
                setTimeout(function() {
                  game.setMatched();
                }, 500);
              } else {
                setTimeout(function() {
                  game.turnOverTiles();
                }, base.options.flipTimeout);
              }
              this._guesses++;
              base.$el.find('.game-score span').text(this._guesses);
            } else {
              this._tile1idx = index;
              this._state = 'one_open';
            }
            if (typeof base.options.tileClickedCallback === 'function') {
              base.options.tileClickedCallback({
                state: this._state,
                index: index,
                tile: this._tiles[index],
                guesses: this._guesses
              });
            }
          }
        }
        
      },
      isMatch: function() {
        return this._tiles[this._tile1idx]._value === this._tiles[this._tile2idx]._value;
      },
      turnOverTiles: function() {
        this._tiles[this._tile1idx]._opened = 0;
        base.$el.find('.game-tile-' + this._tile1idx)
          .removeClass('game-tile-open')
          .addClass('game-tile-closed')
          .addClass('game-tile-viewed')
          .html('');
        this._tiles[this._tile2idx]._opened = 0;
        base.$el.find('.game-tile-' + this._tile2idx)
          .removeClass('game-tile-open')
          .addClass('game-tile-closed')
          .addClass('game-tile-viewed')
          .html('');
        this._state = 'ready';

        if (typeof base.options.mismatchedCallback === 'function') {
          base.options.mismatchedCallback({
            tile1: this._tiles[this._tile1idx],
            tile2: this._tiles[this._tile2idx],
            guesses: this._guesses
          });
        }

        this._tile1idx = undefined;
        this._tile2idx = undefined;
      },
      setMatched: function() {
        this._tiles[this._tile1idx]._matched = 1;
        base.$el.find('.game-tile-' + this._tile1idx)
          .addClass('game-tile-matched');
        this._tiles[this._tile2idx]._matched = 1;
        base.$el.find('.game-tile-' + this._tile2idx)
          .addClass('game-tile-matched');
        this._matches++;

        if (typeof base.options.matchedCallback === 'function') {
          base.options.matchedCallback({
            tile1: this._tiles[this._tile1idx],
            tile2: this._tiles[this._tile2idx],
            matches: this._matches,
            guesses: this._guesses
          });
        }

        this._tile1idx = undefined;
        this._tile2idx = undefined;

        if (this.isGameOver()) {
          this._state = 'complete';
          base.$el.addClass('game-complete');

          if (typeof base.options.gameOverCallback === 'function') {
            base.options.gameOverCallback({
              matches: this._matches,
              guesses: this._guesses
            });
          }
        } else {
          this._state = 'ready';
        }
      },
      isGameOver: function() {
        return this._matches >= (this._numTiles / 2);
      },
      loadTiles: function() {
        this.shuffleOriginalTiles();
        var halfTiles = Math.round(base.options.maxTiles / 2);
        var maxTiles = (halfTiles < this._originalTiles.length) ? halfTiles : this._originalTiles.length;
        this._tiles = [];
        for (var i = 0; i < maxTiles; i++) {
          this._tiles.push($.extend(true, {}, this._originalTiles[i]));
          if (base.options.createDuplicates) {
            this._tiles.push($.extend(true, {}, this._originalTiles[i]));
          } else {
            this._tiles.push($.extend(true, {}, this._originalTilesMatches[i]));
          }
        }
        this._numTiles = this._tiles.length;
      },
      restart: function() {
        base.$el.removeClass('game-complete');
        this._state = 'ready';
        this._guesses = 0;
        this._matches = 0;
        this._tile1idx = undefined;
        this._tile2idx = undefined;
        this.loadTiles();
        this.shuffleTiles();
        this.updateDisplay();

        if (typeof base.options.restartCallback === 'function') {
          base.options.restartCallback();
        }
      },
      updateDisplay: function() {
        var html = '';
        for (var i = 0; i < this._numTiles; i++) {
          this._tiles[i].setIndex(i);
          html += this._tiles[i].getHtml();
        }
        base.$el.find('.game-tiles').html(html);
        base.$el.find('.game-score span').text(this._guesses);
      },
      display: function() {
        // Find the first memory tile and turn it into the tiles wrapper.
        base.$el
          .addClass('memory-game')
          .find('.' + base.options.tileClass)
          .first()
          .removeClass(base.options.tileClass)
          .addClass('game-tiles')
          .empty();
        
        // Remove initial memory tiles that are not nested yet.
        base.$el.find('.' + base.options.tileClass).remove();

        var html = '';
        if (base.options.showScore || base.options.showRestart) {
          html += '<div class="game-status">';
          if (base.options.showScore) {
            html += '<div class="game-score">Score: <span>0</span></div>';
          }
          if (base.options.showRestart) {
            html += '<div class="game-restart">Restart</div>';
          }
          html += '</div>';
        }
        base.$el.append(html);
        
        this.updateDisplay();
      }
    };

    base.Tile = {
      _index: undefined,
      _value: undefined,
      _data: {},
      _html: '',
      _opened: false,
      _matched: false,
      _viewed: false,
      getValue: function() {
        return this._value;
      },
      setValue: function(value) {
        this._value = value;
      },
      setIndex: function(index) {
        this._index = index;
      },
      setData: function(data) {
        this._data = data;
      },
      setHtml: function(html) {
        this._html = html;
      },
      getHtml: function() {
        return '<div class="game-tile-' + this._index + ' game-tile game-tile-closed"></div>';
      },
      turnOver: function() {
        this._opened = !this._opened;
        this._viewed = true;
      },
      matched: function() {
        this._matched = true;
      },
      isOpened: function() {
        return this._opened;
      },
      isMatched: function() {
        return this._matched;
      },
      isViewed: function() {
        return this._viewed;
      },
      reset: function() {
        this._opened = false;
        this._matched = false;
        this._viewed = false;
      }
    };

    base.methods = {
      init: function() {
        base.methods.setup();

        base.$el.off();

        base.$el.on('click', '.game-tile', function(e) {
          e.preventDefault();
          var index = base.$el.find('.game-tiles').children().index(this);
          base.methods.tileClicked(index);
        });

        base.$el.on('click', '.game-restart', function(e) {
          e.preventDefault();
          base.Game.restart();
        });
      },
      setup: function() {
        base.methods._loadTiles();
        base.Game.display();
        // base.methods._debugTiles();
      },
      tileClicked: function(index) {
        base.Game.openTile(index);
      },
      _loadTiles: function() {
        var tiles = [];
        var tilesMatches = [];
        var increment = base.options.createDuplicates ? 1 : 2;
        var $tileEls = base.$el.find('.' + base.options.tileClass);
        for (var i = 0; i < $tileEls.length; i = i + increment) {
          // If we aren't creating duplicates, make sure the last item has a match.
          if (!base.options.createDuplicates && (i + 1) >= $tileEls.length) {
            console.warn('Incorrect number of tiles for game, must be an even number.');
            break;
          }

          var $tile = $tileEls.eq(i);
          var tempTile = base.methods._createTile($tile, i);
          tiles.push(tempTile);

          if (!base.options.createDuplicates) {
            var $tile = $tileEls.eq(i + 1);
            // Create the matching tile using the next tile, using the same value so they will match.
            var tempTile = base.methods._createTile($tile, i);
            tilesMatches.push(tempTile);
          }
        }
        base.Game.setTiles(tiles, tilesMatches);
      },
      _createTile: function($tile, value) {
        var tile = Object.create(base.Tile);
        tile.setValue(value);
        tile.setData($tile.data());
        tile.setHtml($tile[0].outerHTML);
        return tile;
      },
      _debugTiles: function() {
        for (var i = 0; i < base.Game._tiles.length; i++) {
          console.log(base.Game._tiles[i]._value);
        }
      }
    };

    base.methods.init();

    $.fn.memoryGame.restart = function() {
      base.Game.restart();
    }
  };

  $.fn.memoryGame = function(options) {
    return this.each(function() {
      var game = new $.memoryGame(this, options);
      return game;
    });
  };
}));