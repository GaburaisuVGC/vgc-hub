const socketIO = require('socket.io');

const initSocket = (server) => {
  const io = socketIO(server);

  io.on('connection', (socket) => {
    const { userId } = socket.handshake.query;

    socket.join(userId);

    socket.on('disconnect', () => {
      // Traitez la déconnexion du client si nécessaire
    });
  });

  return io;
};

module.exports = initSocket;
