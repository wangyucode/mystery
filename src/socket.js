import io from 'socket.io-client';


let socket;

function initSocket() {
  const game = JSON.parse(localStorage.getItem('game'));

  if (game && location.pathname !== `/room/${game.roomId}`) {
    window.location.href = `/room/${game.roomId}`;
    return;
  }

  if (!game && location.pathname !== '/') {
    window.location.href = '/';
    return;
  }

  socket = io();

  socket.on('connect', () => {
    console.log('Connected to socket server');
    if (game) {
      socket.emit('room:rejoin', game);
    }
  });
}

initSocket();

export default socket;