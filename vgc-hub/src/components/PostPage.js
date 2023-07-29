import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jwt_decode from "jwt-decode";
import "../styles/postpage.css"

const PostPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState("");
  const [user, setUser] = useState(null);
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/posts/post/${postId}`);
        setPost(response.data.post);
      } catch (error) {
        // Gérer l'erreur de récupération du post, par exemple, afficher un message d'erreur ou rediriger vers une page d'erreur
        toast.error("Erreur lors de la récupération du post.");
      }
    };

    fetchPost();
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

  const getImageGridClass = (numImages) => {
    switch (numImages) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-3";
      default:
        return "grid-cols-2"; // For 4 images or more, use 2 columns
    }
  };

  return (
    <div className="container mx-auto">
    <h2 className="text-3xl font-bold my-4">Post</h2>
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-md p-4">
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
      <div className={`grid ${getImageGridClass(post.media.length)} gap-4`}>
        {post.media.map((mediaUrl) => {
          const extension = mediaUrl.split(".").pop();
          const isVideo = ["mp4", "avi", "mkv", "mov"].includes(
            extension.toLowerCase()
          );

          return isVideo ? (
            <video
              key={mediaUrl}
              src={`http://localhost:5000/posts/media/${mediaUrl}`}
              controls
              className="rounded shadow-md media-item"
            />
          ) : (
            <img
              key={mediaUrl}
              src={`http://localhost:5000/posts/media/${mediaUrl}`}
              alt={mediaUrl}
              className="rounded shadow-md media-item"
            />
          );
        })}
      </div>
      <p className="mt-4">Le {formatDate(post.createdAt)}</p>
        {loggedInUserId && user && loggedInUserId === user._id && (user._id === post.user._id || user.role === "admin") && (
          <div className="mt-4">
            <button
              onClick={handleDeletePost}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Supprimer
            </button>
            <Link
              to={`/post/${postId}/edit`}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ml-2"
            >
              Modifier
            </Link>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default PostPage;
