import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/post.css";
import { GiPaperClip } from "react-icons/gi";

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
    }) + " ";
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

  const getMediaItemClass = (numMedia, index) => {
    if (numMedia === 3) {
      if (index === 0) {
        return "media-item media-item-large";
      }
    }
    return "media-item";
  };

  console.log(post)

  return (
    <div className="post" onClick={handlePostClick}>
      <div className="flex items-start mb-4 relative">
      {post.media && post.media.length > 0 && (
        <div className="absolute top-0 right-0 mt-2 mr-2 text-gray-500">
          <GiPaperClip size={24} />
        </div>
      )}
        <img
          src={`http://localhost:5000/avatars/${post.user?.avatar}`}
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
      <p>{post.content}</p>
      {post.media && post.media.length > 0 && (
        <div className={`media-container ${getMediaContainerClass(post.media.length)}`}>
          {post.media.map((mediaUrl, index) => {
            const extension = mediaUrl.split(".").pop();
            const isVideo = ["mp4", "avi", "mkv", "mov"].includes(extension.toLowerCase());

            return (
              <div
                key={mediaUrl}
                className={`${getMediaItemClass(post.media.length, index)} ${
                  isVideo ? "media-item-video" : "media-item-image"
                }`}
              >
                {isVideo ? (
                  <video
                    src={`http://localhost:5000/posts/media/${mediaUrl}`}
                    controls
                    style={{
                      borderRadius: "16px",
                      marginBottom: "16px",
                    }}
                  />
                ) : (
                  <img
                    src={`http://localhost:5000/posts/media/${mediaUrl}`}
                    alt={mediaUrl}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Post;
