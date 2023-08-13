// controllers/postController.js
const Post = require("../models/post");
const User = require("../models/user");
const Notification = require('../models/notification');

// Contrôleur pour ajouter un nouveau post
const PostService = require('../services/postService');

exports.createPost = async (req, res) => {
  const { content, quoteOf } = req.body;
  const { user } = req;

  try {
    const postService = new PostService();
    const result = await postService.createPost(content, quoteOf, user, req.files);

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", "username");

    // Populer les détails de l'utilisateur associé à chaque post
    for (const post of posts) {
      const user = await User.findById(post.user)
        .select("username avatar color isVerified role")
        .lean()
        .exec();
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
        edited: post.edited,
        quoteOf: post.quoteOf,
        likes: post.likes,
        quotes: post.quotes,
        reposts: post.reposts,
        replies: post.replies,
        replyTo: post.replyTo,
      };
    });

    return res.json({ posts: postsWithMedia });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        message: "Une erreur est survenue lors de la récupération des posts",
        error,
      });
  }
};

// Contrôleur pour récupérer tous les posts d'un utilisateur spécifié par son username
exports.getUserPosts = async (req, res) => {
  const { username } = req.params;

  try {
    // Trouver l'utilisateur en fonction du nom d'utilisateur
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Récupérer les posts de l'utilisateur en fonction de son ID d'utilisateur
    const userPosts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate("user", "username");

    // Populer les détails de l'utilisateur associé à chaque post
    for (const post of userPosts) {
      const user = await User.findById(post.user)
        .select("username avatar color isVerified role")
        .lean()
        .exec();
      post.user = user;
    }

    // Modifiez chaque post pour inclure le lien vers le média
    const postsWithMedia = userPosts.map((post) => {
      return {
        _id: post._id,
        user: post.user,
        content: post.content,
        createdAt: post.createdAt,
        media: post.media.map((filename) => `${filename}`), // Ajoutez le lien vers le média ici
        edited: post.edited,
        quoteOf: post.quoteOf,
        likes: post.likes,
        quotes: post.quotes,
        reposts: post.reposts,
        replies: post.replies,
        replyTo: post.replyTo,
      };
    });

    // Trouver les reposts de l'utilisateur, on doit prendre reposts.post et reposts.repostedAt
    const repostedByUser = user.reposts.map((repost) => {
      return {
        _id: repost.post,
        repostedAt: repost.repostedAt,
      };
    });
    // trouver les posts repostés par l'utilisateur
    const reposts = await Post.find({
      _id: { $in: repostedByUser.map((repost) => repost._id) },
    })
      .sort({ createdAt: -1 })
      .populate("user", "username");

    for (const post of reposts) {
      const user = await User.findById(post.user)
        .select("username avatar color isVerified role")
        .lean()
        .exec();
      post.user = user;
    }

    const repostsWithMedia = reposts.map((post) => {
      return {
        _id: post._id,
        user: post.user,
        content: post.content,
        // createdAt doit être la date à laquelle le post a été reposté
        createdAt: repostedByUser.find(
          (repost) => repost._id.toString() === post._id.toString()
        ).repostedAt,
        media: post.media.map((filename) => `${filename}`), // Ajoutez le lien vers le média ici
        edited: post.edited,
        quoteOf: post.quoteOf,
        likes: post.likes,
        quotes: post.quotes,
        reposts: post.reposts,
        isReposted: true,
        repostUsername: username,
        repostUserId: user._id,
        replies: post.replies,
        replyTo: post.replyTo,
      };
    });

    const allPosts = [...postsWithMedia, ...repostsWithMedia];

    allPosts.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return res.json({ posts: allPosts });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        message: "Une erreur est survenue lors de la récupération des posts",
        error,
      });
  }
};



// Contrôleur pour récupérer un post par son ID
exports.getPostById = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId).populate("user", "username");

    if (!post) {
      return res.status(404).json({ message: "Post non trouvé" });
    }

    const user = await User.findById(post.user)
      .select("username avatar color isVerified role")
      .lean()
      .exec();
    post.user = user;

    // If the post is a reply, get the parent post details
    if (post.replyTo) {
      const parentPost = await Post.findById(post.replyTo).populate(
        "user",
        "username"
      );

      if (parentPost) {
        const parentUser = await User.findById(parentPost.user)
          .select("username")
          .lean()
          .exec();
        post.replyToUser = parentUser;
      }
    }

    return res.json({ post });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Une erreur est survenue lors de la récupération du post",
        error,
      });
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
      return res.status(404).json({ message: "Post non trouvé" });
    }

    // Vérifier si l'utilisateur est autorisé à modifier le post (admin ou l'auteur du post)
    if (
      !user.role === "admin" &&
      post.user.toString() !== user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à modifier ce post" });
    }

    post.content = content;
    post.edited = true;
    await post.save();

    return res.json({ message: "Post mis à jour avec succès", post });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Une erreur est survenue lors de la mise à jour du post",
        error,
      });
  }
};

