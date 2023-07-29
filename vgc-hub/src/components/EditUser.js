import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Dropzone from "react-dropzone";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const EditUser = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [roleInput, setRoleInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [avatar, setAvatar] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // Variable d'état pour vérifier si l'utilisateur actuellement connecté est un admin
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/users/${username}`
        );
        setUser(response.data.user);
        setUsernameInput(response.data.user.username);
        setEmailInput(response.data.user.email);
        setAvatar(response.data.user.avatar);
        setRoleInput(response.data.user.role);
        // Vous pouvez obtenir ici l'ID de l'utilisateur connecté (peut-être depuis le backend) et vérifier si c'est un admin.
        // Pour cet exemple, je vais supposer que vous avez déjà cette information.

        // Récupérez le username de l'utilisateur connecté depuis le local storage
        const loggedInUsername = localStorage.getItem("loggedInUsername");

        // Vérifiez si l'utilisateur connecté est un administrateur ou non
        if (loggedInUsername) {
            try {
                const response = await axios.get(
                  `http://localhost:5000/users/${loggedInUsername}`
                );
                if (response.data.user.role !== "admin") {
                    // Si l'utilisateur connecté n'est pas un admin, redirigez-le vers la page d'accueil ou une autre page appropriée.
                    navigate("/");
                    } else {
                        // Si l'utilisateur connecté est un admin, mettez à jour l'état local pour le refléter
                        setIsAdmin(true);
                    }


            } catch (error) {
                // Gérer l'erreur de récupération du profil, par exemple, afficher un message d'erreur ou rediriger vers une page d'erreur
                toast.error("Erreur lors de la récupération du profil connecté.");
            }

        } else {
          // Si le username de l'utilisateur connecté n'est pas disponible (non authentifié), redirigez-le vers la page d'accueil ou une autre page appropriée.
          navigate("/");
        }
      } catch (error) {
        // Gérer l'erreur de récupération du profil, par exemple, afficher un message d'erreur ou rediriger vers une page d'erreur
        toast.error("Erreur lors de la récupération du profil.");
      }
    };

    fetchProfile();
  }, [username, navigate]);

  // Fonction pour gérer la mise à jour de l'username
  const handleUpdateUsername = async () => {
    try {
      if (isAdmin) { // Vérifiez si l'utilisateur connecté est un admin pour autoriser la mise à jour de l'username
        const jwtToken = localStorage.getItem("jwtToken");
        if (!jwtToken) {
          // Si le JWT token n'est pas disponible, l'utilisateur n'est pas authentifié, ne pas poursuivre la mise à jour
          toast.error("Vous n'êtes pas connecté.");
          return;
        }

        // Si l'entrée de l'username est identique à l'username actuel, ne pas poursuivre la mise à jour
        if (usernameInput === user.username) {
          toast.info("Aucune modification apportée à l'username.");
          return;
        }

        // Inclure le JWT token dans les en-têtes de la requête
        const headers = {
          Authorization: `Bearer ${jwtToken}`,
        };

        const userId = user._id;
        // eslint-disable-next-line no-unused-vars
        const response = await axios.put(
          `http://localhost:5000/users/${userId}`,
          {
            username: usernameInput,
          },
          { headers } // Passer l'objet des en-têtes pour inclure le JWT token
        );

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

   // Fonction pour gérer la mise à jour de l'email
   const handleUpdateEmail = async () => {
    try {
      if (isAdmin) { // Vérifiez si l'utilisateur connecté est un admin pour autoriser la mise à jour de l'email
        const jwtToken = localStorage.getItem("jwtToken");
        if (!jwtToken) {
          // Si le JWT token n'est pas disponible, l'utilisateur n'est pas authentifié, ne pas poursuivre la mise à jour
          toast.error("Vous n'êtes pas connecté.");
          return;
        }

        // Si l'entrée de l'email est identique à l'email actuel, ne pas poursuivre la mise à jour
        if (emailInput === user.email) {
          toast.info("Aucune modification apportée à l'email.");
          return;
        }

        // Inclure le JWT token dans les en-têtes de la requête
        const headers = {
          Authorization: `Bearer ${jwtToken}`,
        };

        const userId = user._id;
        // eslint-disable-next-line no-unused-vars
        const response = await axios.put(
          `http://localhost:5000/users/${userId}`,
          {
            email: emailInput,
          },
          { headers } // Passer l'objet des en-têtes pour inclure le JWT token
        );

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

  // Fonction pour gérer la mise à jour du rôle
  const handleUpdateRole = async () => {
    try {
      if (isAdmin) { // Vérifiez si l'utilisateur connecté est un admin pour autoriser la mise à jour du rôle
        const jwtToken = localStorage.getItem("jwtToken");
        if (!jwtToken) {
          // Si le JWT token n'est pas disponible, l'utilisateur n'est pas authentifié, ne pas poursuivre la mise à jour
          toast.error("Vous n'êtes pas connecté.");
          return;
        }

        // Si l'entrée du rôle est identique au rôle actuel, ne pas poursuivre la mise à jour
        if (roleInput === user.role) {
          toast.info("Aucune modification apportée au rôle.");
          return;
        }

        // Inclure le JWT token dans les en-têtes de la requête
        const headers = {
          Authorization: `Bearer ${jwtToken}`,
        };

        const userId = user._id;
        // eslint-disable-next-line no-unused-vars
        const response = await axios.put(
          `http://localhost:5000/users/${userId}`,
          {
            role: roleInput,
          },
          { headers } // Passer l'objet des en-têtes pour inclure le JWT token
        );

        toast.success("Rôle mis à jour avec succès.");
      } else {
        toast.error("Vous n'êtes pas autorisé à modifier ce rôle.");
      }
    } catch (error) {
      if (error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Erreur lors de la mise à jour du rôle.");
      }
    }
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

          {isAdmin && (
            <div>
              <div>
                <h3>Modifier l'Username</h3>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                />
                <button
                  onClick={handleUpdateUsername}
                  disabled={usernameInput === user.username}
                >
                  Sauvegarder l'Username
                </button>
              </div>
              <div>
                <h3>Modifier l'Email</h3>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
                <button
                  onClick={handleUpdateEmail}
                  disabled={emailInput === user.email}
                >
                  Sauvegarder l'Email
                </button>
              </div>
              <div>
                <h3>Modifier le Rôle</h3>
                <select
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Administrateur</option>
                </select>
                <button
                  onClick={handleUpdateRole}
                  disabled={roleInput === user.role}
                >
                  Sauvegarder le Rôle
                </button>
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

export default EditUser;
