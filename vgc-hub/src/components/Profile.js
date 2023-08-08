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
  // Local state to store the selected file
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
          `${BACKEND_URL}/users/${username.toLowerCase()}`
        );
        setUser(response.data.user);
        setUsernameInput(response.data.user.username);
        setEmailInput(response.data.user.email);
        setVerified(response.data.user.isVerified);
        setAvatar(response.data.user.avatar);
      } catch (error) {
        toast.error("Error retrieving profile.");
      }
    };

    fetchProfile();
  }, [username]);

  useEffect(() => {
    // Add this condition to check if the user is logged in and if the visited profile is not their own
    if (loggedInUserId && user && loggedInUserId !== user._id) {
      navigate("/");
    }
  }, [loggedInUserId, user, navigate]);

  // Handle changing the password
  const handleChangePassword = async () => {
    try {
      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) {
        toast.error("You are not logged in.");
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
        toast.error("Error changing password.");
      }
    }
  };

  // Handle changing the username
  const handleUpdateUsername = async () => {
    try {
      if (loggedInUserId && user && loggedInUserId === user._id) {
        const jwtToken = localStorage.getItem("jwtToken");
        if (!jwtToken) {
          toast.error("You are not logged in.");
          return;
        }

        const headers = {
          Authorization: `Bearer ${jwtToken}`,
        };

        if (usernameInput === user.username) {
          toast.info("No changes made to the username.");
          return;
        }

        // disable eslint for this line (no-unused-vars)
        // eslint-disable-next-line no-unused-vars
        const response = await axios.put(
          `${BACKEND_URL}/users/${user._id}`,
          {
            username: usernameInput,
          },
          { headers }
        );

        setUser((prevUser) => ({
          ...prevUser,
          username: usernameInput,
        }));

        toast.success("Username updated successfully.");
      } else {
        toast.error("You are not authorized to modify this username.");
      }
    } catch (error) {
      if (error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Error updating username.");
      }
    }
  };

  // Handle changing the email
  const handleUpdateEmail = async () => {
    try {
      if (loggedInUserId && user && loggedInUserId === user._id) {
        const jwtToken = localStorage.getItem("jwtToken");
        if (!jwtToken) {
          toast.error("You are not logged in.");
          return;
        }

        const headers = {
          Authorization: `Bearer ${jwtToken}`,
        };

        if (emailInput === user.email) {
          toast.info("No changes made to the email.");
          return;
        }

        // disable eslint for this line (no-unused-vars)
        // eslint-disable-next-line no-unused-vars
        const response = await axios.put(
          `${BACKEND_URL}/users/${user._id}`,
          {
            email: emailInput,
          },
          { headers }
        );

        setUser((prevUser) => ({
          ...prevUser,
          email: emailInput,
        }));

        toast.success("Email updated successfully.");
      } else {
        toast.error("You are not authorized to modify this email.");
      }
    } catch (error) {
      if (error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Error updating email.");
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Function to handle avatar upload
  const handleUploadAvatar = async () => {
    try {
      if (!selectedFile) {
        toast.error("Please choose an avatar file.");
        return;
      }

      const REACT_APP_MAX_FILE_SIZE = process.env.REACT_APP_MAX_FILE_SIZE;
      if (selectedFile.size > REACT_APP_MAX_FILE_SIZE) {
        toast.error(`File size must be less than ${REACT_APP_MAX_FILE_SIZE / (1024 * 1024)} MB.`);
        return;
      }

      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) {
        toast.error("You are not logged in.");
        return;
      }

      const formData = new FormData();
      formData.append("avatar", selectedFile);

      const userId = user._id;
      const response = await axios.put(
        `${BACKEND_URL}/users/${userId}/avatar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      setAvatar(response.data.avatar);
      toast.success("Avatar updated successfully.");
    } catch (error) {
      toast.error("Error uploading avatar.");
    }
  };

  const handleDeleteAccount = () => {
    confirmAlert({
      title: "Confirmation of Deletion",
      message: "Are you sure you want to delete your account?",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            axios
              .delete(`${BACKEND_URL}/users/${loggedInUserId}`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
                },
              })
              .then(() => {
                localStorage.clear();
                navigate("/");
              })
              .catch((error) => {
                toast.error("Error deleting account.");
              });
          },
        },
        {
          label: "No",
        },
      ],
    });
  };

  return (
    <div className="max-w-md mx-auto p-4" style={{ paddingTop: "100px" }}>
      {user ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">{user.username}'s Profile</h2>

          {loggedInUserId && user && loggedInUserId === user._id && (
            <div>
              <div>
                <h3 className="text-lg font-bold mb-2">Edit Username</h3>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full px-4 py-2 mb-4 border rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleUpdateUsername}
                  disabled={usernameInput.toLowerCase() === user.username.toLowerCase()}
                  className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                >
                  Save Username
                </button>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-bold mb-2">Edit Email</h3>
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
                  Save Email
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
                    alt="User's Avatar"
                    className="w-48 h-48 mb-4 rounded"
                  />
                ) : (
                  <p>No uploaded avatar</p>
                )}
                <Dropzone
                  onDrop={(acceptedFiles) => setSelectedFile(acceptedFiles[0])}
                >
                  {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps()} className="p-4 border rounded cursor-pointer">
                      <input {...getInputProps()} />
                      <p>
                        Drag and drop a file here or click to upload an avatar
                      </p>
                    </div>
                  )}
                </Dropzone>
                <button
                  onClick={handleUploadAvatar}
                  disabled={!selectedFile}
                  className="w-full mt-4 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                >
                  Upload Avatar
                </button>
              </div>
              <div className="mt-4">
                <h2 className="text-2xl font-bold mb-2">Delete Account</h2>
                <button
                  onClick={handleDeleteAccount}
                  className="w-full px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:bg-red-600"
                >
                  Delete Account
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
