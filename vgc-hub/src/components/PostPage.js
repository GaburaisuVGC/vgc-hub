import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jwt_decode from "jwt-decode";
import "../styles/postpage.css";
import { GiPaperClip, GiHearts, GiChatBubble } from "react-icons/gi";
import { BsFillArrowUpSquareFill } from "react-icons/bs";
import LikesComponent from './LikesComponent';
import RepostsComponent from './RepostsComponent';
import QuotesComponent from './QuotesComponent';
import Dropzone from "react-dropzone";
import Post from "./Post";

const PostPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState("");
  const [user, setUser] = useState(null);
  const [verified, setVerified] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [quotedPost, setQuotedPost] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [repostCount, setRepostCount] = useState(0);
  const [quoteCount, setQuoteCount] = useState(0);
  const [quoteContent, setQuoteContent] = useState("");
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showRepostsModal, setShowRepostsModal] = useState(false);
  const [showQuotesModal, setShowQuotesModal] = useState(false);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyCount, setReplyCount] = useState(0);
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [replies, setReplies] = useState([]);
  const [repliedPost, setRepliedPost] = useState(null);
  const navigate = useNavigate();

  const fetchPost = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/posts/post/${postId}`);
      const postData = response.data.post;
      setPost(postData);
  
      if (postData.likes) {
        setLikeCount(postData.likes.length);
      }
  
      if (postData.reposts) {
        setRepostCount(postData.reposts.length);
      }
  
      if (postData.quotes) {
        setQuoteCount(postData.quotes.length);
      }
  
      if (postData.replies) {
        setReplyCount(postData.replies.length);
      }
    } catch (error) {
      toast.error("Erreur lors de la récupération du post.");
    }
  };
  
  const fetchReplyTo = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/posts/post/${postId}`);
  
      if (response.data.post.replyTo) {
        axios
          .get(`http://localhost:5000/posts/post/${response.data.post.replyTo}`)
          .then((response) => {
            setRepliedPost(response.data.post);
          });
      }
    } catch (error) {
      // Handle error
    }
  };
  
  const fetchQuotedPost = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/posts/post/${postId}`);
  
      if (response.data.post.quoteOf) {
        axios
          .get(`http://localhost:5000/posts/post/${response.data.post.quoteOf}`)
          .then((response) => {
            setQuotedPost(response.data.post);
          });
      }
    } catch (error) {
      // Handle error
    }
  };
  
  useEffect(() => {
    fetchPost();
    fetchQuotedPost();
    fetchReplyTo();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);
  

  useEffect(() => {
    if (user && !verified) {
      navigate("/email-verification-error");
    }
  }, [user, verified, navigate]);

  useEffect(() => {
    const jwtToken = localStorage.getItem("jwtToken");
    if (jwtToken) {
      const decodedToken = jwt_decode(jwtToken);
      setLoggedInUserId(decodedToken.userId);
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const username = localStorage.getItem("loggedInUsername");
      try {
        const response = await axios.get(
          `http://localhost:5000/users/${username}`
        );
        setUser(response.data.user);
        setVerified(response.data.user.isVerified);
      } catch (error) {
        // Gérer l'erreur de récupération du profil, par exemple, afficher un message d'erreur ou rediriger vers une page d'erreur
        toast.error("Erreur lors de la récupération du profil.");
      }
    };

    fetchProfile();
  }, []);


  useEffect(() => {
    if (user) {
      if (user.likes.includes(postId)) {
        setIsLiked(true);
      }
      if (user.reposts.some((repost) => repost.post === postId)) {
        setIsReposted(true);
      }
    }
  }, [user, postId]);

  useEffect(() => {
      // Fonction pour récupérer les réponses du post depuis le backend
  const fetchReplies = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/posts/post/${postId}/replies`
      );
      setReplies(response.data.replies);
    } catch (error) {
      toast.error("Erreur lors de la récupération des réponses.");
    }
  };

  fetchReplies();
  }, [postId]);

  // Fonction pour gérer la soumission du formulaire de citation
  const handleQuoteSubmit = async (e) => {
    e.preventDefault();

    try {
      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) {
        toast.error("Vous devez être connecté pour citer un post.");
        return;
      }

      // Créez un nouvel objet FormData pour envoyer les données du formulaire
      const formData = new FormData();
      formData.append("content", quoteContent);
      formData.append("quoteOf", postId); // Ajoutez l'ID du post que vous citez

      // Envoyez une requête POST au backend pour ajouter le post cité
      await axios.post("http://localhost:5000/posts", formData, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      // Fermez le formulaire de citation après le succès
      setQuoteModalOpen(false);
      setQuoteContent("");

      toast.success("Post cité avec succès !");
    } catch (error) {
      toast.error("Erreur lors de la citation du post.");
    }
  };

  const handleQuoteClick = () => {
    setQuoteModalOpen(true);
  };

  const handleLikeClick = async () => {
    try {
      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) {
        toast.error("Vous devez être connecté pour aimer un post.");
        return;
      }

      if (isLiked) {
        // Unlike the post
        await axios.post(
          `http://localhost:5000/posts/like/${postId}`,
          { userId: loggedInUserId },
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );
        setLikeCount((prevCount) => prevCount - 1);
      } else {
        // Like the post
        await axios.post(
          `http://localhost:5000/posts/like/${postId}`,
          { userId: loggedInUserId },
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );
        setLikeCount((prevCount) => prevCount + 1);
      }

      setIsLiked((prevIsLiked) => !prevIsLiked);
    } catch (error) {
      toast.error("Erreur lors du traitement de l'action Like.");
    }
  };

  const handleRepostClick = async () => {
    try {
      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) {
        toast.error("Vous devez être connecté pour re-poster un post.");
        return;
      }

      if (isReposted) {
        // Un-repost the post
        await axios.post(
          `http://localhost:5000/posts/repost/${postId}`,
          { userId: loggedInUserId },
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        setRepostCount((prevCount) => prevCount - 1);
        setIsReposted((prevIsReposted) => !prevIsReposted);
      } else {
        // Repost the post
        await axios.post(
          `http://localhost:5000/posts/repost/${postId}`,
          { userId: loggedInUserId },
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );
        setRepostCount((prevCount) => prevCount + 1);
        setIsReposted((prevIsReposted) => !prevIsReposted);
      }
    } catch (error) {
      toast.error("Erreur lors du traitement de l'action Repost.");
    }
  };

  if (!post) {
    return <p>Loading Post...</p>;
  }

  const handleDeletePost = async () => {
    try {
      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) {
        toast.error("Vous devez être connecté pour supprimer un post.");
        return;
      }

      // Envoyez une requête DELETE au backend pour supprimer le post
      const response = await axios.delete(
        `http://localhost:5000/posts/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      toast.success(response.data.message);
      navigate("/");
      window.location.reload();
    } catch (error) {
      toast.error("Erreur lors de la suppression du post.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMediaContainerClass = (numMedia) => {
    if (numMedia === 1) {
      return "media-container-single";
    } else {
      return `grid ${getImageGridClass(numMedia)} gap-4`;
    }
  };

  const getImageGridClass = (numImages) => {
    switch (numImages) {
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-2 sm:grid-cols-3";
      case 4:
        return "grid-cols-2 sm:grid-cols-4";
      default:
        return "grid-cols-2"; // For 4 images or more, use 2 columns
    }
  };

  const getImageClass = (numImages) => {
    if (numImages > 1) {
      return "w-full h-auto";
    }
    return "w-full h-full";
  };

    // Fonctions pour ouvrir les modaux
    const handleLikesClick = () => {
      setShowLikesModal(true);
    };
  
    const handleRepostsClick = () => {
      setShowRepostsModal(true);
    };
  
    const handleQuotesClick = () => {
      setShowQuotesModal(true);
    };

    const handlePostClick = (quote) => {
      navigate(`/post/${quote._id}`);
      window.location.reload();
    };

  const hasMedia = post.media && post.media.length > 0;
 
  // Fonction pour gérer la soumission du formulaire de réponse
  const handleReplySubmit = async (e) => {
    e.preventDefault();

    try {
      // Créez un nouvel objet FormData pour envoyer les données du formulaire
      const formData = new FormData();
      formData.append("content", content);
      formData.append("postId", postId); // Ajoutez l'ID du post auquel vous répondez

      // Ajoutez tous les fichiers sélectionnés à l'objet FormData
      selectedFiles.forEach((file, index) => {
        formData.append("media", file); // Utilisez un seul nom de champ pour tous les fichiers
      });

      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) {
        toast.error("Vous devez être connecté pour répondre à un post.");
        return;
      }

      // Envoyez une requête POST au backend pour ajouter la réponse
      await axios.post(`http://localhost:5000/posts/${postId}/reply`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      // Fermez le formulaire de réponse après le succès
      setContent("");
      setSelectedFiles([]);
      setReplyModalOpen(false);


      toast.success("Réponse ajoutée avec succès !");
    } catch (error) {
      toast.error("Erreur lors de l'ajout de la réponse.");
    }
  };

      // Fonction pour gérer la sélection de fichiers
      const handleFileSelect = (acceptedFiles) => {
        // Limitez le nombre de fichiers sélectionnés à 4 (images et vidéos)
        setSelectedFiles(acceptedFiles.slice(0, 4));
      };

  // Fonction pour ouvrir le modal de réponse
  const handleReplyClick = () => {
    setReplyModalOpen(true);
  };

  return (
    <div className="container mx-auto">
      {showLikesModal && (
        <LikesComponent
          postId={postId}
          setShowLikesModal={setShowLikesModal}
        />
      )}
      {showRepostsModal && (
        <RepostsComponent
          postId={postId}
          setShowRepostsModal={setShowRepostsModal}
        />
      )}
      {showQuotesModal && (
        <QuotesComponent
          postId={postId}
          setShowQuotesModal={setShowQuotesModal}
        />
      )}

      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-md p-4 relative mb-4">
      <h2 className="text-3xl font-bold my-4">Post</h2>
      {repliedPost && (
                  <div
                  key={repliedPost._id}
                  className={
                    repliedPost.media.length === 1
                      ? "post-container-single"
                      : repliedPost.media.length === 2
                      ? "post-container-two"
                      : repliedPost.media.length === 3
                      ? "post-container-three"
                      : repliedPost.media.length === 4
                      ? "post-container-four"
                      : "" // Ajoutez une classe vide pour les autres cas
                  }
                  style={
                    {
                      marginTop: "1rem",
                      marginBottom: "1rem",
                    }
                  }
                >
                  <Post key={repliedPost._id} post={repliedPost} />
                </div>
                ) 
      }
      </div>
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-md p-4 relative">
      <div>
        {repliedPost && (
          <p className="text-gray-500">
            Reply to{" "}
            <Link to={`/${repliedPost.user?.username}`}>
              @{repliedPost.user?.username}
            </Link>
          </p>
        )}
      </div>
        {hasMedia && (
          <div className="absolute top-0 right-0 mt-2 mr-2">
            <GiPaperClip size={24} />
          </div>
        )}
        <div className="flex items-center mb-4">
          <img
            src={`http://localhost:5000/avatars/${post.user?.avatar}`}
            alt={`Avatar de ${post.user?.username}`}
            width={50}
            className="rounded-full mr-2"
          />
          <Link to={`/${post.user?.username}`} className="text-blue-500">
            @{post.user?.username}
          </Link>
        </div>
        <p>{post.content}</p>
        <div className={getMediaContainerClass(post.media.length)}>
          {post.media.map((mediaUrl) => {
            const extension = mediaUrl.split(".").pop();
            const isVideo = ["mp4", "avi", "mkv", "mov"].includes(
              extension.toLowerCase()
            );

            return isVideo ? (
              <div key={mediaUrl} className="rounded shadow-md media-item">
                <video
                  src={`http://localhost:5000/posts/media/${mediaUrl}`}
                  controls
                  className={getImageClass(post.media.length)}
                  style={{
                    borderRadius: "16px",
                  }}
                />
              </div>
            ) : (
              <div key={mediaUrl} className="rounded shadow-md media-item">
                <img
                  src={`http://localhost:5000/posts/media/${mediaUrl}`}
                  alt={mediaUrl}
                  className={getImageClass(post.media.length)}
                />
              </div>
            );
          })}
        </div>
        <p className="mt-4">Le {formatDate(post.createdAt)}</p>
        {post.edited === true && (
          <span className="italic text-gray-500"> (edited)</span>
        )}
       
        {quotedPost && (
          <div className="mt-8 border-t-2 border-gray-300 pt-8 max-w-lg bg-gray-100 rounded-lg p-4 mx-auto"
          onClick={() => handlePostClick(quotedPost)}
          >
                    <div className="flex items-center mb-4">
          <img
            src={`http://localhost:5000/avatars/${quotedPost.user?.avatar}`}
            alt={`Avatar de ${quotedPost.user?.username}`}
            width={50}
            className="rounded-full mr-2"
          />
          <Link to={`/${quotedPost.user?.username}`} className="text-blue-500">
            @{quotedPost.user?.username}
          </Link>
          <span className="mx-2">&#183;</span>
        <p className="text-gray-500">{formatDate(post.createdAt)}</p>
        </div>
        <div>
            <p>{quotedPost.content}</p>
            <div className={getMediaContainerClass(post.media.length)}>
          {quotedPost.media.map((mediaUrl) => {
            const extension = mediaUrl.split(".").pop();
            const isVideo = ["mp4", "avi", "mkv", "mov"].includes(
              extension.toLowerCase()
            );

            return isVideo ? (
              <div key={mediaUrl} className="rounded shadow-md media-item">
                <video
                  src={`http://localhost:5000/posts/media/${mediaUrl}`}
                  controls
                  className={getImageClass(quotedPost.media.length)}
                  style={{
                    borderRadius: "16px",
                    width: "100%",
                  }}
                />
              </div>
            ) : (
              <div key={mediaUrl} className="rounded shadow-md media-item">
                <img
                  src={`http://localhost:5000/posts/media/${mediaUrl}`}
                  alt={mediaUrl}
                  className={getImageClass(quotedPost.media.length)}
                />
              </div>
            );
          })}
        </div>
        </div>
          </div>
        )}
<div className="flex items-center justify-start mt-2">
  {/* Afficher le bouton Like et le nombre de likes */}
  <div className="flex items-center mr-6">
    <button onClick={handleLikeClick} className="flex items-center">
      <GiHearts
        size={24}
        className={`mr-2 ${isLiked ? "text-red-500" : "text-gray-500"}`}
      />
    </button>
    <span onClick={handleLikesClick} className="text-gray-500">{likeCount}</span>
  </div>
  {/* Afficher le bouton Repost et le nombre de reposts */}
  <div className="flex items-center mr-6">
    <button onClick={handleRepostClick} className="flex items-center">
      <BsFillArrowUpSquareFill
        size={24}
        className={`mr-2 ${isReposted ? "text-green-500" : "text-gray-500"}`}
      />
    </button>
    <span onClick={handleRepostsClick} className="text-gray-500">{repostCount}</span>
  </div>
  {/* Afficher le bouton Quote */}
  <div className="flex items-center">
    <button onClick={handleQuoteClick} className="flex items-center">
      <GiChatBubble size={24} className="mr-2 text-gray-500" />
    </button>
    <span onClick={handleQuotesClick} className="text-gray-500">{quoteCount} Quote</span>
  </div>
  {/* Afficher le bouton Reply, fixé tout à droite*/}
  <div className="flex items-center ml-auto">
        <button onClick={handleReplyClick} className="flex items-center">
          <GiChatBubble size={24} className="mr-2 text-gray-500" />
        </button>
        <span onClick={handleReplyClick} className="text-gray-500">
          {replyCount}
        </span>
      </div>
</div>
{replies.map((reply) => (
          <div
          key={reply._id}
          className={
            reply.media.length === 1
              ? "post-container-single"
              : reply.media.length === 2
              ? "post-container-two"
              : reply.media.length === 3
              ? "post-container-three"
              : reply.media.length === 4
              ? "post-container-four"
              : "" // Ajoutez une classe vide pour les autres cas
          }
          style={
            {
              marginTop: "1rem",
            }
          }
        >
          <Post key={reply._id} post={reply} />
        </div>
      ))}
{quoteModalOpen && (
  <div className="quote-modal fixed top-0 left-0 h-screen w-screen flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-4 rounded-lg">
      <h2 className="text-lg font-bold mb-4">Quote this post</h2>
      <form onSubmit={handleQuoteSubmit}>
        <textarea
          value={quoteContent}
          onChange={(e) => setQuoteContent(e.target.value)}
          placeholder="Enter your quote here..."
          required
          className="w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:border-blue-500"
        />
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Quote
          </button>
          <button
            type="button"
            onClick={() => setQuoteModalOpen(false)}
            className="px-4 py-2 ml-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}
      {replyModalOpen && (
        <div className="reply-modal fixed top-0 left-0 h-screen w-screen flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg">
            <h2 className="text-lg font-bold mb-4">Reply to this post</h2>
            <form onSubmit={handleReplySubmit}>
              <textarea
              id="content"
                placeholder="Reply here..."
                className="w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:border-blue-500"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required={!selectedFiles.length} // Rendre le champ requis s'il n'y a pas de média attaché
              />
                      <div className="form-group">
          <Dropzone onDrop={handleFileSelect} accept={["image/*", "video/*"]} multiple>
            {({ getRootProps, getInputProps }) => (
              <div className="dropzone border-dashed border-2 border-gray-300 rounded p-4" {...getRootProps()}>
                <input {...getInputProps()} name="media" />
                <p className="mb-2">
                  Faites glisser jusqu'à 4 fichiers ici ou cliquez pour les télécharger
                </p>
              </div>
            )}
          </Dropzone>
          </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Répondre
                </button>
                <button
                  type="button"
                  onClick={() => setReplyModalOpen(false)}
                  className="px-4 py-2 ml-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
         {loggedInUserId &&
          user &&
          loggedInUserId === user._id &&
          (user._id === post.user._id || user.role === "admin") && (
            <div className="mt-4">
              <button
                onClick={handleDeletePost}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Supprimer
              </button>
              <button
                onClick={() => navigate(`/post/${postId}/edit`)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ml-2"
              >
                Modifier
              </button>
            </div>
          )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default PostPage;
