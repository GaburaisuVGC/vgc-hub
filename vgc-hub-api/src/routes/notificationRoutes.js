const express = require('express');
const router = express.Router();
const Notification = require('../models/notification'); // Assurez-vous que le modèle Notification est correctement importé

// GET /notifications/:userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Récupérer toutes les notifications associées à l'utilisateur spécifié
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({ notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.patch('/mark-as-read/:notificationId', async (req, res) => {
    try {
        const { notificationId } = req.params;
    
        // Marquer la notification spécifiée comme lue
        await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    
        res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
    });


module.exports = router;
