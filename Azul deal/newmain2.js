// Responsive scaling
function rescale() {
  const scaler = document.getElementById('scaler');
  if (!scaler) return;
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const scaleX = screenW / 1920;
  const scaleY = screenH / 1080;
  const scale = Math.min(scaleX, scaleY);
  scaler.style.transform = `scale(${scale})`;
}
window.addEventListener('resize', rescale);
window.addEventListener('load', rescale);

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

    // DOM element references
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

    // Defensive: check for required elements
    if (!this.game || !this.onebox || !this.dealButton || !this.excessArea || this.tickboxes.length < 2 || this.playerNames.length < 2) {
      console.error('Missing required DOM elements for game initialization.');
      return;
    }

    this.setup();
    // Event delegation for excess tile clicks
    this.game.addEventListener('click', (event) => {
      const tile = event.target.closest('.tile[data-excess="true"]');
      if (!tile || !this.game.contains(tile)) return;
      event.stopPropagation(); // Prevent disk handler from running
      const color = tile.dataset.color;
      const tiles = [...document.querySelectorAll('.tile[data-excess="true"]')];
      const toDrop = tiles.filter(t => t.dataset.color === color);
      const ticked = this.getTickedPlayerIndexes();
      const playerId = ticked[this.currentPlayerIndex];
      if (playerId === undefined) return;
      // Robust one tile claim logic
      if (!this.oneTileClaimed) {
        this.oneTileClaimed = true;
        this.oneTileHolder = playerId;
        console.log('[OneTile] Claimed by player', playerId, this.playerNames[playerId]?.value || this.playerNames[playerId]?.placeholder);
        this.moveOneboxToPlayer(playerId);
      }
      toDrop.forEach(t => {
        t.style.transition = 'top 0.8s ease, opacity 0.8s ease';
        t.style.top = '1200px';
        t.style.opacity = '0';
      });
      setTimeout(() => {
        toDrop.forEach(t => t.remove());
        setTimeout(() => {
          this.relayoutExcess();
          this.advanceToNextPlayer();
        }, 650); // match relayoutExcess transition (0.6s)
      }, 900);
    });
  }

  setup() {
    this.initTickboxes();
    this.updateBackgroundAndDisks();
    this.highlightCurrentPlayer();

    this.tickboxes.forEach((tb, i) => {
      tb.addEventListener('click', () => this.toggleTickbox(i));
      tb.onerror = () => { tb.src = 'untick.png'; } // fallback for missing image
    });

    // Remove inline event handlers from HTML, handle here
    this.dealButton.addEventListener('mousedown', () => { this.dealButton.src = 'dealdown.png'; });
    this.dealButton.addEventListener('mouseup', () => { this.dealButton.src = 'dealup.png'; });
    this.dealButton.addEventListener('mouseleave', () => { this.dealButton.src = 'dealup.png'; });
    this.dealButton.addEventListener('click', () => this.startGame());

    // Fallback for onebox image
    if (this.onebox.tagName === 'IMG') {
      this.onebox.onerror = () => { this.onebox.src = ''; };
    }
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

    // Preload backgrounds
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
    const field = this.playerNames[index];
    if (!field) {
      console.warn('[OneTile] moveOneboxToPlayer: No field for index', index);
      return;
    }
    // Place the onebox to the left of the namefield, vertically centered
    const top = field.offsetTop + field.offsetHeight / 2 - 55;
    const left = field.offsetLeft - 120;
    console.log('[OneTile] Moving onebox to player', index, 'top:', top, 'left:', left, field);
    this.onebox.style.transition = 'all 0.7s ease';
    this.onebox.style.left = `${left}px`;
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
    }
    // Do not reset onebox position here!
    this.highlightCurrentPlayer();
  }

  startGame() {
    document.querySelectorAll('.tile').forEach(tile => tile.remove());
    // Set current player to oneTileHolder if exists, else 0
    const ticked = this.getTickedPlayerIndexes();
    if (this.oneTileHolder !== null && ticked.includes(this.oneTileHolder)) {
      this.currentPlayerIndex = ticked.indexOf(this.oneTileHolder);
    } else {
      this.currentPlayerIndex = 0;
    }
    // Only reset onebox at the start of a new round
    this.resetOneboxPosition();
    // Highlight the correct player before clearing oneTileHolder
    this.highlightCurrentPlayer();
    // Now clear for the new round
    this.oneTileHolder = null;
    this.oneTileClaimed = false;

    const visibleDiskIndexes = this.disksVisibleMap[this.getTickedPlayerIndexes().length] || [];
    const queue = [];

    visibleDiskIndexes.forEach(diskIndex => {
      const disk = document.getElementById(`disk${diskIndex}`);
      if (!disk) return;

      const diskLeft = disk.offsetLeft;
      const diskTop = disk.offsetTop;

      this.tilePositions.forEach(pos => {
        const color = this.COLORS[Math.floor(Math.random() * this.COLORS.length)];
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.style.backgroundImage = `url('${this.IMAGES[color]}')`;
        tile.dataset.color = color;
        tile.dataset.diskIndex = diskIndex;
        tile.dataset.excess = 'false';
        tile.style.left = `${this.game.clientWidth / 2 - 55}px`;
        tile.style.top = '-150px';
        tile.style.opacity = '0';
        // Fallback for missing tile image
        tile.onerror = () => { tile.style.backgroundImage = 'none'; };
        this.game.appendChild(tile);

        const finalLeft = diskLeft + pos.left;
        const finalTop = diskTop + pos.top;

        queue.push(() => {
          tile.style.transition = 'all 0.6s ease';
          tile.style.left = `${finalLeft}px`;
          tile.style.top = `${finalTop}px`;
          tile.style.opacity = '1';
          tile.style.transform = `rotate(${Math.floor(Math.random() * 30 - 15)}deg)`;
        });
      });
    });

    // Process queue in intervals to avoid batch overlap
    queue.forEach((fn, i) => {
      setTimeout(fn, 300 + i * 100);
    });

    setTimeout(() => this.addTileListeners(), 300 + queue.length * 100 + 400);
    // Do not call resetTurn here, as it would reset the highlight
  }

  addTileListeners() {
    document.querySelectorAll('.tile').forEach(tile => {
      tile.onclick = () => {
        // Only handle disk tiles, not excess tiles
        if (tile.dataset.excess === "true") return;
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
          // Advance to next player after disk claim
          this.advanceToNextPlayer();
        }, group.length * 100 + 900);
      };
    });

    this.addExcessListeners();
  }

  addToExcess(tiles) {
    tiles.forEach(tile => {
      // Do not reset left/top, just mark as excess and let relayoutExcess handle positioning
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
    // No-op: handled by event delegation in setup()
  }
}

// 🎮 Launch Game
(() => {
  window.gameManager = new GameManager();
})();
