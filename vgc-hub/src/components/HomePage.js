import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dropzone from "react-dropzone";
import "../styles/homepage.css";
import Post from "./Post";
import jwt_decode from "jwt-decode";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const HomePage = () => {
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loggedInUserId, setLoggedInUserId] = useState("");
  const [remainingChars, setRemainingChars] = useState(500);
  const [viewMode, setViewMode] = useState("timeline");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const jwtToken = localStorage.getItem("jwtToken");
        let response;

        if (viewMode === "timeline") {
          if (!jwtToken) {
            setViewMode("latest");
            response = await axios.get(`${BACKEND_URL}/posts`);
          }
          const decodedToken = jwt_decode(jwtToken);
          setLoggedInUserId(decodedToken.userId);
          response = await axios.get(`${BACKEND_URL}/posts/timeline`, {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          });
        } else {
          response = await axios.get(`${BACKEND_URL}/posts`);
        }

        const uniquePosts = {};
        response.data.posts.forEach((post) => {
          const postId = post._id.toString();
          if (!uniquePosts[postId] || new Date(post.createdAt) > new Date(uniquePosts[postId].createdAt)) {
            uniquePosts[postId] = post;
          }
        });

        const sortedPosts = Object.values(uniquePosts);

        sortedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setTimeline(sortedPosts);
      } catch (error) {
        // Handle error if needed
      }
    };

    fetchPosts();
  }, [viewMode, loggedInUserId]);


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
        toast.error("You must be logged in to add a post.");
        return;
      }

      const response = await axios.post(
        `${BACKEND_URL}/posts`,
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
      toast.error("Error adding the post.");
    }
  };

  const handleFileSelect = (acceptedFiles) => {
    const REACT_APP_MAX_FILE_SIZE = process.env.REACT_APP_MAX_FILE_SIZE || 10 * 1024 * 1024;

    const selectedFiles = acceptedFiles.slice(0, 4);
    const oversizedFiles = selectedFiles.filter((file) => file.size > REACT_APP_MAX_FILE_SIZE);

    if (oversizedFiles.length > 0) {
      toast.error(`Some files exceed the maximum allowed size (${REACT_APP_MAX_FILE_SIZE} bytes).`);
      return;
    }

    setSelectedFiles(selectedFiles);
  };

  const handleContentChange = (e) => {
    const inputContent = e.target.value;
    const maxLength = 500;
    setRemainingChars(maxLength - inputContent.length);
    setContent(inputContent.slice(0, maxLength));
  };

  // array of random placeholders
  const placeholders = [
    "What's on your mind?",
    "How are you feeling?",
    "What's happening?",
    "What's new?",
    "Got any plans?",
    "Got any interesting calcs to share?",
    "What's your call for the next tournament?"
  ];

  return (
    <div className="container-1 mx-auto px-4 py-8 flex flex-col min-h-screen"
    style={{ paddingTop: "100px" }}
    >
      <h2 className="text-3xl font-bold mb-4">Timeline</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="form-group">
          <label htmlFor="content" className="block mb-2 font-bold">
            Send a post
          </label>
          <textarea
            id="content"
            placeholder={placeholders[Math.floor(Math.random() * placeholders.length)]}
            rows={5}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            value={content}
            onChange={handleContentChange}
            maxLength="500"
            required={!selectedFiles.length}
          />
          <div className="text-right text-gray-500">
            {remainingChars} characters remaining
          </div>
        </div>
        <div className="form-group">
          <Dropzone onDrop={handleFileSelect} accept={["image/*", "video/*"]} multiple>
            {({ getRootProps, getInputProps }) => (
              <div className="dropzone border-dashed border-2 border-gray-300 rounded p-4" {...getRootProps()}>
                <input {...getInputProps()} name="media" />
                {selectedFiles.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index}
                      >
                        <p className="text-sm font-bold text-center">
                          {file.name}
                        </p>
                        <p className="text-xs text-center">
                          {file.size / 1000} KB
                        </p>
                      </div>
                    ))}
                  </div>

                ) : (
                  <p className="mb-2">
                    Drag up to 4 files here or click to upload
                  </p>
                )}
              </div>
            )}
          </Dropzone>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Post
        </button>
      </form>
      <div className="mb-4">
        <button
          onClick={() => setViewMode("latest")}
          className={`mr-2 px-3 py-1 rounded ${
            viewMode === "latest" ? "bg-blue-500 text-white" : "bg-gray-300"
          }`}
        >
          Latest Posts
        </button>
        {loggedInUserId && (
        <button
          onClick={() => setViewMode("timeline")}
          className={`px-3 py-1 rounded ${
            viewMode === "timeline" ? "bg-blue-500 text-white" : "bg-gray-300"
          }`}
        >
          My Timeline
        </button>
      )}

      </div>
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
              <Post
                key={post._id}
                post={{
                  ...post,
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <p>No posts found.</p>
      )}
       
    </div>
  );
};

export default HomePage;
