import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jwt_decode from "jwt-decode";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { Link } from "react-router-dom";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    // Assurez-vous que l'utilisateur est connecté
    const jwtToken = localStorage.getItem("jwtToken");
    if (!jwtToken) {
      // Redirigez l'utilisateur vers la page de connexion s'il n'est pas connecté
      window.location.href = "/login";
      return;
    }

    // Récupérez le rôle de l'utilisateur à partir de son profil
    fetchProfile(jwtToken);

    // Requête GET pour récupérer la liste des utilisateurs depuis le backend
    axios
      .get("http://localhost:5000/users/admin/users", {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      })
      .then((response) => {
        setUsers(response.data.users);
      })
      .catch((error) => {
        // Gérer les erreurs de récupération de la liste des utilisateurs, par exemple, afficher un message d'erreur ou rediriger vers une page d'erreur
        console.error("Erreur lors de la récupération de la liste des utilisateurs :", error);
        toast.error("Erreur lors de la récupération de la liste des utilisateurs.");
      });
  }, []);

// Fonction pour récupérer le profil de l'utilisateur connecté et extraire le rôle
const fetchProfile = (jwtToken) => {
    const loggedInUsername = localStorage.getItem("loggedInUsername");
  
    // Vérifiez si l'username est présent dans le localStorage
    if (!loggedInUsername) {
      // Redirigez l'utilisateur vers la page de connexion s'il n'est pas connecté
      window.location.href = "/login";
      return;
    }
  
    axios
      .get(`http://localhost:5000/users/${loggedInUsername}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      })
      .then((response) => {
        const decodedToken = jwt_decode(jwtToken);
        setUserRole(decodedToken.role);
      })
      .catch((error) => {
        // Gérer les erreurs de récupération du profil, par exemple, afficher un message d'erreur ou rediriger vers une page d'erreur
        console.error("Erreur lors de la récupération du profil :", error);
        toast.error("Erreur lors de la récupération du profil.");
      });
  };

  const handleMakeAdmin = (userId) => {
    // Requête PUT pour mettre à jour le rôle de l'utilisateur en "admin"
    axios
      .put(
        `http://localhost:5000/users/admin/users/${userId}`,
        { role: "admin" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      )
      .then((response) => {
        // Mettez à jour la liste des utilisateurs après la mise à jour du rôle
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, role: "admin" } : user
          )
        );
        toast.success("Rôle administrateur donné avec succès.");
      })
      .catch((error) => {
        // Gérer les erreurs de mise à jour du rôle, par exemple, afficher un message d'erreur
        console.error("Erreur lors de la mise à jour du rôle administrateur :", error);
        toast.error("Erreur lors de la mise à jour du rôle administrateur.");
      });

      
  };

  const handleDeleteUser = (userId) => {
    // Utiliser react-confirm-alert pour afficher un pop-up de confirmation
    confirmAlert({
      title: "Confirmation de suppression",
      message: "Êtes-vous sûr de vouloir supprimer cet utilisateur ?",
      buttons: [
        {
          label: "Oui",
          onClick: () => {
            // Requête DELETE pour supprimer l'utilisateur spécifié par son ID
            axios
              .delete(`http://localhost:5000/users/${userId}`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
                },
              })
              .then((response) => {
                // Mettez à jour la liste des utilisateurs après la suppression
                setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
                toast.success("Utilisateur supprimé avec succès.");
              })
              .catch((error) => {
                // Gérer les erreurs de suppression d'utilisateur, par exemple, afficher un message d'erreur
                console.error("Erreur lors de la suppression de l'utilisateur :", error);
                toast.error("Erreur lors de la suppression de l'utilisateur.");
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
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold my-4">Panel Admin</h1>
      <section>
        <h2 className="text-2xl font-bold">Liste des Utilisateurs</h2>
        <ul>
          {users.map((user) => (
            <li key={user._id} className="py-4 border-b border-gray-300">
              <div className="flex items-center">
                <img
                  src={`http://localhost:5000/avatars/${user.avatar}`}
                  alt="Avatar de l'utilisateur"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <span className="text-lg font-semibold">{user.username}</span>
                  <span className="block text-sm">{user.email}</span>
                  <span className="block text-sm">Rôle: {user.role}</span>
                </div>
              </div>
              {/* Bouton qui link vers /admin/edit/:username pour modifier l'utilisateur */}
              <Link to={`/admin/edit/${user.username}`}>
                <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Modifier
                </button>
              </Link>
              <button
                onClick={() => handleDeleteUser(user._id)}
                className="mt-2 ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Supprimer
              </button>
              {userRole === "admin" && user.role !== "admin" && (
                <button
                  onClick={() => handleMakeAdmin(user._id)}
                  className="mt-2 ml-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Donner le rôle admin
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
      <ToastContainer />
    </div>
  );
};
export default AdminPanel;
