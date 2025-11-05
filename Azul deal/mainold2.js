(() => {
  let oneTileClaimed = false;
  let oneTileHolder = null;
  let currentPlayerIndex = 0;
let tilesReady = false;


  const game = document.getElementById('game');
  const onebox = document.getElementById('onebox');
  const tickboxes = [
    document.getElementById('tick1'),
    document.getElementById('tick2'),
    document.getElementById('tick3'),
    document.getElementById('tick4')
  ];
  const playerNames = [
    document.getElementById('name1'),
    document.getElementById('name2'),
    document.getElementById('name3'),
    document.getElementById('name4')
  ];
  const dealButton = document.getElementById('deal-button');
  const excessArea = document.getElementById('excess-area');

  const backgroundMap = {
    2: 'background5.jpg',
    3: 'background7.jpg',
    4: 'background9.jpg'
  };

  const disksVisibleMap = {
    2: [1,3,5,7,9],
    3: [1,3,4,5,6,7,9],
    4: [1,2,3,4,5,6,7,8,9]
  };

  const tilePositions = [
    {left: 40, top: 40},
    {left: 143, top: 40},
    {left: 40, top: 143},
    {left: 143, top: 143}
  ];

  const COLORS = ['aqua', 'red', 'black', 'blue', 'orange'];
  const IMAGES = {
    aqua: 'aquatile.png',
    red: 'redtile.png',
    black: 'blacktile.png',
    blue: 'bluetile.png',
    orange: 'orangetile.png'
  };

  function getPlayerTopPosition(index) {
    return playerNames[index].offsetTop + playerNames[index].offsetHeight/2 - 55;
  }

  function initializeTickboxes() {
    tickboxes.forEach((tb,i) => {
      tb.dataset.checked = (i < 2) ? "true" : "false";
      tb.src = (i < 2) ? 'tick.png' : 'untick.png';
    });
  }

  function getTickedPlayerIndexes() {
    return tickboxes
      .map((tb,i) => tb.dataset.checked === "true" ? i : null)
      .filter(i => i !== null);
  }

  function updateBackgroundAndDisks() {
    const checkedCount = getTickedPlayerIndexes().length;
    const bg = backgroundMap[checkedCount] || backgroundMap[2];
    game.style.backgroundImage = `url('${bg}')`;

    // Preload all backgrounds
    Object.values(backgroundMap).forEach(src => {
      const img = new Image();
      img.src = src;
    });

    const disksToShow = disksVisibleMap[checkedCount] || disksVisibleMap[2];
    for(let i=1; i<=9; i++) {
      const disk = document.getElementById(`disk${i}`);
      if(!disk) continue;
      disk.style.visibility = disksToShow.includes(i) ? 'visible' : 'hidden';
    }
  }

  function toggleTickbox(index) {
    const tb = tickboxes[index];
    const isChecked = tb.dataset.checked === "true";
    if(!isChecked) {
      for(let i=0; i<=index; i++) {
        tickboxes[i].dataset.checked = "true";
        tickboxes[i].src = "tick.png";
      }
    } else {
      for(let i=index+1; i<tickboxes.length; i++) {
        if(tickboxes[i].dataset.checked === "true") return;
      }
      for(let i=index; i<tickboxes.length; i++) {
        tickboxes[i].dataset.checked = "false";
        tickboxes[i].src = "untick.png";
      }
    }
    updateBackgroundAndDisks();
    resetOneboxPosition();
    resetTurn();
  }

function resetOneboxPosition() {
  onebox.style.transition = 'all 0.7s ease';
  onebox.style.left = "1133px";
  onebox.style.top = "430px";
  onebox.style.transform = "rotate(0deg) scale(1)";
  oneTileClaimed = false;
  oneTileHolder = null;
  // Force reflow so transition always fires on repeated deals
  void onebox.offsetWidth;
}

  function highlightCurrentPlayer() {
    playerNames.forEach((el) => el.classList.remove('current-player'));
    const ticked = getTickedPlayerIndexes();
    const current = ticked[currentPlayerIndex];
    if(current !== undefined) {
      playerNames[current].classList.add('current-player');
    }
  }

  function advanceToNextPlayer() {
    const ticked = getTickedPlayerIndexes();
    if(ticked.length === 0) return;
    currentPlayerIndex = (currentPlayerIndex + 1) % ticked.length;
    highlightCurrentPlayer();
  }

  function resetTurn() {
    const ticked = getTickedPlayerIndexes();
    if(oneTileHolder !== null && ticked.includes(oneTileHolder)) {
      currentPlayerIndex = ticked.indexOf(oneTileHolder);
    } else {
      currentPlayerIndex = 0;
      oneTileHolder = null;
      oneTileClaimed = false;
    }
    highlightCurrentPlayer();
  }

function moveOneboxToPlayer(playerIndex) {
  const destTop = getPlayerTopPosition(playerIndex);
  onebox.style.transition = 'all 0.7s ease';
  onebox.style.left = "1753px";
  onebox.style.top = destTop + 'px';
  onebox.style.transform = "rotate(-10deg) scale(1.1)";
  
  // After transition, normalize scale to 1 but keep rotation
  setTimeout(() => {
    onebox.style.transition = 'transform 0.3s ease';
    onebox.style.transform = "rotate(-10deg) scale(1)";
  }, 700);
}

  function startGame() {
    document.querySelectorAll('.tile').forEach(t => t.remove());
    resetOneboxPosition();

    const visibleDisks = [];
    for(let i=1; i<=9; i++) {
      const disk = document.getElementById(`disk${i}`);
      if(disk && disk.style.visibility === 'visible') visibleDisks.push(disk);
    }

    visibleDisks.forEach((disk, diskIndex) => {
      tilePositions.forEach((pos, tileIndex) => {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.style.backgroundImage = `url('${IMAGES[color]}')`;
        tile.dataset.color = color;
        tile.dataset.diskIndex = diskIndex;
        tile.dataset.excess = "false";
        tile.style.left = (game.clientWidth/2 - 55) + 'px';
        tile.style.top = '-150px';
        tile.style.opacity = '0';
        game.appendChild(tile);

        const finalLeft = disk.offsetLeft + pos.left;
        const finalTop = disk.offsetTop + pos.top;

        setTimeout(() => {
          tile.style.transition = 'left 0.6s ease, top 0.6s ease, opacity 0.6s ease, transform 0.6s ease';
          tile.style.left = finalLeft + 'px';
          tile.style.top = finalTop + 'px';
          tile.style.opacity = '1';
          tile.style.transform = `rotate(${Math.floor(Math.random() * 30 - 15)}deg)`;
        }, 300 + (diskIndex*4 + tileIndex)*100);



        // Tile click on disk - NO penalty claim here
        tile.addEventListener('click', () => {
          const ticked = getTickedPlayerIndexes();
          if(ticked.length === 0) return;

          const tileColor = tile.dataset.color;
          const matchingTiles = Array.from(document.querySelectorAll(`.tile[data-disk-index="${diskIndex}"][data-color="${tileColor}"]`));

          matchingTiles.forEach((t, i) => {
            setTimeout(() => {
              t.style.transition = 'top 0.6s ease, opacity 0.6s ease';
              t.style.top = '1200px';
              t.style.opacity = '0';
              setTimeout(() => t.remove(), 700);
            }, i*100);
          });

          setTimeout(() => {
            const leftovers = Array.from(document.querySelectorAll('.tile')).filter(t => t.dataset.diskIndex == diskIndex);
            addToExcess(leftovers);

            advanceToNextPlayer();
          }, matchingTiles.length * 100 + 900);
        });
      });
    });
    resetTurn();

    addClickListenerToDiskTiles();
tilesReady = true;
  }

  function addToExcess(newTiles) {
    newTiles.forEach(tile => {
      const rect = tile.getBoundingClientRect();
      const gameRect = game.getBoundingClientRect();
      tile.style.position = 'absolute';
      tile.style.left = (rect.left - gameRect.left) + 'px';
      tile.style.top = (rect.top - gameRect.top) + 'px';
      tile.dataset.diskIndex = '';
      tile.dataset.excess = "true";
      game.appendChild(tile);
      void tile.offsetWidth;

      setTimeout(() => {
        relayoutExcess();
      }, 50);
    });
    addClickListenerToExcessTiles();
  }

  function relayoutExcess() {
    const tiles = Array.from(document.querySelectorAll('.tile')).filter(t => t.dataset.excess === "true");
    tiles.sort((a,b) => a.dataset.color.localeCompare(b.dataset.color));
    const maxPerRow = 7;
    tiles.forEach((tile,i) => {
      const col = i % maxPerRow;
      const row = Math.floor(i / maxPerRow);
      const left = excessArea.offsetLeft + col * 110;
      const top = excessArea.offsetTop + row * 110;
      tile.style.transition = 'left 0.6s ease, top 0.6s ease';
      tile.style.left = left + 'px';
      tile.style.top = top + 'px';
    });
  }

function addClickListenerToExcessTiles() {
  const allTiles = document.querySelectorAll('.tile');
  allTiles.forEach(t => {
    // Clear any existing click listener
    const newTile = t.cloneNode(true);
    t.replaceWith(newTile);
  });

  const tiles = Array.from(document.querySelectorAll('.tile')).filter(t => t.dataset.excess === "true");

tiles.forEach(tile => {
  tile.onclick = () => {
    if (!tilesReady) return;

    const ticked = getTickedPlayerIndexes();
    if (ticked.length === 0) return;

    const tileColor = tile.dataset.color;
    const diskIndex = tile.dataset.diskIndex;
    const matchingTiles = Array.from(document.querySelectorAll(`.tile[data-disk-index="${diskIndex}"][data-color="${tileColor}"]`));

    matchingTiles.forEach((t, i) => {
      setTimeout(() => {
        t.style.transition = 'top 0.6s ease, opacity 0.6s ease';
        t.style.top = '1200px';
        t.style.opacity = '0';
        setTimeout(() => t.remove(), 700);
      }, i * 100);
    });


    setTimeout(() => {
      const leftovers = Array.from(document.querySelectorAll('.tile')).filter(t => t.dataset.diskIndex == diskIndex);
      addToExcess(leftovers);
      advanceToNextPlayer();

      addClickListenerToDiskTiles(); // 🔄 Reattach after DOM change
    }, matchingTiles.length * 100 + 900);
  };
});
}
  function setupTickboxes() {
    tickboxes.forEach((tb,i) => {
      tb.addEventListener('click', () => toggleTickbox(i));
    });
  }

function addClickListenerToDiskTiles() {
  const tiles = Array.from(document.querySelectorAll('.tile')).filter(t => t.dataset.excess === "false");


  tiles.forEach(tile => {
    tile.onclick = () => {
      const ticked = getTickedPlayerIndexes();
      if (ticked.length === 0) return;

      const tileColor = tile.dataset.color;
      const diskIndex = tile.dataset.diskIndex;
      const matchingTiles = Array.from(document.querySelectorAll(`.tile[data-disk-index="${diskIndex}"][data-color="${tileColor}"]`));

      matchingTiles.forEach((t, i) => {
        setTimeout(() => {
          t.style.transition = 'top 0.6s ease, opacity 0.6s ease';
          t.style.top = '1200px';
          t.style.opacity = '0';
          setTimeout(() => t.remove(), 700);
        }, i * 100);
      });

      setTimeout(() => {
        const leftovers = Array.from(document.querySelectorAll('.tile')).filter(t => t.dataset.diskIndex == diskIndex);
        addToExcess(leftovers);
        advanceToNextPlayer();

        // ✅ Reattach listeners after DOM changes
        addClickListenerToDiskTiles();
      }, matchingTiles.length * 100 + 900);

    };
  });
}

  function init() {
    initializeTickboxes();
    updateBackgroundAndDisks();
    setupTickboxes();
    resetOneboxPosition();
    highlightCurrentPlayer();
  }

  dealButton.addEventListener('click', startGame);

  init();
})();
