// CONFIGURATION
const disks = [...document.querySelectorAll('.disk')];
const tiles = [...document.querySelectorAll('.tile')];
const tickboxes = [
  document.getElementById('tick1'),
  document.getElementById('tick2'),
  document.getElementById('tick3'),
  document.getElementById('tick4')
];
const onebox = document.getElementById('onebox');
const playerCount = tickboxes.filter(t => t.dataset.active === 'true').length;
const diskVisibility = {
  2: [1, 3, 5, 7, 9],
  3: [1, 3, 4, 5, 6, 7, 9],
  4: [1, 2, 3, 4, 5, 6, 7, 8, 9]
};
let currentPlayerIndex = 0;
let oneTileClaimed = false;
let oneTileHolder = null;
let playerOrder = [];

// SETUP
function initializeGame() {
  playerOrder = tickboxes
    .map((t, i) => (t.dataset.active === 'true' ? i : null))
    .filter(i => i !== null);

  const visibleDisks = diskVisibility[playerOrder.length];

  disks.forEach((disk, i) => {
    if (visibleDisks.includes(i + 1)) {
      disk.style.display = 'block';
    } else {
      disk.style.display = 'none';
    }
  });

function startGame() {
  const visibleDisks = diskVisibility[playerOrder.length];

  let allTileIndex = 0;
  const delayPerDisk = 200;
  const delayPerTile = 75;

  disks.forEach((disk, diskIndex) => {
    if (!visibleDisks.includes(diskIndex + 1)) return;

    const diskTiles = [...disk.querySelectorAll('.tile')];
    diskTiles.forEach((tile, i) => {
      tile.style.transition = 'none';
      tile.style.top = '-150px';
      tile.style.opacity = '0';
      tile.dataset.disk = diskIndex;

      setTimeout(() => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const left = 180 + col * 120;
        const top = 250 + row * 120;

        tile.style.transition = 'top 0.4s ease, opacity 0.4s ease';
        tile.style.left = left + 'px';
        tile.style.top = top + 'px';
        tile.style.opacity = '1';
      }, delayPerDisk * diskIndex + delayPerTile * i);

      // Rotate slightly after landing
      setTimeout(() => {
        tile.style.transition += ', transform 0.3s ease';
        tile.style.transform = `rotate(${Math.random() * 10 - 5}deg)`;
      }, delayPerDisk * diskIndex + delayPerTile * i + 400);

      allTileIndex++;
    });
  });

  setTimeout(() => {
    enableTileClicks();
  }, delayPerDisk * disks.length + delayPerTile * 6);
}

function enableTileClicks() {
  const tiles = document.querySelectorAll('.tile');
  tiles.forEach(tile => {
    tile.style.pointerEvents = 'auto';
    tile.addEventListener('click', handleTileClick);
  });
}

function handleTileClick(e) {
  const tile = e.currentTarget;
  if (!tile.classList.contains('tile')) return;

  const diskIndex = parseInt(tile.dataset.disk);
  const disk = disks[diskIndex];
  const tilesOnDisk = disk.querySelectorAll('.tile');

  // Remove tile from DOM and move to grid
  moveTileToGrid(tile);

  // Remove tile from disk
  tile.remove();
  
  // If disk is now empty, hide it
  if (disk.querySelectorAll('.tile').length === 0) {
    disk.style.display = 'none';
  }

  // Claim Onebox if it's the first tile taken from the centre
  if (!oneTileClaimed && diskIndex === 4) {
    claimOnebox();
    oneTileClaimed = true;
    oneTileHolder = currentPlayerIndex;
  }

  // If only one tile left, assign it to grid directly
  if (tilesOnDisk.length === 2) {
    const lastTile = [...tilesOnDisk].find(t => t !== tile);
    setTimeout(() => moveTileToGrid(lastTile), 300);
  }

  // Advance to next player
  currentPlayerIndex = getNextPlayerIndex();
}

function moveTileToGrid(tile) {
  tile.style.transition = 'top 0.3s ease, left 0.3s ease, transform 0.3s ease';
  const gridX = selectedTiles.length % 7;
  const gridY = Math.floor(selectedTiles.length / 7);
  const left = 700 + gridX * 110;
  const top = 600 + gridY * 110;

  tile.style.left = left + 'px';
  tile.style.top = top + 'px';
  tile.style.transform = 'rotate(0deg)';
  tile.style.zIndex = '10';
  selectedTiles.push(tile);
}

