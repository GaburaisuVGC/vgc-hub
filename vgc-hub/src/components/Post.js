import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/post.css";

const Post = ({ post }) => {
  const navigate = useNavigate();

  const handlePostClick = () => {
    navigate(`/post/${post._id}`);
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

  return (
    <div className="post" onClick={handlePostClick}>
      <p>
        <Link to={`/${post.user?.username}`}>@{post.user?.username}</Link>
      </p>
      <img
        src={`http://localhost:5000/avatars/${post.user?.avatar}`}
        alt={`Avatar de ${post.user?.username}`}
        width={50}
      />
      <p>{post.content}</p>
      <p>Le {formatDate(post.createdAt)}</p>
      {post.media && post.media.length > 0 && (
        <div className="post-media">
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
        </div>
      )}
    </div>
  );
};

export default Post;
