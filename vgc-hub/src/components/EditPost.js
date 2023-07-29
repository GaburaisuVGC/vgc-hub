import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditPost = () => {
  const { postId } = useParams();
  const [content, setContent] = useState("");
    const navigate = useNavigate(); 

  useEffect(() => {
    // Fetch the post data by its ID
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/posts/post/${postId}`);
        setContent(response.data.post.content);
      } catch (error) {
        // Handle error if the post data couldn't be fetched
        toast.error("Une erreur est survenue lors de la récupération du post.");
      }
    };

    fetchPost();
  }, [postId]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      // Send a request to update the post content
      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) {
        toast.error("Vous devez être connecté pour mettre à jour le post.");
        return;
      }

      await axios.put(
        `http://localhost:5000/posts/${postId}`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      toast.success("Post mis à jour avec succès !");
      navigate(`/post/${postId}`); // Redirect to the post's page after successful update
    } catch (error) {
      toast.error("Une erreur est survenue lors de la mise à jour du post.");
    }
  };

  return (
    <div>
      <h2>Modifier le Post</h2>
      <form onSubmit={handleUpdate}>
        <div>
            <p>Information : Les médias attachés ne peuvent être retirés ou modifiés. Il est préférable de supprimer le post et en refaire un autre.</p>
          <label htmlFor="content">Contenu</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <button type="submit">Mettre à jour le Post</button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default EditPost;