function getNextPlayerIndex() {
  const ticked = tickboxes.map((el, i) => el.src.includes('tick.png') ? i : -1).filter(i => i !== -1);
  const curr = ticked.indexOf(currentPlayerIndex);
  return ticked[(curr + 1) % ticked.length];
}

function claimOnebox() {
  onebox.style.left = '1753px';
  onebox.style.top = (93 + 110 * currentPlayerIndex) + 'px';
  onebox.style.transform = 'rotate(-10deg)';
  onebox.style.opacity = '1';
}


window.onload = () => {
  initGame();
  startGame();
};

function initGame() {
  onebox.style.left = '1133px';
  onebox.style.top = '430px';
  onebox.style.transform = 'rotate(0deg)';
  onebox.style.opacity = '1';

  // Clear prior tiles if any
  document.querySelectorAll('.tile').forEach(tile => tile.remove());

  // Reset state
  selectedTiles = [];
  currentPlayerIndex = getFirstTickedPlayerIndex();
  oneTileClaimed = false;
  oneTileHolder = null;
}

function getFirstTickedPlayerIndex() {
  for (let i = 0; i < tickboxes.length; i++) {
    if (tickboxes[i].src.includes('tick.png')) return i;
  }
  return 0;
}

function showDisksForPlayerCount(count) {
  let visibleDisks = [];
  if (count === 2) visibleDisks = [1, 3, 5, 7, 9];
  else if (count === 3) visibleDisks = [1, 3, 4, 5, 6, 7, 9];
  else if (count === 4) visibleDisks = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  for (let i = 0; i < disks.length; i++) {
    disks[i].style.display = visibleDisks.includes(i + 1) ? 'block' : 'none';
  }
}

function createTile(color, diskIndex, offset = 0) {
  const tile = document.createElement('img');
  tile.src = `tile_${color}.png`;
  tile.classList.add('tile');
  tile.dataset.color = color;
  tile.dataset.disk = diskIndex;
  tile.style.position = 'absolute';
  tile.style.left = '960px';
  tile.style.top = '540px';
  tile.style.width = '110px';
  tile.style.height = '110px';
  tile.style.transform = 'scale(0)';
  tile.style.pointerEvents = 'auto';
  game.appendChild(tile);

  setTimeout(() => {
    tile.style.transition = 'transform 0.4s ease, left 0.5s ease, top 0.5s ease';
    tile.style.left = (diskIndex * 180 + 200) + offset + 'px';
    tile.style.top = (diskIndex % 2 === 0 ? 150 : 300) + 'px';
    tile.style.transform = 'scale(1) rotate(' + (Math.random() * 20 - 10) + 'deg)';
  }, 100 + offset);

  return tile;
}


function resetOnebox() {
  onebox.style.left = '1133px';
  onebox.style.top = '430px';
  onebox.style.transform = 'rotate(0deg)';
  oneboxHolder = null;
  onebox.style.opacity = '1';
}

function assignOneboxToPlayer(index) {
  oneboxHolder = index;
  const top = 93 + index * 110;
  onebox.style.transition = 'all 0.5s ease';
  onebox.style.left = '1753px';
  onebox.style.top = top + 'px';
  onebox.style.transform = 'rotate(-12deg)';
}

function advanceToNextPlayer() {
  const total = tickboxes.length;
  do {
    currentPlayerIndex = (currentPlayerIndex + 1) % total;
  } while (!tickboxes[currentPlayerIndex].src.includes('tick.png'));
}

function endRound() {
  document.querySelectorAll('.tile').forEach(tile => {
    tile.style.transition = 'all 0.3s ease';
    tile.style.transform = 'scale(0)';
    setTimeout(() => tile.remove(), 300);
  });
  resetOnebox();
  startGame();
}

document.getElementById('endround').addEventListener('click', () => {
  endRound();
});

document.querySelectorAll('.tickbox').forEach((tickbox, i) => {
  tickbox.addEventListener('click', () => {
    tickbox.src = tickbox.src.includes('tick.png') ? 'untick.png' : 'tick.png';
    showDisksForPlayerCount(document.querySelectorAll('.tickbox[src*="tick.png"]').length);
  });
});



