let oneTileClaimed = false;
let oneTileHolder = null;
let currentPlayerIndex = 0;
let onebox;

// **************** MAIN LOAD ****************
document.addEventListener("DOMContentLoaded", () => {
  // **************** SETUP TICKBOXES **************
  const tickboxes = [
    document.getElementById("tick1"),
    document.getElementById("tick2"),
    document.getElementById("tick3"),
    document.getElementById("tick4")
  ];

  onebox = document.getElementById("onebox");

  function resetOneboxPosition() {
    onebox.style.position = "absolute";
    onebox.style.width = "110px";
    onebox.style.height = "110px";
    onebox.style.opacity = "1";
    onebox.style.zIndex = "2000";
    onebox.style.transition = "left 0.6s ease, top 0.6s ease, transform 0.3s ease";
    onebox.style.left = "1133px";
    onebox.style.top = "430px";
    onebox.style.transform = "rotate(0deg) scale(1)";
  }

  resetOneboxPosition();

  // **************** UPDATE BACKGROUND **************
  const backgroundMap = {
    2: "background5.jpg",
    3: "background7.jpg",
    4: "background9.jpg"
  };

  for (let i = 0; i < 2; i++) {
    tickboxes[i].dataset.checked = "true";
    tickboxes[i].src = "tick.png";
  }

  updateBackgroundAndDisks();

  tickboxes.forEach((tickbox, index) => {
    tickbox.addEventListener("click", () => {
      const isChecked = tickbox.dataset.checked === "true";
      if (!isChecked) {
        for (let i = 0; i <= index; i++) {
          tickboxes[i].dataset.checked = "true";
          tickboxes[i].src = "tick.png";
        }
      } else {
        for (let i = index + 1; i < tickboxes.length; i++) {
          if (tickboxes[i].dataset.checked === "true") return;
        }
        for (let i = index; i < tickboxes.length; i++) {
          tickboxes[i].dataset.checked = "false";
          tickboxes[i].src = "untick.png";
        }
      }
      updateBackgroundAndDisks();
    });
  });

  function updateBackgroundAndDisks() {
    const checkedCount = tickboxes.filter(t => t.dataset.checked === "true").length;
    const bg = backgroundMap[checkedCount] || "background5.jpg";
    document.getElementById("game").style.backgroundImage = `url('${bg}')`;

    const disksToShow = {
      2: [1, 3, 5, 7, 9],
      3: [1, 3, 4, 5, 6, 7, 9],
      4: [1, 2, 3, 4, 5, 6, 7, 8, 9]
    }[checkedCount] || [1, 3, 5, 7, 9];

    for (let i = 1; i <= 9; i++) {
      const disk = document.getElementById(`disk${i}`);
      disk.style.visibility = disksToShow.includes(i) ? "visible" : "hidden";
    }
  }

  // **************** DEAL BUTTON ****************
  const dealButton = document.getElementById("deal-button");
  if (dealButton) {
    dealButton.addEventListener("click", () => {
      if (typeof startGame === "function") startGame();
    });
  }

  function getTickedPlayerIndexes() {
    return tickboxes
      .map((box, i) => ({ checked: box.dataset.checked === "true", index: i }))
      .filter(p => p.checked)
      .map(p => p.index);
  }

  function highlightCurrentPlayer() {
    for (let i = 0; i < 4; i++) {
      document.getElementById(`name${i + 1}`).classList.remove("current-player");
    }
    const ticked = getTickedPlayerIndexes();
    const index = ticked[currentPlayerIndex];
    if (index !== undefined) {
      document.getElementById(`name${index + 1}`).classList.add("current-player");
    }
  }

  function assignOneTileAndAdvance() {
    const ticked = getTickedPlayerIndexes();
    const current = ticked[currentPlayerIndex];
    const nextIndex = (currentPlayerIndex + 1) % ticked.length;
    const receiver = ticked[nextIndex];

    const topAlign = document.getElementById(`name${receiver + 1}`).offsetTop;
    onebox.style.left = "1753px";
    onebox.style.top = `${topAlign}px`;
    onebox.style.transform = "rotate(-10deg) scale(1.1)";

    setTimeout(() => {
      onebox.style.transform = "rotate(-10deg) scale(1)";
    }, 700);

    oneTileClaimed = true;
    oneTileHolder = receiver;
    currentPlayerIndex = nextIndex;
    highlightCurrentPlayer();
  }

  function advanceToNextPlayer() {
    const ticked = getTickedPlayerIndexes();
    if (ticked.length === 0) return;
    currentPlayerIndex = (currentPlayerIndex + 1) % ticked.length;
    highlightCurrentPlayer();
  }

  // **************** GAME START / DEAL ****************
  window.startGame = function () {
    const COLORS = ['aqua', 'red', 'black', 'blue', 'orange'];
    const IMAGES = {
      aqua: 'aquatile.png',
      red: 'redtile.png',
      black: 'blacktile.png',
      blue: 'bluetile.png',
      orange: 'orangetile.png'
    };

    document.querySelectorAll('.tile').forEach(t => t.remove());
    resetOneboxPosition();

    const visibleDisks = Array.from({ length: 9 }, (_, i) => {
      const el = document.getElementById(`disk${i + 1}`);
      return el.style.visibility === "visible" ? el : null;
    }).filter(Boolean);

    visibleDisks.forEach((disk, diskIndex) => {
      const positions = [
        { left: 40, top: 40 },
        { left: 143, top: 40 },
        { left: 40, top: 143 },
        { left: 143, top: 143 }
      ];

      for (let i = 0; i < 4; i++) {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.style.backgroundImage = `url('${IMAGES[color]}')`;
        tile.dataset.color = color;
        tile.dataset.diskIndex = diskIndex;
        tile.dataset.excess = "false";

        const finalLeft = disk.offsetLeft + positions[i].left;
        const finalTop = disk.offsetTop + positions[i].top;

        tile.style.left = (1920 / 2 - 55) + 'px';
        tile.style.top = '-150px';
        tile.style.opacity = '0';

        document.getElementById("game").appendChild(tile);

        setTimeout(() => {
          tile.style.transition = 'left 0.6s ease, top 0.6s ease, opacity 0.6s';
          tile.style.left = finalLeft + 'px';
          tile.style.top = finalTop + 'px';
          tile.style.opacity = '1';
          tile.style.transform = `rotate(${Math.floor(Math.random() * 30 - 15)}deg)`;
        }, 300 + (diskIndex * 4 + i) * 100);

tile.addEventListener("click", () => {
  if (!tickboxes[currentPlayerIndex].checked) return;

  const tileColor = tile.dataset.color;
  const matchingTiles = Array.from(document.querySelectorAll(`.tile[data-disk-index="${diskIndex}"][data-color="${tileColor}"]`));

  matchingTiles.forEach((t, i) => {
    setTimeout(() => {
      t.classList.add("animate");
      setTimeout(() => {
        t.remove();
      }, 800);
    }, i * 100);
  });

setTimeout(() => {
  const leftovers = Array.from(document.querySelectorAll('.tile')).filter(
    t => t.dataset.diskIndex == diskIndex
  );
  addToExcess(leftovers);

  const ticked = getTickedPlayerIndexes();
  const playerId = ticked[currentPlayerIndex];

  if (!oneTileClaimed) {
    const topAlign = document.getElementById(`name${playerId + 1}`).offsetTop;
    onebox.style.left = "1753px";
    onebox.style.top = `${topAlign}px`;
    onebox.style.transform = "rotate(-10deg) scale(1.1)";
    setTimeout(() => {
      onebox.style.transform = "rotate(-10deg) scale(1)";
    }, 700);
    oneTileClaimed = true;
    oneTileHolder = playerId;
  }

  currentPlayerIndex = (currentPlayerIndex + 1) % ticked.length;
  highlightCurrentPlayer();
}, matchingTiles.length * 100 + 900);

});   

const ticked = getTickedPlayerIndexes();
if (oneTileHolder !== null && ticked.includes(oneTileHolder)) {
  currentPlayerIndex = ticked.indexOf(oneTileHolder);
} else {
  currentPlayerIndex = 0;
}

    highlightCurrentPlayer();
    oneTileClaimed = false;
  };

  // **************** ADD TO EXCESS ****************
  function addToExcess(newTiles) {
    const grid = document.getElementById("excess-area");
    const game = document.getElementById("game");
    const maxPerRow = 7;

    newTiles.forEach(tile => {
      const rect = tile.getBoundingClientRect();
      const gameRect = game.getBoundingClientRect();
      tile.style.position = 'absolute';
      tile.style.left = `${rect.left - gameRect.left}px`;
      tile.style.top = `${rect.top - gameRect.top}px`;
      tile.dataset.diskIndex = '';
      tile.dataset.excess = "true";
      game.appendChild(tile);
      void tile.offsetWidth;
    });

    const combined = Array.from(game.querySelectorAll('.tile')).filter(t => t.dataset.excess === "true");
    combined.sort((a, b) => a.dataset.color.localeCompare(b.dataset.color));

    combined.forEach((tile, i) => {
      const col = i % maxPerRow;
      const row = Math.floor(i / maxPerRow);
      const left = grid.offsetLeft + col * 110;
      const top = grid.offsetTop + row * 110;

      tile.style.transition = 'left 0.6s ease, top 0.6s ease';
      tile.style.left = `${left}px`;
      tile.style.top = `${top}px`;
    });

    addClickListenerToExcessTiles();
  }

  // **************** CLICK LISTENER FOR EXCESS ****************
function addClickListenerToExcessTiles() {
  const tiles = Array.from(document.querySelectorAll('.tile')).filter(t => t.dataset.excess === "true");

  tiles.forEach(tile => {
    tile.onclick = () => {
      const color = tile.dataset.color;
      const toDrop = tiles.filter(t => t.dataset.color === color);

      const ticked = getTickedPlayerIndexes();
      const playerId = ticked[currentPlayerIndex];
      if (playerId === undefined) return;

      // Instantly animate all matching tiles
      toDrop.forEach(t => {
        t.style.transition = 'top 0.5s ease, opacity 0.5s ease';
        t.style.top = '1200px';
        t.style.opacity = '0';
      });

      // After delay, remove tiles, relayout, assign Onebox, advance turn
      setTimeout(() => {
        toDrop.forEach(t => t.remove());
        relayoutExcess();

        if (!oneTileClaimed) {
          const topAlign = document.getElementById(`name${playerId + 1}`).offsetTop;
          onebox.style.left = "1753px";
          onebox.style.top = `${topAlign}px`;
          onebox.style.transform = "rotate(-10deg) scale(1.1)";
          setTimeout(() => {
            onebox.style.transform = "rotate(-10deg) scale(1)";
          }, 700);
          oneTileClaimed = true;
          oneTileHolder = playerId;
        }

        // Now advance to next ticked player
        const currentIndex = ticked.indexOf(playerId);
        currentPlayerIndex = (currentIndex + 1) % ticked.length;
        highlightCurrentPlayer();
      }, 700);
    };
  });
}


  // **************** RELAYOUT EXCESS ****************
  function relayoutExcess() {
    const grid = document.getElementById("excess-area");
    const tiles = Array.from(document.querySelectorAll('.tile')).filter(t => t.dataset.excess === "true");
    tiles.sort((a, b) => a.dataset.color.localeCompare(b.dataset.color));
    const maxPerRow = 7;

    tiles.forEach((tile, i) => {
      const col = i % maxPerRow;
      const row = Math.floor(i / maxPerRow);
      const left = grid.offsetLeft + col * 110;
      const top = grid.offsetTop + row * 110;
      tile.style.transition = 'left 0.4s ease, top 0.4s ease';
      tile.style.left = `${left}px`;
      tile.style.top = `${top}px`;
    });
  }
});




