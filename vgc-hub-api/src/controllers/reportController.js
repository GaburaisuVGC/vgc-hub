const User = require('../models/user');
const Report = require('../models/report');

exports.reportPost = (req, res) => {
    const { postId } = req.params;
    const { comment } = req.body;
    const { user } = req;

    // Créez et enregistrez le rapport dans la base de données
    const newReport = new Report({
      postId,
      comment,
      reportedBy: user._id,
    });
  
    newReport.save()
      .then((report) => {
        return res.json({ message: 'Report created'});
      })
      .catch((error) => {
        // Gérez les erreurs
        console.log(error);
        return res.status(500).json({ message: 'Error while creating report'});
      });
}

exports.reportUser = (req, res) => {
    const { userId } = req.params;
    const { comment } = req.body;
    const { user } = req;
    
    // Créez et enregistrez le rapport dans la base de données
    const newReport = new Report({
      userId,
      comment,
      reportedBy: user._id,
    });
  
    newReport.save()
      .then((report) => {
        return res.json({ message: 'Report created'});
      })
      .catch((error) => {
        // Gérez les erreurs
        console.log(error);
        return res.status(500).json({ message: 'Error while creating report'});
      });
}

exports.getReports = async (req, res) => {
    const { user: usr } = req;
  
    try {
      // Vérifiez si l'utilisateur est un administrateur
      const user = await User.findById(usr._id);
      if (user.role !== 'admin') {
        return res.status(403).json({ message: "Vous n'êtes pas autorisé à accéder à cette ressource." });
      }
  
      // Récupérez la liste des rapports depuis la base de données
      const reports = await Report.find().populate('postId userId reportedBy', 'username email avatar');
  
      // Retournez une réponse JSON avec les rapports
      res.json({ reports });
    } catch (error) {
      console.error('Erreur lors de la récupération des rapports :', error);
      res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des rapports.' });
    }
  };
  
  exports.deleteReport = async (req, res) => {
    const { reportId } = req.params;
    const { user: usr } = req; // Assurez-vous d'avoir un middleware d'authentification pour obtenir userId
  
    try {
      // Vérifiez si l'utilisateur est un administrateur
      const user = await User.findById(usr._id);
      if (user.role !== 'admin') {
        return res.status(403).json({ message: "Vous n'êtes pas autorisé à accéder à cette ressource." });
      }
  
      // Supprimez le rapport de la base de données
      const deletedReport = await Report.findByIdAndDelete(reportId);
  
      if (!deletedReport) {
        return res.status(404).json({ message: "Le rapport spécifié n'a pas été trouvé." });
      }
  
      // Retournez une réponse JSON indiquant que le rapport a été supprimé avec succès
      res.json({ message: "Le rapport a été supprimé avec succès." });
    } catch (error) {
      console.error('Erreur lors de la suppression du rapport :', error);
      res.status(500).json({ message: 'Une erreur est survenue lors de la suppression du rapport.' });
    }
  };