const { mongoose } = require("mongoose");
const { all } = require("../routes/authRoutes");

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Connexion à la base de données MongoDB
const conn = mongoose.createConnection(
  process.env.MONGODB_URI,
  mongooseOptions
);
let gfs;

conn.once("open", () => {
  // Initialiser l'instance de GridFSStream
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "posts", // Remplacez 'posts' par le nom de votre seau (bucket) GridFS pour les posts
  });
});

exports.deletePost = async (req, res) => {
  const { postId } = req.params;
  const { user } = req;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post non trouvé" });
    }

    // Vérifier si l'utilisateur est autorisé à supprimer le post (admin ou l'auteur du post)
    if (
      !user.role === "admin" &&
      post.user.toString() !== user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à supprimer ce post" });
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

    // if the post is quoteOf, find the post it quotes and remove the quote
    if (post.quoteOf) {
      const postQuoted = await Post.findById(post.quoteOf);
      if (postQuoted) {
        postQuoted.quotes = postQuoted.quotes.filter(
          (quote) => quote.toString() !== post._id.toString()
        );
        await postQuoted.save();
      }
    }

    // if the post is a reply, find the post it replies to and remove the reply
    if (post.replyTo) {
      const postRepliedTo = await Post.findById(post.replyTo);
      if (postRepliedTo) {
        postRepliedTo.replies = postRepliedTo.replies.filter(
          (reply) => reply.toString() !== post._id.toString()
        );
        await postRepliedTo.save();
      }
    }

    // if the post is in a notification.postId, remove the notification
    const notifications = await Notification.find({ postId: post._id });
    if (notifications && notifications.length > 0) {
      for (const notification of notifications) {
        await notification.deleteOne();
      }
    }

    // Remove the post from the "posts" collection
    await post.deleteOne({ _id: postId });

    return res.json({ message: "Post supprimé avec succès" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        message: "Une erreur est survenue lors de la suppression du post",
        error,
      });
  }
};

const LikeNotificationService = require('../services/likeNotificationService');

