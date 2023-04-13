# jQuery Memory Game Plugin

A simple jQuery plugin to create a matching/memory game.

[Demo](https://jchamill.com/projects/jquery-memory)

## Usage

### HTML

```
<div id="game">
  <div class="memory-tile"><img src="https://picsum.photos/id/10/125/175"></div>
  <div class="memory-tile"><img src="https://picsum.photos/id/1001/125/175"></div>
  <div class="memory-tile"><img src="https://picsum.photos/id/1006/125/175"></div>
  <div class="memory-tile"><img src="https://picsum.photos/id/1015/125/175"></div>
  <div class="memory-tile"><img src="https://picsum.photos/id/102/125/175"></div>
  <div class="memory-tile"><img src="https://picsum.photos/id/1023/125/175"></div>
  <div class="memory-tile"><img src="https://picsum.photos/id/1011/125/175"></div>
  <div class="memory-tile"><img src="https://picsum.photos/id/1065/125/175"></div>
  <div class="memory-tile"><img src="https://picsum.photos/id/1083/125/175"></div>
  <div class="memory-tile"><img src="https://picsum.photos/id/195/125/175"></div>
</div>
```
Wrap each tile in a wrapper with the class memory-tile. The plugin will automatically
create the duplicate tile needed to match and shuffle the order. If you wish to
specify your own pairs, in the case of two different pieces of content that should
be considered a pair, just put both items next to each other and set the option
createDuplicates to false. See demos diretory for examples.

### Javascript

Simple

```javascript
$('#game').memoryGame();
```

All Options

```javascript
$('#game').memoryGame({
  createDuplicates: true,
  showScore: true,
  showRestart: true,
  tileClickedCallback: function(data) {
    console.log(data.guesses);
    // Read custom data attributes set on the tile.
    console.log(data.tile._data.name);
  },
  mismatchedCallback: function(data) {
    console.log(data);
  },
  matchedCallback: function(data) {
    console.log(data.tile1._data.name);
  },
  gameOverCallback: function(data) {
    console.log(data.guesses);
  },
  restartCallback: function() {
    console.log('restarted');
  }
});
```

Don't forget to include jQuery.
