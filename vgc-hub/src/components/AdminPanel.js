import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jwt_decode from "jwt-decode";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { Link } from "react-router-dom";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);

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
      .get(`${BACKEND_URL}/users/admin/users`, {
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

    // Requête GET pour récupérer la liste des rapports depuis le backend
    axios
      .get(`${BACKEND_URL}/reports`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      })
      .then(async (response) => {
        // Récupérez la liste des rapports
        const reportsData = response.data.reports;

        // Tableau pour stocker les rapports mis à jour avec les informations supplémentaires
        const updatedReports = [];

        // Fonction pour récupérer les informations de l'utilisateur par son ID
        const getUserById = async (userId) => {
          try {
            const userResponse = await axios.get(`${BACKEND_URL}/users/id/${userId}`, {
              headers: {
                Authorization: `Bearer ${jwtToken}`,
              },
            });
            return userResponse.data.user;
          } catch (error) {
            console.error("Erreur lors de la récupération de l'utilisateur par son ID :", error);
            return null;
          }
        };

        // Parcours de tous les rapports pour récupérer les informations supplémentaires
        for (const report of reportsData) {
          let updatedReport = { ...report };

          if (report.userId) {
            // Si le rapport a un userId, récupérez les informations de l'utilisateur et ajoutez-les au rapport
            const user = await getUserById(report.userId._id);
            updatedReport = { ...updatedReport, user: user };
          }

          // Ajoutez le rapport mis à jour avec les informations supplémentaires au tableau des rapports mis à jour
          updatedReports.push(updatedReport);
        }

        // Mettez à jour l'état avec les rapports mis à jour
        setReports(updatedReports);
        setFilteredReports(updatedReports);
      })
      .catch((error) => {
        // Gérer les erreurs de récupération de la liste des rapports, par exemple, afficher un message d'erreur
        console.error("Erreur lors de la récupération de la liste des rapports :", error);
        toast.error("Erreur lors de la récupération de la liste des rapports.");
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
      .get(`${BACKEND_URL}/users/${loggedInUsername}`, {
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
        `${BACKEND_URL}/users/admin/users/${userId}`,
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
              .delete(`${BACKEND_URL}/users/${userId}`, {
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

  const handleDeleteReport = (reportId) => {
    // Utiliser react-confirm-alert pour afficher un pop-up de confirmation
    confirmAlert({
      title: "Confirmation de suppression",
      message: "Êtes-vous sûr de vouloir supprimer ce rapport ?",
      buttons: [
        {
          label: "Oui",
          onClick: () => {
            // Requête DELETE pour supprimer le rapport spécifié par son ID
            axios
              .delete(`${BACKEND_URL}/reports/${reportId}`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
                },
              })
              .then((response) => {
                // Mettez à jour la liste des rapports après la suppression
                setReports((prevReports) => prevReports.filter((report) => report._id !== reportId));
                setFilteredReports((prevReports) =>
                  prevReports.filter((report) => report._id !== reportId)
                );
                toast.success("Rapport supprimé avec succès.");
              })
              .catch((error) => {
                // Gérer les erreurs de suppression du rapport, par exemple, afficher un message d'erreur
                console.error("Erreur lors de la suppression du rapport :", error);
                toast.error("Erreur lors de la suppression du rapport.");
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

  const handleFilterReports = (type) => {
    // Filtrer les rapports en fonction du type de rapport (userId ou postId)
    if (type === "user") {
      setFilteredReports(reports.filter((report) => report.userId));
    } else if (type === "post") {
      setFilteredReports(reports.filter((report) => report.postId));
    } else {
      // Si aucun type sélectionné, afficher tous les rapports
      setFilteredReports(reports);
    }
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
                  src={`${BACKEND_URL}/avatars/${user.avatar}`}
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

      <section>
        <h2 className="text-2xl font-bold mt-8">Liste des Rapports</h2>
        <div className="mb-4">
          <button
            onClick={() => handleFilterReports("")}
            className="mr-4 px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
          >
            Tous les rapports
          </button>
          <button
  onClick={() => handleFilterReports("post")}
  className="mr-4 px-4 py-2 text-white bg-black rounded hover:bg-gray-600"
>
  Rapports Utilisateur
</button>
          <button
            onClick={() => handleFilterReports("user")}
            className="mr-4 px-4 py-2 bg-yellow-300 text-black rounded hover:bg-yellow-400"
          >
            Rapports Post
          </button>
        </div>
        <ul>
          {filteredReports.map((report) => (
            <li key={report._id} className="py-4 border-b border-gray-300">
              <div className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-full mr-4 ${
                    report.userId ? "bg-yellow-500" : "bg-black"
                  }`}
                />
                <div>
                  <span className="block">{report.comment}</span>
                  <span className="block text-sm">
                    {report.postId ? "Report Utilisateur" : "Report Post"}
                  </span>
                </div>
                {report.postId && (
                  <Link to={`/post/${report.postId._id}`}>
                    <span className="block ml-4 text-blue-500 hover:underline">Voir le post</span>
                  </Link>
                )}
                {report.userId && (
                  <>
                    <Link to={`/${report.user.username}`}>
                      <span className="block ml-4 text-blue-500 hover:underline">
                        Profil reporté : @{report.user.username}
                      </span>
                    </Link>
                    <img
                      src={`${BACKEND_URL}/avatars/${report.user?.avatar}`}
                      alt={`Avatar de ${report.user?.username}`}
                      width={50}
                      className="rounded-full mr-2 ml-4"
                    />
                  </>
                )}
                <button
                  onClick={() => handleDeleteReport(report._id)}
                  className="ml-auto px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Close Report
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <ToastContainer />
    </div>
  );
};

export default AdminPanel;

