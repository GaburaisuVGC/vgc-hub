import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Dropzone from "react-dropzone";

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
          `http://localhost:5000/users/${username}`
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
        `http://localhost:5000/users/${user._id}/change-password`,
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

  const handleUpdateProfile = async () => {
    try {
      if (loggedInUserId && user && loggedInUserId === user._id) {
        const jwtToken = localStorage.getItem("jwtToken");
        if (!jwtToken) {
          // If the JWT token is not available, the user is not authenticated, so don't proceed with the update
          toast.error("Vous n'êtes pas connecté.");
          return;
        }

        // If the input username is the same as the current username, don't proceed with the update
        if (usernameInput === user.username) {
          toast.info("Aucune modification apportée au profil.");
          return;
        }

        // Include the JWT token in the request headers
        const headers = {
          Authorization: `Bearer ${jwtToken}`,
        };

        // eslint-disable-next-line no-unused-vars
        const response = await axios.put(
          `http://localhost:5000/users/${user._id}`,
          {
            username: usernameInput,
            email: emailInput,
          },
          { headers } // Pass the headers object to include the JWT token
        );

        toast.success("Profil mis à jour avec succès.");
      } else {
        toast.error("Vous n'êtes pas autorisé à modifier ce profil.");
      }
    } catch (error) {
      if (error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Erreur lors de la mise à jour du profil.");
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
      `http://localhost:5000/users/${userId}/avatar`,
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

  return (
    <div>
      {user ? (
        <div>
          <h2>{user.username}'s Profile</h2>

          {loggedInUserId && user && loggedInUserId === user._id && (
            <div>
              <div>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
                <button
                  onClick={handleUpdateProfile}
                  disabled={usernameInput === user.username}
                >
                  Save Changes
                </button>
                <button onClick={handleLogout}>Logout</button>
              </div>

              <div>
                <h2>Change Password</h2>
                <div>
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <button onClick={handleChangePassword}>Change Password</button>
              </div>
              <div>
              <h2>Avatar</h2>
        {avatar ? (
          <img
          src={`http://localhost:5000/avatars/${avatar}`}
          alt="Avatar de l'utilisateur"
          style={{ width: "200px", height: "200px" }}
        />
        ) : (
          <p>Aucun avatar téléchargé</p>
        )}
        <Dropzone onDrop={(acceptedFiles) => setSelectedFile(acceptedFiles[0])}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <p>
                Faites glisser un fichier ici ou cliquez pour télécharger un
                avatar
              </p>
            </div>
          )}
        </Dropzone>
        <button onClick={handleUploadAvatar} disabled={!selectedFile}>Télécharger l'avatar</button>
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
