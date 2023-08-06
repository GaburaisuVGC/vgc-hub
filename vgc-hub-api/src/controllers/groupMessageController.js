const GroupMessage = require('../models/groupMessage');

exports.sendMessage = async (req, res) => {
  try {
    // Récupérer les informations du message à partir de la requête
    const { sender_id, groupChatId, content } = req.body;
    const media = req.file; // Le fichier téléchargé est disponible ici

    // Créer un nouvel objet GroupMessage avec les informations du message
    const newGroupMessage = new GroupMessage({
      sender: sender_id,
      groupChatId: groupChatId,
      content: content,
      media: media ? { filename: media.filename, contentType: media.contentType } : null,
      timestamp: new Date(),
    });

    // Enregistrez le message dans la base de données
    await newGroupMessage.save();

    // Envoyer la réponse au client
    res.status(201).json({ message: 'Message de groupe envoyé avec succès', groupMessage: newGroupMessage });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message de groupe :', error);
    res.status(500).json({ error: 'Une erreur est survenue lors de l\'envoi du message de groupe' });
  }
};

exports.getGroupMessageMedia = async (req, res) => {
  const gfs = mongoose.connection.db.collection('groupMessages.files'); // Assurez-vous que le nom de la collection est correct

  const filename = req.params.filename;

  try {
    const file = await gfs.findOne({ filename: filename });

    if (!file) {
      return res.status(404).json({ message: 'Média non trouvé.' });
    }

    const fileId = file._id;

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'groupMessages' });
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
