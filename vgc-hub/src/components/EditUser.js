import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Dropzone from "react-dropzone";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

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
          `${BACKEND_URL}/users/${username.toLowerCase()}`
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
                  `${BACKEND_URL}/users/${loggedInUsername}`
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
          `${BACKEND_URL}/users/${userId}`,
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
          `${BACKEND_URL}/users/${userId}`,
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
          `${BACKEND_URL}/users/${userId}`,
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

return (
    <div className="container mx-auto">
      {user ? (
        <div>
          <h2 className="text-3xl font-bold my-4">{user.username}'s Profile</h2>
          {isAdmin && (
            <div className="space-y-4">
              <div className="flex items-center">
                <h3 className="font-bold">Modifier l'Username</h3>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-500"
                />
                <button
                  onClick={handleUpdateUsername}
                  disabled={usernameInput === user.username}
                  className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                >
                  Sauvegarder l'Username
                </button>
              </div>
              <div className="flex items-center">
                <h3 className="font-bold">Modifier l'Email</h3>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-500"
                />
                <button
                  onClick={handleUpdateEmail}
                  disabled={emailInput === user.email}
                  className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                >
                  Sauvegarder l'Email
                </button>
              </div>
              <div className="flex items-center">
                <h3 className="font-bold">Modifier le Rôle</h3>
                <select
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  className="px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-500"
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Administrateur</option>
                </select>
                <button
                  onClick={handleUpdateRole}
                  disabled={roleInput === user.role}
                  className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                >
                  Sauvegarder le Rôle
                </button>
              </div>
              <div className="flex items-center">
                <h2 className="font-bold">Avatar</h2>
                {avatar ? (
                  <img
                    src={`${BACKEND_URL}/avatars/${avatar}`}
                    alt="Avatar de l'utilisateur"
                    className="w-32 h-32 rounded-full mx-4"
                  />
                ) : (
                  <p>Aucun avatar téléchargé</p>
                )}
                <Dropzone onDrop={(acceptedFiles) => setSelectedFile(acceptedFiles[0])}>
                  {({ getRootProps, getInputProps }) => (
                    <div className="border rounded-md p-4 mt-2 cursor-pointer" {...getRootProps()}>
                      <input {...getInputProps()} />
                      <p>
                        Faites glisser un fichier ici ou cliquez pour télécharger un
                        avatar
                      </p>
                    </div>
                  )}
                </Dropzone>
                <button
                  onClick={handleUploadAvatar}
                  disabled={!selectedFile}
                  className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 ml-2"
                >
                  Télécharger l'avatar
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

export default EditUser;
