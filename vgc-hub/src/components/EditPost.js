import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const EditPost = () => {
  const { postId } = useParams();
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the post data by its ID
    const fetchPost = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/posts/post/${postId}`);
        setContent(response.data.post.content);
      } catch (error) {
        // Handle error if the post data couldn't be fetched
        toast.error("An error occurred while fetching the post.");
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
        toast.error("You must be logged in to update the post.");
        return;
      }

      await axios.put(
        `${BACKEND_URL}/posts/${postId}`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      toast.success("Post updated successfully!");
      navigate(`/post/${postId}`); // Redirect to the post's page after successful update
    } catch (error) {
      toast.error("An error occurred while updating the post.");
    }
  };

  return (
    <div className="container mx-auto flex flex-col min-h-screen" style={{ paddingTop: "100px" }}>
      <h2 className="text-3xl font-bold my-4">Edit Post</h2>
      <form onSubmit={handleUpdate} className="max-w-md mx-auto bg-white p-4 rounded-lg shadow-md">
        <div className="mb-4">
          <p className="mb-2 text-gray-600">Note: Attached media cannot be removed or modified. It's better to delete the post and create a new one.</p>
          <label htmlFor="content" className="block mb-2 font-medium text-gray-700">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
        >
          Update Post
        </button>
      </form>
       
    </div>
  );
};

export default EditPost;
