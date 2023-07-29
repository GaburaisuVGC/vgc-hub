// Exemple d'un middleware de vérification des autorisations pour les actions d'administration
const isAdmin = (req, res, next) => {
    // Votre logique pour vérifier si l'utilisateur est un administrateur
    // Vous pouvez utiliser les informations de l'utilisateur stockées dans req.user (si vous utilisez Passport.js)
    // Si l'utilisateur est un administrateur, appelez simplement next() pour passer à l'action suivante
    // Sinon, vous pouvez renvoyer une réponse d'erreur avec res.status(403).json({ error: 'Non autorisé' });
  };
  
  module.exports = { isAdmin };
  