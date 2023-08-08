import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jwt_decode from "jwt-decode";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ReportForm = ({ postId, userId, onClose }) => {
  const [comment, setComment] = useState("");

  const handleReportSubmit = () => {
    const reportData = { comment };

    const jwtToken = localStorage.getItem("jwtToken");
    if (!jwtToken) {
      toast.error("You must be logged in to report a post or user.");
      return;
    }

    const url = postId
      ? `${BACKEND_URL}/reports/posts/${postId}`
      : `${BACKEND_URL}/reports/users/${userId}`;

    axios
      .post(
        url,
        { ...reportData, reportedBy: jwt_decode(jwtToken).userId },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      )
      .then((response) => {
        toast.success("The report has been successfully submitted.");
        onClose();
      })
      .catch((error) => {
        toast.error("Error while submitting the report.");
        onClose();
      });
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-screen flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-lg">
        <h2 className="text-lg font-bold mb-4">Report Post</h2>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Reason for reporting"
          className="w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:border-blue-500"
        />
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 mr-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReportSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Report
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ReportForm;
