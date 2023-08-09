import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Dropzone from "react-dropzone";
import { toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const EditUser = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [plainNameInput, setPlainNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [roleInput, setRoleInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [avatar, setAvatar] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // State variable to check if the currently logged-in user is an admin
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
        // You can get the ID of the logged-in user here (possibly from the backend) and check if it's an admin.
        // For this example, I'll assume you already have this information.

        // Get the username of the logged-in user from local storage
        const loggedInUsername = localStorage.getItem("loggedInUsername");

        // Check if the logged-in user is an admin
        if (loggedInUsername) {
            try {
                const response = await axios.get(
                  `${BACKEND_URL}/users/${loggedInUsername}`
                );
                if (response.data.user.role !== "admin") {
                    // If the logged-in user is not an admin, redirect them to the homepage or another appropriate page.
                    navigate("/");
                    } else {
                        // If the logged-in user is an admin, update the local state to reflect that
                        setIsAdmin(true);
                    }


            } catch (error) {
                // Handle the error of fetching the logged-in user's profile, e.g., show an error message or redirect to an error page
                toast.error("Error while fetching the logged-in user's profile.");
            }

        } else {
          // If the username of the logged-in user is not available (not authenticated), redirect them to the homepage or another appropriate page.
          navigate("/");
        }
      } catch (error) {
        // Handle the error of fetching the profile, e.g., show an error message or redirect to an error page
        toast.error("Error while fetching the profile.");
      }
    };

    fetchProfile();
  }, [username, navigate]);

  // Function to handle updating the username
  const handleUpdateUsername = async () => {
    try {
      if (isAdmin) { // Check if the logged-in user is an admin to allow updating the username
        const jwtToken = localStorage.getItem("jwtToken");
        if (!jwtToken) {
          // If JWT token is not available, the user is not authenticated, don't proceed with the update
          toast.error("You are not logged in.");
          return;
        }

        // If the username input is the same as the current username, don't proceed with the update
        if (usernameInput === user.username) {
          toast.info("No changes made to the username.");
          return;
        }

        // Include the JWT token in the request headers
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
          { headers } // Pass the headers object to include the JWT token
        );

        toast.success("Username updated successfully.");
      } else {
        toast.error("You are not authorized to modify this username.");
      }
    } catch (error) {
      if (error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Error while updating the username.");
      }
    }
  };

  const handleUpdatePlainName = async () => {
    try {
      if (isAdmin) { // Check if the logged-in user is an admin to allow updating the username
        const jwtToken = localStorage.getItem("jwtToken");
        if (!jwtToken) {
          // If JWT token is not available, the user is not authenticated, don't proceed with the update
          toast.error("You are not logged in.");
          return;
        }

        // If the username input is the same as the current username, don't proceed with the update
        if (plainNameInput === user.plainName) {
          toast.info("No changes made to the name.");
          return;
        }

        // Include the JWT token in the request headers
        const headers = {
          Authorization: `Bearer ${jwtToken}`,
        };

        const userId = user._id;
        // eslint-disable-next-line no-unused-vars
        const response = await axios.put(
          `${BACKEND_URL}/users/${userId}`,
          {
            plainName: plainNameInput,
          },
          { headers } // Pass the headers object to include the JWT token
        );

        toast.success("Name updated successfully.");
      } else {
        toast.error("You are not authorized to modify this name.");
      }
    } catch (error) {
      if (error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Error while updating the name.");
      }
    }
  };


   // Function to handle updating the email
   const handleUpdateEmail = async () => {
    try {
      if (isAdmin) { // Check if the logged-in user is an admin to allow updating the email
        const jwtToken = localStorage.getItem("jwtToken");
        if (!jwtToken) {
          // If JWT token is not available, the user is not authenticated, don't proceed with the update
          toast.error("You are not logged in.");
          return;
        }

        // If the email input is the same as the current email, don't proceed with the update
        if (emailInput === user.email) {
          toast.info("No changes made to the email.");
          return;
        }

        // Include the JWT token in the request headers
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
          { headers } // Pass the headers object to include the JWT token
        );

        toast.success("Email updated successfully.");
      } else {
        toast.error("You are not authorized to modify this email.");
      }
    } catch (error) {
      if (error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Error while updating the email.");
      }
    }
  };

  // Function to handle updating the role
  const handleUpdateRole = async () => {
    try {
      if (isAdmin) { // Check if the logged-in user is an admin to allow updating the role
        const jwtToken = localStorage.getItem("jwtToken");
        if (!jwtToken) {
          // If JWT token is not available, the user is not authenticated, don't proceed with the update
          toast.error("You are not logged in.");
          return;
        }

        // If the role input is the same as the current role, don't proceed with the update
        if (roleInput === user.role) {
          toast.info("No changes made to the role.");
          return;
        }

        // Include the JWT token in the request headers
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
          { headers } // Pass the headers object to include the JWT token
        );

        toast.success("Role updated successfully.");
      } else {
        toast.error("You are not authorized to modify this role.");
      }
    } catch (error) {
      if (error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Error while updating the role.");
      }
    }
  };

  // Function to handle avatar upload
  const handleUploadAvatar = async () => {
    try {
      // Check if a file has been selected before submitting the request
      if (!selectedFile) {
        toast.error("Please choose an avatar file.");
        return;
      }

      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) {
        // If JWT token is not available, the user is not authenticated, don't proceed with the update
        toast.error("You are not logged in.");
        return;
      }

      // Create a new FormData object to send the file
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      // Send a PUT request to the backend to update the avatar
      const userId = user._id;
      const response = await axios.put(
        `${BACKEND_URL}/users/${userId}/avatar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Important for file uploads
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      // If the request succeeds, update the avatar in the local component state
      setAvatar(response.data.avatar);
      toast.success("Avatar updated successfully.");
    } catch (error) {
      toast.error("Error while uploading the avatar.");
    }
  };

  return (
    <div className="container mx-auto flex flex-col min-h-screen">
      {user ? (
        <div>
          <h2 className="text-3xl font-bold my-4">{user.username}'s Profile</h2>
          {isAdmin && (
            <div className="space-y-4">
              <div className="flex items-center">
                <h3 className="font-bold">Edit Username</h3>
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
                  Save Username
                </button>
              </div>
              <div className="flex items-center">
                <h3 className="font-bold">Edit Name</h3>
                <input
                  type="text"
                  value={plainNameInput}
                  onChange={(e) => setPlainNameInput(e.target.value)}
                  className="px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-500"
                />
                <button
                  onClick={handleUpdatePlainName}
                  disabled={plainNameInput === user.plainName}
                  className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                >
                  Save Name
                </button>
              </div>
              <div className="flex items-center">
                <h3 className="font-bold">Edit Email</h3>
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
                  Save Email
                </button>
              </div>
              <div className="flex items-center">
                <h3 className="font-bold">Edit Role</h3>
                <select
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  className="px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  onClick={handleUpdateRole}
                  disabled={roleInput === user.role}
                  className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                >
                  Save Role
                </button>
              </div>
              <div className="flex items-center">
                <h2 className="font-bold">Avatar</h2>
                {avatar ? (
                  <img
                    src={`${BACKEND_URL}/avatars/${avatar}`}
                    alt="User Avatar"
                    className="w-32 h-32 rounded-full mx-4"
                    style={{ background: user?.color || '' }}
                  />
                ) : (
                  <p>No uploaded avatar</p>
                )}
                <Dropzone onDrop={(acceptedFiles) => setSelectedFile(acceptedFiles[0])}>
                  {({ getRootProps, getInputProps }) => (
                    <div className="border rounded-md p-4 mt-2 cursor-pointer" {...getRootProps()}>
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
                  className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 ml-2"
                >
                  Upload Avatar
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p>Loading Profile...</p>
      )}
       
    </div>
  );
};

export default EditUser;
