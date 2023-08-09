import React, { useEffect, useState } from 'react';
import axios from 'axios';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LikesComponent = ({ postId, setShowLikesModal }) => {
  const [likes, setLikes] = useState([]);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/posts/post/${postId}/likes`).then((response) => {
      setLikes(response.data.likes);
    });
  }, [postId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur">
      <div className="modal-content bg-white p-6 rounded-lg shadow-lg">
      <button
          className="mt-4 mb-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          onClick={() => setShowLikesModal(false)}
        >
          Close
        </button>
        <h2 className="text-lg font-bold mb-4">Likes ({likes.length})</h2>
        <ul>
          {likes.map((user) => (
            <li key={user._id} className="flex items-center mb-2">
              <img
                src={`${BACKEND_URL}/avatars/${user?.avatar}`}
                alt={`Avatar de ${user?.username}`}
                width={50}
                className="rounded-full mr-2"
                style={{ background: user?.color || '' }}
              />
              <a href={`/${user.username}`} className="text-blue-500 hover:underline">
                @{user.username}
              </a>
            </li>
          ))}
        </ul>

      </div>
    </div>
  );
};

export default LikesComponent;
