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
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowingYou, setIsFollowingYou] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingsModal, setShowFollowingsModal] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingsList, setFollowingsList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/posts/${username}`);
        setUserPosts(response.data.posts);
      } catch (error) {
        toast.error("Erreur lors de la récupération des posts de l'utilisateur.");
      }
    };

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
        const response = await axios.get(`http://localhost:5000/users/${username}`);
        setUser(response.data.user);
        setVerified(response.data.user.isVerified);
          setFollowerCount(response.data.user.followers.length);
          setFollowingCount(response.data.user.following.length);
        setFollowers(response.data.user.followers);
        setFollowings(response.data.user.following);
      } catch (error) {
        console.log(error);
        toast.error("Erreur lors de la récupération du profil.");
      }
    };

    fetchProfile();
  }, [username]);

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    navigate("/login");
  };

  const checkFollowingStatus = () => {
    if (loggedInUserId && followings.includes(loggedInUserId)) {
      setIsFollowingYou(true);
    } else {
      setIsFollowingYou(false);
    }
  };

  const checkYourFollowingStatus = () => {
    if (loggedInUserId && followers.includes(loggedInUserId)) {
      setIsFollowing(true);
    } else {
      setIsFollowing(false);
    }
  };

  useEffect(() => {
    checkFollowingStatus();
    checkYourFollowingStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUserId, followers, followings]);

  const handleFollow = async () => {
    try {
      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) {
        toast.error("Vous devez être connecté pour citer un post.");
        return;
      }
      await axios.post(`http://localhost:5000/users/follow/${user._id}`, null, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      setUser((prevUser) => ({
        ...prevUser,
        followers: [...prevUser.followers, loggedInUserId],
      }));
      setFollowerCount(followerCount + 1);
      setIsFollowing(true);
    } catch (error) {
      toast.error("Erreur lors du suivi de l'utilisateur.");
    }
  };

  const handleUnfollow = async () => {
    try {
      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) {
        toast.error("Vous devez être connecté pour citer un post.");
        return;
      }

      await axios.post(`http://localhost:5000/users/unfollow/${user._id}`, null, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      setUser((prevUser) => ({
        ...prevUser,
        followers: prevUser.followers.filter((id) => id !== loggedInUserId),
      }));
      setFollowerCount(followerCount - 1);
      setIsFollowing(false);
    } catch (error) {
      toast.error("Erreur lors de la suppression du suivi de l'utilisateur.");
    }
  };



  const handleFollowersClick = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/users/${user._id}/followers`);
      setFollowersList(response.data.followers);
      setShowFollowersModal(true);
    } catch (error) {
      toast.error("Erreur lors de la récupération des followers.");
    }
  };

  const handleFollowingsClick = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/users/${user._id}/followings`);
      setFollowingsList(response.data.followings);
      setShowFollowingsModal(true);
    } catch (error) {
      toast.error("Erreur lors de la récupération des followings.");
    }
  };
  const handleModalClose = () => {
    setShowFollowersModal(false);
    setShowFollowingsModal(false);
  };

  return (
    <div className="container mx-auto">
      {user ? (
        <div className="bg-white rounded-lg shadow-md p-4 mt-4">
          <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold mb-4">{user.username}'s Profile</h2>
          {loggedInUserId !== user._id && isFollowingYou && (
    <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded mr-2">Follows you</span>
            )}
            </div>
          <img
            src={`http://localhost:5000/avatars/${user.avatar}`}
            alt="Avatar de l'utilisateur"
            className="rounded-full w-48 h-48 object-cover mb-4"
          />
          <div className="flex items-center mb-4">
            <span className="mr-2 font-bold" onClick={handleFollowersClick}>
              Followers: {followerCount}
            </span>
            <span className="mr-2 font-bold" onClick={handleFollowingsClick}>
              Following: {followingCount}
            </span>
            {loggedInUserId !== user._id ? (
              isFollowing ? (
                <button
                  onClick={handleUnfollow}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Unfollow
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Follow
                </button>
              )
            ) : (
              <div className="mb-4">
                <button
                  onClick={() => navigate(`/edit/${user.username}`)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
                >
                  Modifier le Profil
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
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

{showFollowersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4">
          <button
              onClick={handleModalClose}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-4 mb-4"
            >
              Close
            </button>
            <h2 className="text-xl font-bold mb-4">Followers</h2>
            <ul>
              {followersList.map((follower) => (
                <li key={follower._id} className="flex items-center mb-2">
                  <img
                    src={`http://localhost:5000/avatars/${follower.avatar}`}
                    alt={`Avatar de ${follower.username}`}
                    className="w-8 h-8 rounded-full mr-2 object-cover"
                  />
                  <Link to={`/${follower.username}`} className="text-blue-500">
                    @{follower.username}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {showFollowingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4">
          <button
              onClick={handleModalClose}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-4 mb-4"
            >
              Close
            </button>
            <h2 className="text-xl font-bold mb-4">Followings</h2>
            <ul>
              {followingsList.map((following) => (
                <li key={following._id} className="flex items-center mb-2">
                  <img
                    src={`http://localhost:5000/avatars/${following.avatar}`}
                    alt={`Avatar de ${following.username}`}
                    className="w-8 h-8 rounded-full mr-2 object-cover"
                  />
                  <Link to={`/${following.username}`} className="text-blue-500">
                    @{following.username}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default ProfilePage;