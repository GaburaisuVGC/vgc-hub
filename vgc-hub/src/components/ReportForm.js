import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jwt_decode from "jwt-decode";

const ReportForm = ({ postId, userId, onClose }) => {
  const [comment, setComment] = useState("");

  const handleReportSubmit = () => {
    const reportData = { comment };

    const jwtToken = localStorage.getItem("jwtToken");
    if (!jwtToken) {
      toast.error("Vous devez être connecté pour signaler un post ou un utilisateur.");
      return;
    }

    const url = postId
      ? `http://localhost:5000/reports/posts/${postId}`
      : `http://localhost:5000/reports/users/${userId}`;

    axios
      .post(
        url,
        { ...reportData, reportedBy: jwt_decode(jwtToken).userId }, // Ajouter le champ reportedBy avec l'ID de l'utilisateur connecté
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      )
      .then((response) => {
        toast.success("Le signalement a été soumis avec succès.");
        onClose(); // Appeler la fonction onClose pour fermer le formulaire
      })
      .catch((error) => {
        console.error("Erreur lors du signalement :", error);
        toast.error("Erreur lors du signalement.");
        onClose(); // Appeler la fonction onClose pour fermer le formulaire
      });
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-screen flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-lg">
        <h2 className="text-lg font-bold mb-4">Signaler le post</h2>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Raison du signalement"
          className="w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:border-blue-500"
        />
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose} // Appeler la fonction onClose pour fermer le formulaire
            className="px-4 py-2 mr-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleReportSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Signaler
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ReportForm;
