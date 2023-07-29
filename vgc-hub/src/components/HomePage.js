import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dropzone from "react-dropzone";
import "../styles/homepage.css";
import Post from "./Post";

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
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-4">Home</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="form-group">
          <label htmlFor="content" className="block mb-2 font-bold">
            Contenu
          </label>
          <textarea
            id="content"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required={!selectedFiles.length} // Rendre le champ requis s'il n'y a pas de média attaché
          />
        </div>
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
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Ajouter le Post
        </button>
      </form>
      <div className="grid gap-4 grid-cols-1">
        {posts.map((post) => (
          <Post key={post._id} post={post} className="w-full" />
        ))}
      </div>

      <ToastContainer />
    </div>
  );
};

export default HomePage;
