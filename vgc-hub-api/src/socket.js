const connectedSockets = new Map();
const passport = require('passport'); // Importer le module passport

function initializeSockets(io) {
  io.on('connection', (socket) => {
    console.log('A user connected');

    // Utiliser le middleware verifyJwt pour vérifier l'authentification et obtenir l'ID de l'utilisateur
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (err || !user) {
        // Gérer les erreurs d'authentification
        return;
      }
      const userId = user._id.toString();
      console.log(userId)

      connectedSockets.set(userId, socket);

      socket.on('disconnect', () => {
        connectedSockets.delete(userId);
        console.log('A user disconnected');
      });
    })(socket.request, socket.request.res); // Appeler le middleware avec les arguments appropriés
  });
}

module.exports = { initializeSockets, connectedSockets };
