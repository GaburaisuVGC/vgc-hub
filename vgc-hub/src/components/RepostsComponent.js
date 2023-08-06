import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RepostsComponent = ({ postId, setShowRepostsModal }) => {
  const [reposts, setReposts] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/posts/post/${postId}/reposts`).then((response) => {
      setReposts(response.data.reposts);
    });
  }, [postId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur">
      <div className="modal-content bg-white p-6 rounded-lg shadow-lg">
      <button
          className="mt-4 mb-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          onClick={() => setShowRepostsModal(false)}
        >
          Close
        </button>
        <h2 className="text-lg font-bold mb-4">Reposts ({reposts.length})</h2>
        <ul>
          {reposts.map((user) => (
            <li key={user._id} className="flex items-center mb-2">
              <img
                src={`http://localhost:5000/avatars/${user?.avatar}`}
                alt={`Avatar de ${user?.username}`}
                width={50}
                className="rounded-full mr-2"
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

export default RepostsComponent;
