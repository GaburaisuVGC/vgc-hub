import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Sidebar = () => {
  const [searchUsername, setSearchUsername] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  let searchTimeout = null;

  useEffect(() => {
    const delayedSearch = () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      searchTimeout = setTimeout(() => {
        handleSearch();
      }, 1000);
    };

    delayedSearch();
  }, [searchUsername]);

  const handleSearch = async () => {
    try {
      if (searchUsername === "") {
        setSearchResults([]);
        return;
      }
      const response = await fetch(`${BACKEND_URL}/users/search/${searchUsername.toLowerCase()}`);
      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      toast.error("An error occurred while searching for users.");
    }
  };

  const handleInputChange = (e) => {
    const inputText = e.target.value;
    setSearchUsername(inputText);
  };

  return (
    <div className="container mx-auto" style={{ paddingTop: "100px" }}>
      <div className="p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">User Search</h2>
        <input
          type="text"
          value={searchUsername}
          onChange={handleInputChange}
          placeholder="Username"
          className="border p-2 rounded-md w-full mb-2"
        />
        {searchUsername && (
          <div className="bg-white p-4 rounded-md shadow-md">
            {searchResults && searchResults.length === 0 ? (
              <p className="text-gray-600">No users found.</p>
            ) : (
              <ul>
                {searchResults.map((user) => (
                  <li key={user._id} className="mb-1">
                    <Link to={`/${user.username.toLowerCase()}`} className="flex items-center text-blue-500 hover:underline">
                      <img
                        src={`${BACKEND_URL}/avatars/${user.avatar}`}
                        alt={`${user.username}'s avatar`}
                        width={50}
                        className="rounded-full mr-2"
                      />
                      <span className="font-semibold">{user.plainName}</span>
                      <span className="text-gray-500 ml-1">@{user.username.toLowerCase()}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default Sidebar;
