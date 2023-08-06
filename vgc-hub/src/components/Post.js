import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/post.css";
import { toast } from "react-toastify";
import { GiPaperClip, GiHearts, GiChatBubble } from "react-icons/gi";
import { BsFillArrowUpSquareFill } from "react-icons/bs";
import axios from "axios";
import jwt_decode from "jwt-decode";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Post = ({ post }) => {
  const navigate = useNavigate();
  const [quotedPost, setQuotedPost] = useState(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteContent, setQuoteContent] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [repostCount, setRepostCount] = useState(0);
  const [loggedInUserId, setLoggedInUserId] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [quoteCount, setQuoteCount] = useState(0);
  const [replyCount, setReplyCount] = useState(0);
  const [repliedPost, setRepliedPost] = useState(null);

  const handleQuoteClick = () => {
    setQuoteModalOpen(true);
  };

  useEffect(() => {
    const jwtToken = localStorage.getItem("jwtToken");
    if (jwtToken) {
      const username = localStorage.getItem("loggedInUsername");

      // Requête pour récupérer les informations complètes de l'utilisateur
      axios
        .get(`${BACKEND_URL}/users/${username}`)
        .then((response) => {
          setLoggedInUser(response.data.user);
        })
        .catch((error) => {
          console.error("Error fetching user:", error);
        });
    }
  }, []);

  useEffect(() => {
    if (loggedInUser) {
      if (loggedInUser.likes.includes(post._id)) {
        setIsLiked(true);
      }
      if (loggedInUser.reposts.some((repost) => repost.post === post._id)) {
        setIsReposted(true);
      }
    }
  }, [loggedInUser, post._id]);

  useEffect(() => {
    if (post.quoteOf) {
      axios
        .get(`${BACKEND_URL}/posts/post/${post.quoteOf}`)
        .then((response) => {
          setQuotedPost(response.data.post);
        })
        .catch((error) => {
          console.error("Error fetching quoted post:", error);
        });
    }
  }, [post.quoteOf]);

  useEffect(() => {
    const jwtToken = localStorage.getItem("jwtToken");
    if (jwtToken) {
      const decodedToken = jwt_decode(jwtToken);
      setLoggedInUserId(decodedToken.userId);
    }
  }, []);

  useEffect(() => {
    // si le post a un champ likes
    if (post.likes) {
      // Comptez le nombre de likes du post en faisant la somme des éléments du tableau
      setLikeCount(post.likes.length);
    }

    // si le post a un champ reposts
    if (post.reposts) {
      // Comptez le nombre de reposts du post en faisant la somme des éléments du tableau
      setRepostCount(post.reposts.length);
    }

    // si le post a un champ quotes
    if (post.quotes) {
      // Comptez le nombre de citations du post en faisant la somme des éléments du tableau
      setQuoteCount(post.quotes.length);
    }

    // si le post a un champ replies
    if (post.replies) {
      // Comptez le nombre de réponses du post en faisant la somme des éléments du tableau
      setReplyCount(post.replies.length);
    }
  }, [post]);

  // fetch le post du replyTo
  useEffect(() => {
    if (post.replyTo) {
      axios
        .get(`${BACKEND_URL}/posts/post/${post.replyTo}`)
        .then((response) => {
          setRepliedPost(response.data.post);
        })
        .catch((error) => {
          console.error("Error fetching replied post:", error);
        });
    }
  }, [post.replyTo]);

  const handlePostClick = () => {
    navigate(`/post/${post._id}`);
    window.location.reload();
  };

  const handleQuotedPostClick = (quotedPost) => {
    navigate(`/post/${quotedPost._id}`);
    window.location.reload();
  };

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
      formData.append("quoteOf", post._id); // Ajoutez l'ID du post que vous citez

      // Envoyez une requête POST au backend pour ajouter le post cité
      await axios.post(`${BACKEND_URL}/posts`, formData, {
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
          `${BACKEND_URL}/posts/like/${post._id}`,
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
          `${BACKEND_URL}/posts/like/${post._id}`,
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
          `${BACKEND_URL}/posts/repost/${post._id}`,
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
          `${BACKEND_URL}/posts/repost/${post._id}`,
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
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " "
    );
  };

  const getMediaContainerClass = (numMedia) => {
    switch (numMedia) {
      case 1:
        return "media-container-single";
      case 2:
        return "media-container-two";
      case 3:
        return "media-container-three";
      case 4:
        return "media-container-four";
      default:
        return "post-media"; // Utilisez la classe par défaut pour 5 médias ou plus
    }
  };

  const getQuotedMediaContainerClass = (numMedia) => {
    switch (numMedia) {
      case 1:
        return "media-container-single-quoted";
      case 2:
        return "media-container-two-quoted";
      case 3:
        return "media-container-three-quoted";
      case 4:
        return "media-container-four-quoted";
      default:
        return "post-media"; // Utilisez la classe par défaut pour 5 médias ou plus
    }
  };

  const getMediaItemClass = (numMedia, index) => {
    if (numMedia === 3) {
      if (index === 0) {
        return "media-item media-item-large";
      }
    }
    return "media-item";
  };


  

  return (
    <div className="post relative">
      <div>
        {post.isReposted && (
          <p className="text-gray-500">
            Reposted by{" "}
            <Link to={`/${post.repostUsername}`}>{post.repostUsername}</Link>
          </p>
        )}
      </div>
      <div>
      {repliedPost && (
  <p className="text-gray-500">
    Reply to{" "}
    {repliedPost.user?.username ? (
      <Link to={`/${repliedPost.user.username}`}>
        @{repliedPost.user.username}
      </Link>
    ) : (
      "deleted-user"
    )}
  </p>
)}
      </div>
      <div className="flex items-start mb-4 relative">
        {post.media && post.media.length > 0 && (
          <div className="absolute top-0 right-0 mt-2 mr-2 text-gray-500">
            <GiPaperClip size={24} />
          </div>
        )}
        <img
          src={`${BACKEND_URL}/avatars/${post.user?.avatar}`}
          alt={`Avatar de ${post.user?.username}`}
          width={50}
          className="rounded-full mr-2"
        />
        <Link to={`/${post.user?.username}`} className="text-blue-500">
          @{post.user?.username}
        </Link>
        <span className="mx-2">&#183;</span>
        <p className="text-gray-500">{formatDate(post.createdAt)}</p>
        {post.edited === true && (
          <span className="italic text-gray-500 ml-1"> (edited)</span>
        )}
      </div>
      <div onClick={handlePostClick}>
        <p>{post.content}</p>
        {post.media && post.media.length > 0 && (
          <div
            className={`media-container ${getMediaContainerClass(
              post.media.length
            )}`}
          >
            {post.media.map((mediaUrl, index) => {
              const extension = mediaUrl.split(".").pop();
              const isVideo = ["mp4", "avi", "mkv", "mov"].includes(
                extension.toLowerCase()
              );

              return (
                <div
                  key={mediaUrl}
                  className={`${getMediaItemClass(post.media.length, index)} ${
                    isVideo ? "media-item-video" : "media-item-image"
                  }`}
                >
                  {isVideo ? (
                    <video
                      src={`${BACKEND_URL}/posts/media/${mediaUrl}`}
                      controls
                      style={{
                        borderRadius: "16px",
                        marginBottom: "16px",
                      }}
                    />
                  ) : (
                    <img
                      src={`${BACKEND_URL}/posts/media/${mediaUrl}`}
                      alt={mediaUrl}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {quotedPost && (
          <div className="mt-8 border-t-2 border-gray-300 pt-8 max-w-lg bg-gray-100 rounded-lg p-4"
          onClick={() => handleQuotedPostClick(quotedPost)}
          >
                    <div className="flex items-center mb-4">
          <img
            src={`${BACKEND_URL}/avatars/${quotedPost.user?.avatar}`}
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
        </div>
        <div
        style={
{
  width: "30%",
}
        }
        className={`media-container-quoted ${getQuotedMediaContainerClass(
          quotedPost.media.length
        )}`}
        >
          {quotedPost.media.map((mediaUrl) => {
            const extension = mediaUrl.split(".").pop();
            const isVideo = ["mp4", "avi", "mkv", "mov"].includes(
              extension.toLowerCase()
            );

            return isVideo ? (
              <div key={mediaUrl} className="rounded shadow-md media-item">
                <video
                  src={`${BACKEND_URL}/posts/media/${mediaUrl}`}
                  controls
                  style={{
                    borderRadius: "16px",
                    width: "100%",
                  }}
                />
              </div>
            ) : (
              <div key={mediaUrl} className="rounded shadow-md media-item">
                <img
                  src={`${BACKEND_URL}/posts/media/${mediaUrl}`}
                  alt={mediaUrl}
                  style={{
                    width: "50%",
                  }}
                />
              </div>
            );
          })}
        </div>
          </div>
        )}
<div className="flex items-center justify-between mt-2">
  {/* Afficher le bouton Like et le nombre de likes */}
  <div className="flex items-center mr-6">
    <button onClick={handleLikeClick} className="flex items-center">
      <GiHearts
        size={24}
        className={`mr-2 ${isLiked ? "text-red-500" : "text-gray-500"}`}
      />
      <span className="text-gray-500">{likeCount}</span>
    </button>
  </div>
  {/* Afficher le bouton Repost et le nombre de reposts */}
  <div className="flex items-center mr-6">
    <button onClick={handleRepostClick} className="flex items-center">
      <BsFillArrowUpSquareFill
        size={24}
        className={`mr-2 ${isReposted ? "text-green-500" : "text-gray-500"}`}
      />
      <span className="text-gray-500">{repostCount}</span>
    </button>
  </div>
  {/* Afficher le bouton Quote */}
  <div className="flex items-center">
    <button onClick={handleQuoteClick} className="flex items-center">
      <GiChatBubble size={24} className="mr-2 text-gray-500" />
      <span className="text-gray-500">{quoteCount} Quote</span>
    </button>
  </div>
  {/* Afficher le bouton Reply, fixé tout à droite*/}
  <div className="flex items-center ml-auto">
    <button onClick={handlePostClick} className="flex items-center">
      <GiChatBubble size={24} className="mr-2 text-gray-500" />
    </button>
    <span onClick={handlePostClick} className="text-gray-500">
      {replyCount}
    </span>
  </div>
</div>


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


    </div>
  );
};

export default Post;
