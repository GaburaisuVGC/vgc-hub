import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Dropzone from "react-dropzone";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Profile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [loggedInUserId, setLoggedInUserId] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verified, setVerified] = useState(false);
  // État local pour stocker le fichier sélectionné
  const [selectedFile, setSelectedFile] = useState(null);
  const [avatar, setAvatar] = useState("");
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
          `${BACKEND_URL}/users/${username}`
        );
        setUser(response.data.user);
        setUsernameInput(response.data.user.username);
        setEmailInput(response.data.user.email);
        setVerified(response.data.user.isVerified);
        setAvatar(response.data.user.avatar);
      } catch (error) {
        // Gérer l'erreur de récupération du profil, par exemple, afficher un message d'erreur ou rediriger vers une page d'erreur
        toast.error("Erreur lors de la récupération du profil.");
      }
    };

    fetchProfile();
  }, [username]);

  useEffect(() => {
    // Ajoute cette condition pour vérifier si l'utilisateur est connecté et si le profil visité n'est pas le sien
    if (loggedInUserId && user && loggedInUserId !== user._id) {
      // Rediriger vers l'accueil
      navigate("/");
    }
  }, [loggedInUserId, user, navigate]);

  // Handle changing the password
  const handleChangePassword = async () => {
    try {
      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) {
        toast.error("Vous n'êtes pas connecté.");
        return;
      }

      const headers = {
        Authorization: `Bearer ${jwtToken}`,
      };

      const response = await axios.put(
        `${BACKEND_URL}/users/${user._id}/change-password`,
        {
          currentPassword,
          newPassword,
          confirmPassword,
        },
        { headers }
      );

      toast.success(response.data.message);
    } catch (error) {
      if (error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Erreur lors du changement de mot de passe.");
      }
    }
  };

  // Handle changing the username
  const handleUpdateUsername = async () => {
    try {
      if (loggedInUserId && user && loggedInUserId === user._id) {
        const jwtToken = localStorage.getItem("jwtToken");
        if (!jwtToken) {
          toast.error("Vous n'êtes pas connecté.");
          return;
        }

        const headers = {
          Authorization: `Bearer ${jwtToken}`,
        };

        if (usernameInput === user.username) {
          toast.info("Aucune modification apportée à l'username.");
          return;
        }

        // eslint-disable-next-line no-unused-vars
        const response = await axios.put(
          `${BACKEND_URL}/users/${user._id}`,
          {
            username: usernameInput,
          },
          { headers }
        );

        // Update the user's username in the local state
        setUser((prevUser) => ({
          ...prevUser,
          username: usernameInput,
        }));

        toast.success("Username mis à jour avec succès.");
      } else {
        toast.error("Vous n'êtes pas autorisé à modifier cet username.");
      }
    } catch (error) {
      if (error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Erreur lors de la mise à jour de l'username.");
      }
    }
  };

  // Handle changing the email
  const handleUpdateEmail = async () => {
    try {
      if (loggedInUserId && user && loggedInUserId === user._id) {
        const jwtToken = localStorage.getItem("jwtToken");
        if (!jwtToken) {
          toast.error("Vous n'êtes pas connecté.");
          return;
        }

        const headers = {
          Authorization: `Bearer ${jwtToken}`,
        };

        if (emailInput === user.email) {
          toast.info("Aucune modification apportée à l'email.");
          return;
        }

        // eslint-disable-next-line no-unused-vars
        const response = await axios.put(
          `${BACKEND_URL}/users/${user._id}`,
          {
            email: emailInput,
          },
          { headers }
        );

        // Update the user's email in the local state
        setUser((prevUser) => ({
          ...prevUser,
          email: emailInput,
        }));

        toast.success("Email mis à jour avec succès.");
      } else {
        toast.error("Vous n'êtes pas autorisé à modifier cet email.");
      }
    } catch (error) {
      if (error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Erreur lors de la mise à jour de l'email.");
      }
    }
  };

  const handleLogout = () => {
    // Clear the JWT token from localStorage or cookies (adjust this based on your token storage approach)
    localStorage.removeItem("jwtToken"); // If you stored the token in localStorage
    // document.cookie = 'jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'; // If you stored the token in cookies

    // Redirect to the login page after logout
    navigate("/login");
  };

  // Fonction pour gérer le téléchargement de l'avatar
  const handleUploadAvatar = async () => {
    try {
      // Vérifier si un fichier a été sélectionné avant de soumettre la requête
      if (!selectedFile) {
        toast.error("Veuillez choisir un fichier d'avatar.");
        return;
      }

      // Vérifier la taille du fichier sélectionné en utilisant la valeur de REACT_APP_MAX_FILE_SIZE définie dans .env
      const REACT_APP_MAX_FILE_SIZE = process.env.REACT_APP_MAX_FILE_SIZE;
      if (selectedFile.size > REACT_APP_MAX_FILE_SIZE) {
        toast.error(`La taille du fichier doit être inférieure à ${REACT_APP_MAX_FILE_SIZE / (1024 * 1024)} MB.`);
        return;
      }

      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) {
        // Si le JWT token n'est pas disponible, l'utilisateur n'est pas authentifié, ne pas poursuivre la mise à jour
        toast.error("Vous n'êtes pas connecté.");
        return;
      }

      // Créez un nouvel objet FormData pour envoyer le fichier
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      // Envoyez une requête PUT au backend pour mettre à jour l'avatar
      const userId = user._id;
      const response = await axios.put(
        `${BACKEND_URL}/users/${userId}/avatar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Important pour l'upload de fichiers
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      // Si la requête réussit, mettez à jour l'avatar dans l'état local du composant
      setAvatar(response.data.avatar);
      toast.success("Avatar mis à jour avec succès.");
    } catch (error) {
      console.error("Erreur lors du téléchargement de l'avatar :", error);
      toast.error("Erreur lors du téléchargement de l'avatar.");
    }
  };

  const handleDeleteAccount = () => {
    // Utiliser react-confirm-alert pour afficher un pop-up de confirmation
    confirmAlert({
      title: "Confirmation de suppression",
      message: "Êtes-vous sûr de vouloir supprimer votre compte ?",
      buttons: [
        {
          label: "Oui",
          onClick: () => {
            // Requête DELETE pour supprimer le compte de l'utilisateur connecté
            axios
              .delete(`${BACKEND_URL}/users/${loggedInUserId}`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
                },
              })
              .then(() => {
                // Effacter les autres items du localStorage
                localStorage.clear()
                // Rediriger vers la page d'accueil
                navigate("/");
              })
              .catch((error) => {
                // Gérer les erreurs de suppression du compte, par exemple, afficher un message d'erreur
                console.error("Erreur lors de la suppression du compte :", error);
                toast.error("Erreur lors de la suppression du compte.");
              });
          },
        },
        {
          label: "Non",
          // Ne rien faire si l'utilisateur clique sur "Non"
        },
      ],
    });
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {user ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">{user.username}'s Profile</h2>

          {loggedInUserId && user && loggedInUserId === user._id && (
            <div>
              <div>
                <h3 className="text-lg font-bold mb-2">Modifier l'Username</h3>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full px-4 py-2 mb-4 border rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleUpdateUsername}
                  disabled={usernameInput === user.username}
                  className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                >
                  Sauvegarder l'Username
                </button>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-bold mb-2">Modifier l'Email</h3>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-4 py-2 mb-4 border rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleUpdateEmail}
                  disabled={emailInput === user.email}
                  className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                >
                  Sauvegarder l'Email
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full mt-2 px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:bg-red-600"
                >
                  Logout
                </button>
              </div>

              <div className="mt-4">
                <h2 className="text-2xl font-bold mb-2">Change Password</h2>
                <div className="mb-4">
                  <label htmlFor="currentPassword" className="block font-bold">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="newPassword" className="block font-bold">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="block font-bold">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={handleChangePassword}
                  className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                >
                  Change Password
                </button>
              </div>
              <div className="mt-4">
                <h2 className="text-2xl font-bold mb-2">Avatar</h2>
                {avatar ? (
                  <img
                    src={`${BACKEND_URL}/avatars/${avatar}`}
                    alt="Avatar de l'utilisateur"
                    className="w-48 h-48 mb-4 rounded"
                  />
                ) : (
                  <p>Aucun avatar téléchargé</p>
                )}
                <Dropzone
                  onDrop={(acceptedFiles) => setSelectedFile(acceptedFiles[0])}
                >
                  {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps()} className="p-4 border rounded cursor-pointer">
                      <input {...getInputProps()} />
                      <p>
                        Faites glisser un fichier ici ou cliquez pour
                        télécharger un avatar
                      </p>
                    </div>
                  )}
                </Dropzone>
                <button
                  onClick={handleUploadAvatar}
                  disabled={!selectedFile}
                  className="w-full mt-4 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                >
                  Télécharger l'avatar
                </button>
              </div>
              <div className="mt-4">
                <h2 className="text-2xl font-bold mb-2">Supprimer le Compte</h2>
                <button
                  onClick={handleDeleteAccount}
                  className="w-full px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:bg-red-600"
                >
                  Supprimer le Compte
                </button>
              </div>
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

export default Profile;
