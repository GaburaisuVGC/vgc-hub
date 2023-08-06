const PrivateMessage = require('../models/privateMessage');

exports.sendMessage = async (req, res) => {
  try {
    // Récupérer les informations du message à partir de la requête
    const { sender_id, receiver_id, content } = req.body;
    const media = req.file; // Le fichier téléchargé est disponible ici

    // Créer un nouvel objet PrivateMessage avec les informations du message
    const newPrivateMessage = new PrivateMessage({
      sender: sender_id,
      receiver: receiver_id,
      content: content,
      media: media ? { filename: media.filename, contentType: media.contentType } : null,
      timestamp: new Date(),
    });

    // Enregistrez le message dans la base de données
    await newPrivateMessage.save();

    // Envoyer la réponse au client
    res.status(201).json({ message: 'Message privé envoyé avec succès', privateMessage: newPrivateMessage });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message privé :', error);
    res.status(500).json({ error: 'Une erreur est survenue lors de l\'envoi du message privé' });
  }
};


const { Readable } = require('stream');
const mongoose = require('mongoose');

// ...

exports.getPrivateMessageMedia = async (req, res) => {
  const gfs = mongoose.connection.db.collection('pms.files'); // Assurez-vous que le nom de la collection est correct

  const filename = req.params.filename;

  try {
    const file = await gfs.findOne({ filename: filename });

    if (!file) {
      return res.status(404).json({ message: 'Média non trouvé.' });
    }

    const fileId = file._id;

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'pms' });
    const downloadStream = bucket.openDownloadStream(fileId);

    // Configurer les en-têtes de la réponse
    res.set('Content-Type', file.contentType);
    res.set('Content-Length', file.length);
    res.set('Cache-Control', 'public, max-age=86400'); // Exemple de cache pour une journée (86400 secondes)

    // Stream le contenu du fichier dans la réponse HTTP
    const readableStream = new Readable().wrap(downloadStream);
    readableStream.pipe(res);
  } catch (error) {
    return res.status(500).json({ error: 'Une erreur est survenue lors de la récupération du média.' });
  }
};