exports.likePost = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  try {
    const likeService = new LikeNotificationService();
    const result = await likeService.handleLike(postId, userId);

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error("Error updating like:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const RepostService = require('../services/repostNotificationService');

exports.repostPost = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  try {
    const repostService = new RepostService();
    const result = await repostService.handleRepost(postId, userId);

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error("Error reposting:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Contrôleur pour récupérer les likes d'un post par son ID
exports.getPostLikes = async (req, res) => {
  const { postId } = req.params;

  try {
    // Trouver le post en fonction de son ID
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Trouver les utilisateurs qui ont liké le post en fonction des IDs des utilisateurs dans le champ likes
    const likes = await User.find({ _id: { $in: post.likes } }).select(
      "username avatar color _id"
    );

    return res.json({ likes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Contrôleur pour récupérer les reposts d'un post par son ID
exports.getPostReposts = async (req, res) => {
  const { postId } = req.params;

  try {
    // Trouver le post en fonction de son ID
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Trouver les utilisateurs qui ont reposté le post en fonction des IDs des utilisateurs dans le champ reposts
    const reposts = await User.find({
      _id: { $in: post.reposts.map((repost) => repost) },
    }).select("username avatar color _id");

    return res.json({ reposts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Contrôleur pour récupérer les quotes d'un post par son ID
exports.getPostQuotes = async (req, res) => {
  const { postId } = req.params;

  try {
    // Trouver le post en fonction de son ID
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Trouver les posts qui citent le post en fonction des IDs des posts dans le champ quotes
    const quotes = await Post.find({ _id: { $in: post.quotes } }).populate(
      "user",
      "username"
    );

    // Populer les détails de l'utilisateur associé à chaque post
    for (const quote of quotes) {
      const user = await User.findById(quote.user)
        .select("username avatar color isVerified role")
        .lean()
        .exec();
      quote.user = user;
    }

    // Modifiez chaque post pour inclure le lien vers le média
    const quotesWithMedia = quotes.map((post) => {
      return {
        _id: post._id,
        user: post.user,
        content: post.content,
        createdAt: post.createdAt,
        media: post.media.map((filename) => `${filename}`), // Ajoutez le lien vers le média ici
        edited: post.edited,
        quoteOf: post.quoteOf,
        likes: post.likes,
        quotes: post.quotes,
        reposts: post.reposts,
      };
    });

    return res.json({ quotes: quotesWithMedia });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const ReplyService = require('../services/replyNotificationService');

exports.createReply = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const { user } = req;

  try {
    const replyService = new ReplyService();
    const result = await replyService.createReply(postId, content, user, req.files);

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


exports.getPostReplies = async (req, res) => {
  const { postId } = req.params;

  try {
    // Trouver le post en fonction de son ID
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Trouver les posts qui répondent au post en fonction des IDs des posts dans le champ quoteOf
    const replies = await Post.find({ replyTo: postId }).populate(
      "user",
      "username avatar color isVerified role"
    );

    // Modifiez chaque post pour inclure le lien vers le média
    const repliesWithMedia = replies.map((reply) => {
      return {
        _id: reply._id,
        user: reply.user,
        content: reply.content,
        createdAt: reply.createdAt,
        media: reply.media.map((filename) => `${filename}`), // Ajoutez le lien vers le média ici
        edited: reply.edited,
        quoteOf: reply.quoteOf,
        likes: reply.likes,
        quotes: reply.quotes,
        reposts: reply.reposts,
        replies: reply.replies,
        replyTo: reply.replyTo,
      };
    });

    return res.json({ replies: repliesWithMedia });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getTimeline = async (req, res) => {
  try {
    const currentUser = req.user; // Assuming you have the logged-in user available in req.user

    // Find the users that the current user follows
    const followingUsers = await User.find({ _id: { $in: currentUser.following } });

    // Find the posts and reposts from the users that the logged-in user follows
    const followingPosts = [];
    for (const user of followingUsers) {
      // Find the posts from the user
      const userPosts = await Post.find({ user: user._id })
        .sort({ createdAt: -1 })
        .populate('user', 'username avatar color isVerified role')
        .lean();

      followingPosts.push(...userPosts);

      // Find the reposts from the user and populate the original post details
      for (const repost of user.reposts) {
        const repostedPost = await Post.findById(repost.post)
          .populate('user', 'username avatar color isVerified role')
          .lean();

        followingPosts.push({
          _id: repostedPost._id,
          user: repostedPost.user,
          content: repostedPost.content,
          createdAt: repost.repostedAt,
          media: repostedPost.media.map((filename) => `${filename}`),
          edited: repostedPost.edited,
          quoteOf: repostedPost.quoteOf,
          likes: repostedPost.likes,
          quotes: repostedPost.quotes,
          reposts: repostedPost.reposts,
          isReposted: true,
          repostUsername: user.username,
          repostUserId: user._id,
          replies: repostedPost.replies,
          replyTo: repostedPost.replyTo,
        });
      }
    }

    // Find the posts and reposts from the logged-in user
    const myPosts = await Post.find({ user: currentUser._id })
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar color isVerified role')
      .lean();

    followingPosts.push(...myPosts);

    for (const repost of currentUser.reposts) {
      const repostedPost = await Post.findById(repost.post)
        .populate('user', 'username avatar color isVerified role')
        .lean();

        if (repostedPost) {
      followingPosts.push({
        _id: repostedPost._id,
        user: repostedPost.user,
        content: repostedPost.content,
        createdAt: repost.repostedAt,
        media: repostedPost.media.map((filename) => `${filename}`),
        edited: repostedPost.edited,
        quoteOf: repostedPost.quoteOf,
        likes: repostedPost.likes,
        quotes: repostedPost.quotes,
        reposts: repostedPost.reposts,
        isReposted: true,
        repostUsername: currentUser.username,
        repostUserId: currentUser._id,
        replies: repostedPost.replies,
        replyTo: repostedPost.replyTo,
      });

    }
    }

    // Trier les posts par ordre décroissant en fonction de la date de création
    followingPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ posts: followingPosts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'An error occurred while fetching the timeline posts.',
      error,
    });
  }
};

