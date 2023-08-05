import React, { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Post from "./Post";

const ProfilePage = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState("");
  const [verified, setVerified] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const navigate = useNavigate();



      useEffect(() => {
        // Fonction pour récupérer les derniers posts de l'utilisateur
        const fetchUserPosts = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/posts/${username}`);
          setUserPosts(response.data.posts);
        } catch (error) {
          // Gérer l'erreur de récupération des posts, par exemple, afficher un message d'erreur ou rediriger vers une page d'erreur
          toast.error("Erreur lors de la récupération des posts de l'utilisateur.");
        }
      };
        // Fetch les derniers posts de l'utilisateur lorsque l'utilisateur est chargé
        if (user) {
          fetchUserPosts();
        }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [user]);

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
    <div className="container mx-auto">
    {user ? (
      <div className="bg-white rounded-lg shadow-md p-4 mt-4">
        <h2 className="text-3xl font-bold mb-4">{user.username}'s Profile</h2>
        <img
          src={`http://localhost:5000/avatars/${user.avatar}`}
          alt="Avatar de l'utilisateur"
          className="rounded-full w-48 h-48 object-cover mb-4"
        />
        {loggedInUserId && user && loggedInUserId === user._id && (
          <div className="mb-4">
            <Link to={`/edit/${user.username}`} className="text-blue-500 mr-4">Modifier le Profil</Link>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Déconnexion</button>
          </div>
        )}
        <div>
          <h3 className="text-2xl font-bold mb-2">Derniers Posts</h3>
          {userPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userPosts.map((post) => (
                <Post key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <p>Aucun post trouvé.</p>
          )}
        </div>
      </div>
    ) : (
      <p>Loading Profile...</p>
    )}
    <ToastContainer />
  </div>
);
};

export default ProfilePage;
