import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jwt_decode from "jwt-decode";

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

  return (
    <div>
      <h2>Post</h2>
      <p>{post.content}</p>
      <p>Créé le: {post.createdAt}</p>
      {/* Afficher le nom d'utilisateur de l'utilisateur ayant créé le post, précédé d'un @, avec un lien cliquable pour arriver sur "/:username" */}
        <Link to={`/${post.user?.username}`}>@{post.user?.username}</Link>
      {/* Afficher son avatar image avec src (http://localhost:5000/avatars/${user.avatar}) */}
      <img
        src={`http://localhost:5000/avatars/${post.user?.avatar}`}
        alt={`Avatar de ${post.user?.username}`}
        width={50}
      />
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
            width={320}
            height={240}
          />
        ) : (
          <img
            key={mediaUrl}
            src={`http://localhost:5000/posts/media/${mediaUrl}`}
            alt={mediaUrl}
            width={200}
          />
        );
      })}
      {/* Affichez les boutons Modifier et Supprimer uniquement si l'utilisateur est connecté et est l'auteur du post ou s'il est administrateur */}
      {loggedInUserId && user && loggedInUserId === user._id && (user._id === post.user._id || user.role === "admin") && (
        <div>
          <button onClick={handleDeletePost}>Supprimer</button>
          {/* Ajoutez ici le bouton Modifier avec la logique pour rediriger vers la page d'édition du post */}
            <Link to={`/post/${postId}/edit`}>Modifier</Link>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default PostPage;