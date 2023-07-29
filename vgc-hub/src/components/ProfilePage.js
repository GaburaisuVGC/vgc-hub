import React, { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProfilePage = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState("");
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const jwtToken = localStorage.getItem("jwtToken");
    if (jwtToken) {
      const decodedToken = jwt_decode(jwtToken);
      setLoggedInUserId(decodedToken.userId);
    }
  }, []);

  useEffect(() => {
    if (user && !verified) {
      navigate("/email-verification-error");
    }
  }, [user, verified, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/users/${username}`
        );
        setUser(response.data.user);
        setVerified(response.data.user.isVerified);
      } catch (error) {
        // Gérer l'erreur de récupération du profil, par exemple, afficher un message d'erreur ou rediriger vers une page d'erreur
        toast.error("Erreur lors de la récupération du profil.");
      }
    };

    fetchProfile();
  }, [username]);
  const handleLogout = () => {
    // Clear the JWT token from localStorage or cookies (adjust this based on your token storage approach)
    localStorage.removeItem("jwtToken"); // If you stored the token in localStorage
    // document.cookie = 'jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'; // If you stored the token in cookies

    // Redirect to the login page after logout
    navigate("/login");
  };

  return (
    <div>
      {user ? (
        <div>
          <h2>{user.username}'s Profile</h2>
          <img
            src={`http://localhost:5000/avatars/${user.avatar}`}
            alt="Avatar de l'utilisateur"
            style={{ width: "200px", height: "200px" }}
          />
          {loggedInUserId && user && loggedInUserId === user._id && (
            <div>
              <Link to={`/edit/${user.username}`}>Modifier le Profil</Link>
              <button onClick={handleLogout}>Déconnexion</button>
            </div>
          )}
        </div>
      ) : (
        <p>Loading Profile...</p>
      )}
      <ToastContainer />
    </div>
  );
};

export default ProfilePage;
