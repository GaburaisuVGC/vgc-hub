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
          <div>
            <h3>Derniers Posts</h3>
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <div key={post._id}>
                    <Link to={`/post/${post._id}`}>
                {/* Afficher le nom d'utilisateur de l'utilisateur ayant créé le post, précédé d'un @, avec un lien cliquable pour arriver sur "/:username" */}
                <p>
            <Link to={`/${post.user?.username}`}>@{post.user?.username}</Link>
          </p>
                {/* Afficher son avatar image avec src (http://localhost:5000/avatars/${user.avatar}) */}
                <img
                  src={`http://localhost:5000/avatars/${post.user?.avatar}`}
                  alt={`Avatar de ${post.user?.username}`}
                  width={50}
                />
                <p>{post.content}</p>
                <p>Créé le : {post.createdAt}</p>
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
                </Link>
              </div>
              ))
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
