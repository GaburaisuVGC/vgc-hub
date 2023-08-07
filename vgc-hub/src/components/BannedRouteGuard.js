import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import axios from "axios";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const BannedRouteGuard = ({ children }) => {
  const [userStatus, setUserStatus] = useState("");
  const [username, setUsername] = useState("");
  const [loggedInUserId, setLoggedInUserId] = useState("");

  useEffect(() => {
    const jwtToken = localStorage.getItem("jwtToken");
    if (jwtToken) {
      const decodedToken = jwt_decode(jwtToken);
      setLoggedInUserId(decodedToken.userId);
    }
  }, []); // Add an empty dependency array here to run only once when the component mounts

  useEffect(() => {
    // Only fetch user data when loggedInUserId is available
    if (loggedInUserId) {
      axios
        .get(`${BACKEND_URL}/users/id/${loggedInUserId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        })
        .then((response) => {
          setUserStatus(response.data.user.status);
          setUsername(response.data.user.username);
        })
        .catch((error) => {
          // Handle errors if needed
        });
    }
  }, [loggedInUserId]);

  if (userStatus === "banned") {
    // Use the Navigate component to redirect the user
    return <Navigate to={`/${username.toLowerCase()}`} />;
  }

  // Render the children if not banned
  return <>{children}</>;
};

export default BannedRouteGuard;
