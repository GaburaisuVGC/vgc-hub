import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Post from './Post';

const QuotesComponent = ({ postId, setShowQuotesModal }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/posts/post/${postId}/quotes`).then((response) => {
      setPosts(response.data.quotes);
    });
  }, [postId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur">
      <div className="modal-content bg-white p-6 rounded-lg shadow-lg">
      <button
          className="mt-4 mb-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          onClick={() => setShowQuotesModal(false)}
        >
          Close
        </button>
        <h2 className="text-lg font-bold mb-4">Quotes ({posts.length})</h2>
        <div className="grid gap-4 grid-cols-1">
          {posts.map((post) => (
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

      </div>
    </div>
  );
};
export default QuotesComponent;
