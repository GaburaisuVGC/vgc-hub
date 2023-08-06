import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dropzone from "react-dropzone";
import "../styles/homepage.css";
import Post from "./Post";
import jwt_decode from "jwt-decode";

const HomePage = () => {
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loggedInUserId, setLoggedInUserId] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const jwtToken = localStorage.getItem("jwtToken");
        let response;

        if (!jwtToken) {
          response = await axios.get("http://localhost:5000/posts");
        } else {
          const decodedToken = jwt_decode(jwtToken);
          setLoggedInUserId(decodedToken.userId);
          response = await axios.get("http://localhost:5000/posts/timeline", {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          });
        }

        const allPosts = response.data.posts;

        // Utiliser un objet pour garder trace des posts et de leur date de création
        const uniquePosts = {};
        allPosts.forEach((post) => {
          const postId = post._id.toString();
          if (!uniquePosts[postId] || new Date(post.createdAt) > new Date(uniquePosts[postId].createdAt)) {
            uniquePosts[postId] = post;
          }
        });

        // Transformer l'objet en array pour l'envoyer dans la réponse
        const sortedPosts = Object.values(uniquePosts);

        // Trier les posts par ordre décroissant en fonction de la date de création
        sortedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setTimeline(sortedPosts);
      } catch (error) {
        toast.error("Erreur lors de la récupération des posts.");
      }
    };

    fetchPosts();
  }, [loggedInUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("content", content);

      selectedFiles.forEach((file, index) => {
        formData.append("media", file);
      });

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

      setContent("");
      setSelectedFiles([]);

      toast.success(response.data.message);
    } catch (error) {
      toast.error("Erreur lors de l'ajout du post.");
    }
  };

  const handleFileSelect = (acceptedFiles) => {
    setSelectedFiles(acceptedFiles.slice(0, 4));
  };



  return (
    <div className="container-1 mx-auto px-4 py-8">
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
            required={!selectedFiles.length}
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
      {timeline.length > 0 ? (
        <div className="grid gap-4 grid-cols-1">
          {timeline.map((post) => (
            <div
              key={post._id}
              className={
                post.media.length === 1
                  ? "post-container-single"
                  : post.media.length === 2
                  ? "post-container-two"
                  : post.media.length === 3
                  ? "post-container-three"
                  : post.media.length === 4
                  ? "post-container-four"
                  : ""
              }
            >
              <Post key={post._id} post={post} />
            </div>
          ))}
        </div>
      ) : (
        <p>Aucun post trouvé.</p>
      )}
      <ToastContainer />
    </div>
  );
};

export default HomePage;
