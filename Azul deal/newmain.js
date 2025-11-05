<script>
class GameManager {
  constructor() {
    this.oneTileClaimed = false;
    this.oneTileHolder = null;
    this.currentPlayerIndex = 0;
    this.COLORS = ['aqua', 'red', 'black', 'blue', 'orange'];
    this.IMAGES = {
      aqua: 'aquatile.png',
      red: 'redtile.png',
      black: 'blacktile.png',
      blue: 'bluetile.png',
      orange: 'orangetile.png'
    };
    this.tilePositions = [
      { left: 40, top: 40 },
      { left: 143, top: 40 },
      { left: 40, top: 143 },
      { left: 143, top: 143 }
    ];
    this.backgroundMap = {
      2: 'background5.jpg',
      3: 'background7.jpg',
      4: 'background9.jpg'
    };
    this.disksVisibleMap = {
      2: [1, 3, 5, 7, 9],
      3: [1, 3, 4, 5, 6, 7, 9],
      4: [1, 2, 3, 4, 5, 6, 7, 8, 9]
    };

    this.game = document.getElementById('game');
    this.onebox = document.getElementById('onebox');
    this.dealButton = document.getElementById('deal-button');
    this.excessArea = document.getElementById('excess-area');
    this.tickboxes = [
      ...document.querySelectorAll('.tickbox')
    ];
    this.playerNames = [
      ...document.querySelectorAll('.namefield')
    ];

    this.setup();
  }
window.addEventListener('DOMContentLoaded', () => {
  new GameManager();
});
  setup() {
    this.initTickboxes();
    this.updateBackgroundAndDisks();
    this.highlightCurrentPlayer();

    this.tickboxes.forEach((tb, i) => {
      tb.addEventListener('click', () => this.toggleTickbox(i));
    });

    this.dealButton.addEventListener('click', () => this.startGame());
  }

  getTickedPlayerIndexes() {
    return this.tickboxes
      .map((tb, i) => tb.dataset.checked === "true" ? i : null)
      .filter(i => i !== null);
  }

  initTickboxes() {
    this.tickboxes.forEach((tb, i) => {
      tb.dataset.checked = i < 2 ? "true" : "false";
      tb.src = i < 2 ? 'tick.png' : 'untick.png';
    });
  }

  toggleTickbox(index) {
    const tb = this.tickboxes[index];
    const isChecked = tb.dataset.checked === "true";

    if (!isChecked) {
      for (let i = 0; i <= index; i++) {
        this.tickboxes[i].dataset.checked = "true";
        this.tickboxes[i].src = "tick.png";
      }
    } else {
      for (let i = index + 1; i < this.tickboxes.length; i++) {
        if (this.tickboxes[i].dataset.checked === "true") return;
      }
      for (let i = index; i < this.tickboxes.length; i++) {
        this.tickboxes[i].dataset.checked = "false";
        this.tickboxes[i].src = "untick.png";
      }
    }

    this.updateBackgroundAndDisks();
    this.resetOneboxPosition();
    this.resetTurn();
  }

  updateBackgroundAndDisks() {
    const count = this.getTickedPlayerIndexes().length;
    const bg = this.backgroundMap[count] || this.backgroundMap[2];
    this.game.style.backgroundImage = `url('${bg}')`;

    Object.values(this.backgroundMap).forEach(src => {
      const preload = new Image();
      preload.src = src;
    });

    const visible = this.disksVisibleMap[count] || this.disksVisibleMap[2];
    for (let i = 1; i <= 9; i++) {
      const disk = document.getElementById(`disk${i}`);
      if (!disk) continue;
      disk.style.visibility = visible.includes(i) ? 'visible' : 'hidden';
    }
  }

  resetOneboxPosition() {
    this.onebox.style.transition = 'all 0.7s ease';
    this.onebox.style.left = "1133px";
    this.onebox.style.top = "430px";
    this.onebox.style.transform = "rotate(0deg) scale(1)";
    this.oneTileClaimed = false;
    this.oneTileHolder = null;
    void this.onebox.offsetWidth;
  }

  getPlayerTopPosition(index) {
    const field = this.playerNames[index];
    return field.offsetTop + field.offsetHeight / 2 - 55;
  }

  moveOneboxToPlayer(index) {
    const top = this.getPlayerTopPosition(index);
    this.onebox.style.transition = 'all 0.7s ease';
    this.onebox.style.left = "1753px";
    this.onebox.style.top = `${top}px`;
    this.onebox.style.transform = "rotate(-10deg) scale(1.1)";
    setTimeout(() => {
      this.onebox.style.transition = 'transform 0.3s ease';
      this.onebox.style.transform = "rotate(-10deg) scale(1)";
    }, 700);
  }

  highlightCurrentPlayer() {
    this.playerNames.forEach(p => p.classList.remove('current-player'));
    const ticked = this.getTickedPlayerIndexes();
    const current = ticked[this.currentPlayerIndex];
    if (current !== undefined) {
      this.playerNames[current].classList.add('current-player');
    }
  }

  advanceToNextPlayer() {
    const ticked = this.getTickedPlayerIndexes();
    if (ticked.length === 0) return;
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % ticked.length;
    this.highlightCurrentPlayer();
  }

