import React, { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Post from "./Post";
import ReportForm from "./ReportForm";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ProfilePage = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState("");
  const [verified, setVerified] = useState(true);
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
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isBlockedByYou, setIsBlockedByYou] = useState(false);
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const [loggedInUserRole, setLoggedInUserRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/posts/${username.toLowerCase()}`
        );
        setUserPosts(response.data.posts);
      } catch (error) {
        toast.error(
          "Error retrieving posts. Please refresh the page to try again."
        );
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
    // si l'utilisateur connecté existe et qu'il n'est pas vérifié
    if (loggedInUserId && !verified) {
      navigate("/email-verification-error");
    }
  }, [loggedInUserId, verified, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/users/${username.toLowerCase()}`
        );
        setUser(response.data.user);
        setFollowerCount(response.data.user.followers.length);
        setFollowingCount(response.data.user.following.length);
        setFollowers(response.data.user.followers);
        setFollowings(response.data.user.following);
        // Vérifier si l'utilisateur connecté est dans la liste des utilisateurs bloqués
        if (
          loggedInUserId &&
          response.data.user.blockedUsers.includes(loggedInUserId)
        ) {
          setIsBlocked(true);
        } else {
          setIsBlocked(false);
        }

        // Vérifier si l'utilisateur connecté a bloqué le propriétaire du profil
        // fetch l'user connecté
        const jwtToken = localStorage.getItem("jwtToken");
        if (jwtToken) {
          const loggedUsername = localStorage.getItem("loggedInUsername");
          const loggedInUserResponse = await axios.get(
            `${BACKEND_URL}/users/${loggedUsername.toLowerCase()}`
          );
          if (loggedInUserResponse) {
            setVerified(loggedInUserResponse.data.user.isVerified);
          }
          if (
            loggedInUserResponse &&
            loggedInUserResponse.data.user.blockedUsers.includes(
              response.data.user._id
            )
          ) {
            setIsBlockedByYou(true);
          }
        }
      } catch (error) {
        toast.error("Error retrieving user profile.");
      }
    };

    fetchProfile();
  }, [username, loggedInUserId]);

  const handleLogout = () => {
    localStorage.clear();
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
        toast.error("You must be logged in to follow a user.");
        return;
      }
      await axios.post(`${BACKEND_URL}/users/follow/${user._id}`, null, {
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
      toast.error("Error following user.");
    }
  };

  const handleUnfollow = async () => {
    try {
      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) {
        toast.error("You must be logged in to unfollow a user.");
        return;
      }

      await axios.post(`${BACKEND_URL}/users/unfollow/${user._id}`, null, {
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
      toast.error("Error unfollowing user.");
    }
  };

  const handleFollowersClick = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/users/${user._id}/followers`
      );
      setFollowersList(response.data.followers);
      setShowFollowersModal(true);
    } catch (error) {
      toast.error("Error retrieving followers.");
    }
  };

  const handleFollowingsClick = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/users/${user._id}/followings`
      );
      setFollowingsList(response.data.followings);
      setShowFollowingsModal(true);
    } catch (error) {
      toast.error("Error retrieving followings.");
    }
  };
  const handleModalClose = () => {
    setShowFollowersModal(false);
    setShowFollowingsModal(false);
  };

  const handleBlockUnblock = async () => {
    try {
      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) {
        toast.error(
          "You must be logged in to block/unblock a user. Please login and try again."
        );
        return;
      }

      // Vérifier si l'utilisateur connecté est bloqué par le propriétaire du profil
      if (isBlockedByYou) {
        // Débloquer l'utilisateur
        const response = await axios.post(
          `${BACKEND_URL}/users/unblock/${user._id}`,
          null,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        // Vérifier la réponse de la route
        if (response.status === 200) {
          setUser((prevUser) => ({
            ...prevUser,
            blockedUsers: prevUser.blockedUsers.filter(
              (id) => id !== loggedInUserId
            ),
          }));
          setIsBlockedByYou(false);
          toast.success("You have unblocked the user.");
          window.location.reload();
        } else {
          toast.error("Error unblocking user.");
        }
      } else {
        // Bloquer l'utilisateur
        const response = await axios.post(
          `${BACKEND_URL}/users/block/${user._id}`,
          null,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        // Vérifier la réponse de la route
        if (response.status === 200) {
          setUser((prevUser) => ({
            ...prevUser,
            blockedUsers: [...prevUser.blockedUsers, loggedInUserId],
          }));
          setIsBlockedByYou(true);
          toast.success("You have blocked the user.");
          window.location.reload();
        } else {
          toast.error("Error blocking user.");
        }
      }
    } catch (error) {
      toast.error("Error blocking/unblocking user.");
    }
  };

  const handleOptionsClick = () => {
    setShowOptionsPanel(!showOptionsPanel);
  };

  const handleReportFormClose = () => {
    setIsReportFormOpen(false);
  };

  useEffect(() => {
    // Assurez-vous que l'utilisateur est connecté
    const jwtToken = localStorage.getItem("jwtToken");
    if (!jwtToken) {
      // Redirigez l'utilisateur vers la page de connexion s'il n'est pas connecté
      window.location.href = "/login";
      return;
    }

    // Récupérer l'ID de l'utilisateur connecté
    const loggedInUserId = jwt_decode(jwtToken).userId;
    setLoggedInUserId(loggedInUserId);

    // Récupérer le rôle de l'utilisateur connecté
    axios
      .get(`${BACKEND_URL}/users/id/${loggedInUserId}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      })
      .then((response) => {
        const loggedInUserRole = response.data.user.role;
        setLoggedInUserRole(loggedInUserRole);
      })
      .catch((error) => {
        // Gérer les erreurs de récupération du rôle, par exemple, afficher un message d'erreur ou rediriger vers une page d'erreur
        toast.error("Error retrieving user role.");
      });

    // ... (autres requêtes et actions nécessaires)
  }, []);

  const handleBanDeban = async () => {
    try {
      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) {
        toast.error(
          "You must be logged in to ban/unban a user. Please login and try again."
        );
        return;
      }

      // Effectuer la requête PUT pour bannir ou débannir l'utilisateur
      const response = await axios.post(
        `${BACKEND_URL}/users/${user.status === "banned" ? "unban" : "ban"}/${
          user._id
        }`,
        null,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      // Vérifier la réponse de la route
      if (response.status === 200) {
        // Mettre à jour le statut de l'utilisateur localement
        setUser((prevUser) => ({
          ...prevUser,
          status: user.status === "banned" ? "default" : "banned",
        }));

        // Afficher le message de succès approprié
        const successMessage =
          user.status === "banned"
            ? "You have unbanned the user."
            : "You have banned the user.";
        toast.success(successMessage);
      } else {
        toast.error(
          "Error banning/unbanning user. Please try again or contact support."
        );
      }
    } catch (error) {
      toast.error(
        "Error banning/unbanning user. Please try again or contact support."
      );
    }
  };

  // Vérifier si l'utilisateur est banni

  if (user) {
    if (
      loggedInUserId &&
      loggedInUserId === user._id &&
      user?.status === "banned"
    ) {
      return (
        <div className="container mx-auto" style={{ paddingTop: "100px" }}>
          <div className="bg-gray-100 text-gray-800 rounded-md p-4">
            <p>Your account has been banned.</p>
            <button
              onClick={() => navigate(`/edit/${user.username}`)}
              className="block w-full text-left px-4 py-2 mt-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 mt-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      );
    }

    if (user?.status === "banned") {
      return (
        <div className="container mx-auto" style={{ paddingTop: "100px" }}>
          <div className="bg-gray-100 text-gray-800 rounded-md p-4">
            <p>This user has been banned.</p>
            {loggedInUserRole === "admin" && (
              <button
                onClick={handleBanDeban}
                className="block w-full text-left px-4 py-2 mt-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Unban
              </button>
            )}
          </div>
        </div>
      );
    }
  }

  return (
    <div className="container mx-auto" style={{ paddingTop: "100px" }}>
      {user ? (
        <div className="bg-white rounded-lg shadow-md p-4 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold mb-4">
              {user.plainName}
              <p className="text-gray-600 text-sm">@{user.username}</p>
            </h2>

            {loggedInUserId !== user._id && isFollowingYou && (
              <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded mr-2">
                Follows you
              </span>
            )}
          </div>
          {/* le bouton ... doit être fixé à droite, accessible à tous les users connectés */}
          {/* si nous sommes l'user de la page = accès à modifier et déconnexion dans un modal */}
          {/* si nous ne sommes pas l'user de la page = accès à bloquer/débloquer */}
          {/* je veux que le modal soit une liste et que les boutons soient designés pour paraitre bien dans la liste (pas de petit bouton rouge ou bleu) */}
          {loggedInUserId ? (
            <>
              {/* div qui fixe le bouton à droite */}
              <div className="flex">
                <button
                  className="text-xl text-gray-600 ml-auto rounded-full bg-gray-300 p-2 hover:bg-gray-400 w-10 h-10 flex items-center justify-center"
                  onClick={handleOptionsClick}
                  aria-label="Options"
                >
                  ...
                </button>
              </div>
            </>
          ) : null}

          {showOptionsPanel && (
            <div className="flex">
              <div className="absolute top-40 mt-28 right-0 bg-white rounded-lg shadow-md p-2 space-y-2">
                {/* si nous sommes l'user de la page = accès à modifier et déconnexion dans un modal */}
                {loggedInUserId === user._id ? (
                  <>
                    <button
                      onClick={() => navigate(`/edit/${user.username}`)}
                      className="block w-full text-left px-4 py-2 hover:text-blue-500"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-500 hover:text-red-600"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  // si nous ne sommes pas l'user de la page = accès à bloquer/débloquer
                  // je veux que le modal soit une liste et que les boutons soient designés pour paraitre bien dans la liste (pas de petit bouton rouge ou bleu)
                  <>
                    <button
                      onClick={handleBlockUnblock}
                      className={`block w-full text-left px-4 py-2 ${
                        isBlocked || isBlockedByYou
                          ? "text-red-500"
                          : "text-blue-500"
                      } hover:text-red-600`}
                      disabled={isBlocked}
                    >
                      {isBlocked
                        ? "You are blocked"
                        : isBlockedByYou
                        ? "Unblock"
                        : "Block"}
                    </button>

                    <button
                      // Afficher le formulaire de signalement au clic
                      onClick={() => setIsReportFormOpen(true)}
                      className={`block w-full text-left px-4 py-2 text-red-500 hover:text-red-600`}
                    >
                      Report
                    </button>
                    {/* Affiche le bouton Ban/Deban uniquement si l'utilisateur connecté a le rôle "admin" */}
                    {loggedInUserRole === "admin" && (
                      <button
                        onClick={handleBanDeban}
                        className="block w-full text-left px-4 py-2 text-red-500 hover:text-red-600"
                      >
                        {user?.status === "banned" ? "Unban" : "Ban"}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          <img
            src={`${BACKEND_URL}/avatars/${user.avatar}`}
            alt={`${user.username}'s avatar`}
            className="rounded-full w-48 h-48 object-cover mb-4"
            style={{ background: user?.color || '' }}
          />
          <div className="flex items-center mb-4">
            <span className="mr-2 text-gray-600" onClick={handleFollowersClick}>
              {followerCount} Followers
            </span>
            <span className="mr-2 text-gray-600" onClick={handleFollowingsClick}>
              {followingCount} Followings
            </span>
            {loggedInUserId !== user._id && !isBlocked && !isBlockedByYou ? (
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
            ) : null}
          </div>

          <div>
            {isBlocked ? (
              <p>You are blocked by this user.</p>
            ) : isBlockedByYou ? (
              <p>You have blocked this user.</p>
            ) : (
              <>
                <h3 className="text-2xl font-bold mb-2">Latest Posts</h3>
                {userPosts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userPosts.map((post) => (
                      <Post key={post._id} post={post} />
                    ))}
                  </div>
                ) : (
                  <p>No posts yet.</p>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
        <p
          className="text-2xl font-bold text-gray-800"
        >
          Loading Profile...</p>
        </div>
      )}

      {isReportFormOpen && (
        <ReportForm userId={user._id} onClose={handleReportFormClose} />
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
                    src={`${BACKEND_URL}/avatars/${follower.avatar}`}
                    alt={`${follower.username}'s avatar`}
                    className="w-8 h-8 rounded-full mr-2 object-cover"
                    style={{ background: follower?.color || '' }}
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
                    src={`${BACKEND_URL}/avatars/${following.avatar}`}
                    alt={`${following.username}'s avatar`}
                    className="w-8 h-8 rounded-full mr-2 object-cover"
                    style={{ background: following?.color || '' }}
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

       
    </div>
  );
};

export default ProfilePage;
