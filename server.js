// Simple Socket.io server for Azul game synchronization
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  },
});

// Store connected players by socket id and player number
let players = {};

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Player registers with their player number
  socket.on('register_player', (playerNumber) => {
    players[socket.id] = playerNumber;
    console.log(`Player ${playerNumber} registered with socket ${socket.id}`);
  });

  // Main screen sends tile selection for a player
  socket.on('tile_chosen', ({ player, tile }) => {
    // Find the socket id for the player
    for (const [sockId, pNum] of Object.entries(players)) {
      if (pNum === player) {
        io.to(sockId).emit('tile_for_player', { tile });
        break;
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    delete players[socket.id];
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Azul server running on port ${PORT}`);
});