  resetTurn() {
    const ticked = this.getTickedPlayerIndexes();
    if (this.oneTileHolder !== null && ticked.includes(this.oneTileHolder)) {
      this.currentPlayerIndex = ticked.indexOf(this.oneTileHolder);
    } else {
      this.currentPlayerIndex = 0;
      this.oneTileHolder = null;
      this.oneTileClaimed = false;
    }
    this.highlightCurrentPlayer();
  }

  startGame() {
    document.querySelectorAll('.tile').forEach(t => t.remove());
    this.resetOneboxPosition();

    const visibleDisks = [];
    for (let i = 1; i <= 9; i++) {
      const disk = document.getElementById(`disk${i}`);
      if (disk && disk.style.visibility === 'visible') visibleDisks.push(disk);
    }

    visibleDisks.forEach((disk, dIndex) => {
      this.tilePositions.forEach((pos, tIndex) => {
        const color = this.COLORS[Math.floor(Math.random() * this.COLORS.length)];
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.style.backgroundImage = `url('${this.IMAGES[color]}')`;
        tile.dataset.color = color;
        tile.dataset.diskIndex = dIndex;
        tile.dataset.excess = "false";
        tile.style.left = `${this.game.clientWidth / 2 - 55}px`;
        tile.style.top = `-150px`;
        tile.style.opacity = "0";
        this.game.appendChild(tile);

        const finalLeft = disk.offsetLeft + pos.left;
        const finalTop = disk.offsetTop + pos.top;

        setTimeout(() => {
          tile.style.transition = 'all 0.6s ease';
          tile.style.left = `${finalLeft}px`;
          tile.style.top = `${finalTop}px`;
          tile.style.opacity = "1";
          tile.style.transform = `rotate(${Math.floor(Math.random() * 30 - 15)}deg)`;
        }, 300 + (dIndex * 4 + tIndex) * 100);
      });
    });

    setTimeout(() => this.addTileListeners(), 1500);
    this.resetTurn();
  }

  addTileListeners() {
    document.querySelectorAll('.tile').forEach(tile => {
      tile.onclick = () => {
        const diskIndex = tile.dataset.diskIndex;
        const color = tile.dataset.color;

        const group = [...document.querySelectorAll(`.tile[data-disk-index="${diskIndex}"][data-color="${color}"]`)];

        group.forEach((t, i) => {
          setTimeout(() => {
            t.style.transition = 'top 0.6s ease, opacity 0.6s ease';
            t.style.top = '1200px';
            t.style.opacity = '0';
                        setTimeout(() => t.remove(), 700);
          }, i * 100);
        });

        setTimeout(() => {
          const leftovers = [...document.querySelectorAll('.tile')]
            .filter(t => t.dataset.diskIndex === diskIndex);
          this.addToExcess(leftovers);
          this.advanceToNextPlayer();
        }, group.length * 100 + 900);
      };
    });

    this.addExcessListeners();
  }

  addToExcess(tiles) {
    tiles.forEach(tile => {
      const rect = tile.getBoundingClientRect();
      const gameRect = this.game.getBoundingClientRect();
      tile.style.position = 'absolute';
      tile.style.left = `${rect.left - gameRect.left}px`;
      tile.style.top = `${rect.top - gameRect.top}px`;
      tile.dataset.diskIndex = '';
      tile.dataset.excess = "true";
      this.game.appendChild(tile);
      void tile.offsetWidth;
    });

    setTimeout(() => this.relayoutExcess(), 50);
  }

  relayoutExcess() {
    const tiles = [...document.querySelectorAll('.tile')]
      .filter(t => t.dataset.excess === "true");

    tiles.sort((a, b) => a.dataset.color.localeCompare(b.dataset.color));

    const maxPerRow = 7;
    tiles.forEach((tile, i) => {
      const col = i % maxPerRow;
      const row = Math.floor(i / maxPerRow);
      const left = this.excessArea.offsetLeft + col * 110;
      const top = this.excessArea.offsetTop + row * 110;
      tile.style.transition = 'left 0.6s ease, top 0.6s ease';
      tile.style.left = `${left}px`;
      tile.style.top = `${top}px`;
    });
  }

  addExcessListeners() {
    const allTiles = [...document.querySelectorAll('.tile')];
    allTiles.forEach(t => t.replaceWith(t.cloneNode(true)));

    const tiles = [...document.querySelectorAll('.tile')]
      .filter(t => t.dataset.excess === "true");

    tiles.forEach(tile => {
      tile.onclick = () => {
        const color = tile.dataset.color;
        const toDrop = tiles.filter(t => t.dataset.color === color);

        const ticked = this.getTickedPlayerIndexes();
        const playerId = ticked[this.currentPlayerIndex];
        if (playerId === undefined) return;

        if (!this.oneTileClaimed) {
          this.oneTileClaimed = true;
          this.oneTileHolder = playerId;
          this.moveOneboxToPlayer(playerId);
        }

        toDrop.forEach(t => {
          t.style.transition = 'top 0.8s ease, opacity 0.8s ease';
          t.style.top = '1200px';
          t.style.opacity = '0';
        });

        setTimeout(() => {
          toDrop.forEach(t => t.remove());
          this.relayoutExcess();
          this.advanceToNextPlayer();
        }, 900);
      };
    });
  }
}

// 🎮 Launch Game
(() => {
  new GameManager();
})();