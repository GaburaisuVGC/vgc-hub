const authenticationMiddleware = (req, res, next) => {
    // Votre logique pour vérifier l'authentification de l'utilisateur
    // Vous pouvez utiliser le module Passport.js ou votre propre logique d'authentification
    // Si l'utilisateur est authentifié, vous pouvez ajouter l'utilisateur à la demande avec req.user = authenticatedUser
    // Sinon, vous pouvez renvoyer une réponse d'erreur avec res.status(401).json({ error: 'Non autorisé' });
  };
  
  module.exports = authenticationMiddleware;
  