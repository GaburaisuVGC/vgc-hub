import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dropzone from "react-dropzone";
import { Link } from 'react-router-dom';


const HomePage = () => {
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [posts, setPosts] = useState([]);

  // Charger les posts et les utilisateurs lors du chargement de la page
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/posts");
      setPosts(response.data.posts);
    } catch (error) {
      toast.error("Erreur lors de la récupération des posts.");
    }
  };

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Créez un nouvel objet FormData pour envoyer les données du formulaire
      const formData = new FormData();
      formData.append("content", content);

      // Ajoutez tous les fichiers sélectionnés à l'objet FormData
      selectedFiles.forEach((file, index) => {
        formData.append("media", file); // Utilisez un seul nom de champ pour tous les fichiers
      });

      // Envoyez une requête POST au backend pour ajouter le post
      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) {
        toast.error("Vous devez être connecté pour ajouter un post.");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/posts",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      // Réinitialiser le formulaire après le succès
      setContent("");
      setSelectedFiles([]);

      toast.success(response.data.message);
    } catch (error) {
      toast.error("Erreur lors de l'ajout du post.");
    }
  };

  // Fonction pour gérer la sélection de fichiers
  const handleFileSelect = (acceptedFiles) => {
    // Limitez le nombre de fichiers sélectionnés à 4 (images et vidéos)
    setSelectedFiles(acceptedFiles.slice(0, 4));
  };

  return (
    <div>
      <h2>Page d'Accueil</h2>
      {posts.map((post) => (
        <div key={post._id}>
                      <Link to={`/post/${post._id}`}>
          {/* Afficher le nom d'utilisateur de l'utilisateur ayant créé le post, précédé d'un @, avec un lien cliquable pour arriver sur "/:username" */}
          <p>
      <Link to={`/${post.user?.username}`}>@{post.user?.username}</Link>
    </p>
          {/* Afficher son avatar image avec src (http://localhost:5000/avatars/${user.avatar}) */}
          <img
            src={`http://localhost:5000/avatars/${post.user?.avatar}`}
            alt={`Avatar de ${post.user?.username}`}
            width={50}
          />
          <p>{post.content}</p>
          <p>Créé le : {post.createdAt}</p>
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
          </Link>
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="content">Contenu</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <div>
          {/* Dropzone pour sélectionner les fichiers */}
          <Dropzone
            onDrop={handleFileSelect}
            accept={['image/*', 'video/*']}
            multiple
          >
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps()}>
                <input {...getInputProps()} name="media" />
                <p>
                  Faites glisser jusqu'à 4 fichiers ici ou cliquez pour les
                  télécharger
                </p>
              </div>
            )}
          </Dropzone>
        </div>
        <button type="submit">Ajouter le Post</button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default HomePage;
