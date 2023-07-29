// controllers/postController.js
const Post = require('../models/post');
const User = require('../models/user');

// Contrôleur pour ajouter un nouveau post
exports.createPost = async (req, res) => {
    console.log("body", req.body);
  const { content } = req.body;
  const { user } = req;

  try {
    // Vérifier si le contenu du post est fourni
    if (!content) {
      return res.status(400).json({ message: 'Veuillez fournir du contenu pour le post' });
    }

    // Vérifier si l'utilisateur est connecté
    if (!user) {
      return res.status(401).json({ message: 'Vous devez être connecté pour créer un post' });
    }

    // Vérifier si le nombre de médias dépasse 4
    if (req.media && req.media.length > 4) {
      return res.status(400).json({ message: 'Vous ne pouvez télécharger que 4 images ou 1 vidéo par post' });
    }

    // Créer le nouveau post
    const post = new Post({
      user: user._id,
      content,
      media: req.files ? req.files.map(file => file.filename) : [],
    });

    await post.save();

    return res.json({ message: 'Post ajouté avec succès', post });
  } catch (error) {
    return res.status(500).json({ message: 'Une erreur est survenue lors de l\'ajout du post', error });
  }
};

exports.getPosts = async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: -1 }).populate('user', 'username');
  
          // Populer les détails de l'utilisateur associé à chaque post
    for (const post of posts) {
        const user = await User.findById(post.user).select('username avatar isVerified role').lean().exec();
        post.user = user;
      }

      // Modifiez chaque post pour inclure le lien vers le média
      const postsWithMedia = posts.map((post) => {
        return {
          _id: post._id,
          user: post.user,
          content: post.content,
          createdAt: post.createdAt,
          media: post.media.map((filename) => `${filename}`), // Ajoutez le lien vers le média ici
        };
      });
  
      return res.json({ posts: postsWithMedia });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des posts', error });
    }
  };
  

// Contrôleur pour récupérer tous les posts d'un utilisateur spécifié par son username
exports.getUserPosts = async (req, res) => {
    const { username } = req.params;
  
    try {
      // Trouver l'utilisateur en fonction du nom d'utilisateur
      const user = await User.findOne({ username });
  
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
  
      // Récupérer les posts de l'utilisateur en fonction de son ID d'utilisateur
      const userPosts = await Post.find({ user: user._id }).sort({ createdAt: -1 }).populate('user', 'username');


  
           // Populer les détails de l'utilisateur associé à chaque post
    for (const post of userPosts) {
        const user = await User.findById(post.user).select('username avatar isVerified role').lean().exec();
        post.user = user;
      }

      // Modifiez chaque post pour inclure le lien vers le média
      const postsWithMedia = userPosts.map((post) => {
        console.log(post)
        return {
          _id: post._id,
          user: post.user,
          content: post.content,
          createdAt: post.createdAt,
          media: post.media.map((filename) => `${filename}`), // Ajoutez le lien vers le média ici
        };
      });
  
      return res.json({ posts: postsWithMedia });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des posts', error });
    }
  };

// Contrôleur pour récupérer un post par son ID
exports.getPostById = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId).populate('user', 'username');;

    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé' });
    }

    const user = await User.findById(post.user).select('username avatar isVerified role').lean().exec();
    post.user = user;

    return res.json({ post });
  } catch (error) {
    return res.status(500).json({ message: 'Une erreur est survenue lors de la récupération du post', error });
  }
};

// Contrôleur pour mettre à jour un post par son ID
exports.updatePost = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const { user } = req;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé' });
    }

    // Vérifier si l'utilisateur est autorisé à modifier le post (admin ou l'auteur du post)
    if (!user.role === 'admin' && post.user.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier ce post' });
    }

    post.content = content;
    post.edited = true;
    await post.save();

    return res.json({ message: 'Post mis à jour avec succès', post });
  } catch (error) {
    return res.status(500).json({ message: 'Une erreur est survenue lors de la mise à jour du post', error });
  }
};

const { mongoose } = require('mongoose');

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Connexion à la base de données MongoDB
const conn = mongoose.createConnection(process.env.MONGODB_URI, mongooseOptions);
let gfs;

conn.once('open', () => {
  // Initialiser l'instance de GridFSStream
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'posts' // Remplacez 'posts' par le nom de votre seau (bucket) GridFS pour les posts
  });
});

exports.deletePost = async (req, res) => {
    const { postId } = req.params;
    const { user } = req;
  
    try {
      const post = await Post.findById(postId);
  
      if (!post) {
        return res.status(404).json({ message: 'Post non trouvé' });
      }
  
      // Vérifier si l'utilisateur est autorisé à supprimer le post (admin ou l'auteur du post)
      if (!user.role === 'admin' && post.user.toString() !== user._id.toString()) {
        return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à supprimer ce post' });
      }
  
      // Delete media files associated with the post from GridFS
      if (post.media && post.media.length > 0) {
        for (const filename of post.media) {
          const fileToDelete = await gfs.find({ filename: filename }).toArray();
          if (fileToDelete.length > 0) {
            await gfs.delete(fileToDelete[0]._id);
          }
        }
      }
  
      // Remove the post from the "posts" collection
      await post.deleteOne({ _id: postId });
  
      return res.json({ message: 'Post supprimé avec succès' });
    } catch (error) {
        console.log(error)
      return res.status(500).json({ message: 'Une erreur est survenue lors de la suppression du post', error });
    }
  };



// ...
