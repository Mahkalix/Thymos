"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import defaultImage from "../../../public/default-avatar.jpg";
import withAuth from "@/hoc/withAuth";
import Avatar from "boring-avatars";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function UserPage() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    profileImage: "",
  });
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(""); // Message de succès
  const [isEditing, setIsEditing] = useState(false); // État pour activer/désactiver le mode édition
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false); // État pour gérer l'ouverture de la sélection d'avatars
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const router = useRouter();
  const defaultImagePath = defaultImage.src;

  const avatarSeeds = [
    "default1.jpg",
    "default2.jpg",
    "default3.jpg",
    "default4.jpg",
    "default5.jpg",
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/user");
        if (res.data.id) {
          setUser(res.data);
          setFormData({
            email: res.data.email,
            profileImage: res.data.profileImage || "default",
            newPassword: "****",
          });
          console.log("res.data.profileImage", res);
        } else {
          setError(res.data.message || "User not logged in.");
        }
      } catch (err) {
        console.error("Failed to fetch user information:", err);
        setError("Failed to fetch user information.");
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
      setError(null);
    }
  }, [error]);

  useEffect(() => {
    if (message) {
      toast.success(message);
      setMessage("");
    }
  }, [message]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAvatarSelect = async (seed) => {
    setFormData({ ...formData, profileImage: seed });
    setUser((prevUser) => ({ ...prevUser, profileImage: seed }));
    setIsAvatarSelectorOpen(false);

    try {
      const response = await fetch("/api/auth/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          newProfileImage: seed,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("Profile image updated successfully!");
      } else {
        setError(result.message || "Failed to update profile image.");
      }
    } catch (error) {
      console.error("Request failed:", error);
      setError("Failed to update profile image.");
    }
  };

  const handleUpdateDefault = async () => {
    setFormData({ ...formData, profileImage: defaultImagePath });
    setUser((prevUser) => ({ ...prevUser, profileImage: defaultImagePath }));

    try {
      const response = await fetch("/api/auth/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          newProfileImage: defaultImagePath,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("Profile picture replaced with default successfully!");
        setIsEditing(false);
      } else {
        setError(result.message || "Failed to replace profile picture.");
      }
    } catch (error) {
      console.error("Request failed:", error);
      setError("Failed to replace profile picture.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      const response = await fetch("/api/auth/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          oldPassword: oldPassword,
          newPassword: newPassword,
          newProfileImage: formData.profileImage,
          newEmail: formData.email,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("Profile updated successfully!");
        setIsEditing(false);
      } else {
        setError(result.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Request failed:", error);
      setError("Failed to update profile.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your account?")) return;

    try {
      const response = await fetch("/api/auth/user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.message || "Failed to delete account.");
        return;
      }

      const result = await response.json();
      toast.success(result.message || "Account deleted successfully.");

      router.push("/");
    } catch (err) {
      console.error("Request failed:", err);
      setError("Failed to delete account.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex items-center justify-center bg-cover bg-vinyle p-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl text-black font-normal text-center">
            Your Account
          </h1>
          {user ? (
            <>
              <div className="relative flex items-center justify-center">
                {formData.profileImage === "null" ||
                formData.profileImage === defaultImagePath ? (
                  <img
                    src={defaultImagePath}
                    alt="Profile"
                    className={`shadow-xl rounded-full border-2 border-white`}
                    width={80}
                    height={80}
                  />
                ) : (
                  <Avatar
                    size={80}
                    name={formData.profileImage}
                    variant="marble"
                    colors={
                      formData.profileImage === "default1.jpg"
                        ? [
                            "#c92c2c",
                            "#cf6123",
                            "#f3c363",
                            "#f1e9bb",
                            "#5c483a",
                          ]
                        : formData.profileImage === "default2.jpg"
                        ? [
                            "#c92c2c",
                            "#cf6123",
                            "#f3c363",
                            "#f1e9bb",
                            "#5c483a",
                          ]
                        : formData.profileImage === "default3.jpg"
                        ? [
                            "#c92c2c",
                            "#cf6123",
                            "#f3c363",
                            "#f1e9bb",
                            "#5c483a",
                          ]
                        : formData.profileImage === "default4.jpg"
                        ? [
                            "#c92c2c",
                            "#cf6123",
                            "#f3c363",
                            "#f1e9bb",
                            "#5c483a",
                          ]
                        : formData.profileImage === "default5.jpg"
                        ? [
                            "#c92c2c",
                            "#cf6123",
                            "#f3c363",
                            "#f1e9bb",
                            "#5c483a",
                          ]
                        : [
                            "#c92c2c",
                            "#cf6123",
                            "#f3c363",
                            "#f1e9bb",
                            "#5c483a",
                          ]
                    }
                  />
                )}

                <button
                  type="button"
                  className="w-8 h-8 absolute top-12 right-36 text-l bg-white rounded-full p-1 shadow-lg border-2 border-white"
                  onClick={() => setIsAvatarSelectorOpen(!isAvatarSelectorOpen)}
                >
                  ✏️
                </button>
              </div>

              {isAvatarSelectorOpen && (
                <div className="flex flex-wrap gap-4 justify-center mt-4">
                  {avatarSeeds.map((seed, index) => (
                    <div
                      key={index}
                      onClick={() => handleAvatarSelect(seed)} // Sélection d'un avatar parmi les options
                      className="cursor-pointer shadow-sm rounded-full border-2 border-white"
                    >
                      <Avatar
                        size={40}
                        name={seed}
                        variant="marble"
                        colors={[
                          "#c92c2c",
                          "#cf6123",
                          "#f3c363",
                          "#f1e9bb",
                          "#f1e9bb",
                          "#5c483a",
                        ]}
                      />
                    </div>
                  ))}
                  <div className="w-full flex justify-center">
                    <button
                      type="button"
                      className="w-10 h-10 p-7 text-2xl text-white bg-white shadow-sm border-gray border rounded-full mt-2 flex items-center justify-center"
                      onClick={handleUpdateDefault}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-black"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`text-black w-full px-3 py-2 border rounded-full focus:outline-none focus:ring focus:ring-black ${
                      !isEditing ? "opacity-50" : ""
                    }`}
                  />
                </div>
                {!isEditing && (
                  // Password
                  <div className="relative">
                    <label
                      htmlFor="newPassword"
                      className="block mb-2 text-sm font-medium text-black"
                    >
                      Password
                    </label>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      value={newPassword}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`text-black w-full px-3 py-2 border rounded-full focus:outline-none focus:ring focus:ring-gray ${
                        !isEditing ? "opacity-50" : ""
                      }`}
                    />
                  </div>
                )}
                {/* Old Password */}
                {isEditing && (
                  <div className="relative">
                    <label
                      htmlFor="oldPassword"
                      className="block mb-2 text-sm font-medium text-black"
                    >
                      Old Password
                    </label>
                    <input
                      type={showOldPassword ? "text" : "password"}
                      id="oldPassword"
                      name="oldPassword"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="text-black w-full px-3 py-2 border rounded-full focus:outline-none focus:ring focus:ring-gray"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-12 transform -translate-y-1/2 text-gray-500"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                    >
                      {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                )}
                {/* New Password */}
                {isEditing && (
                  <div className="relative">
                    <label
                      htmlFor="newPassword"
                      className="block mb-2 text-sm font-medium text-black"
                    >
                      New Password
                    </label>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="text-black w-full px-3 py-2 border rounded-full focus:outline-none focus:ring focus:ring-gray"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-12 transform -translate-y-1/2 text-gray-500"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                )}
                {/* Confirm New Password */}
                {isEditing && (
                  <div className="relative">
                    <label
                      htmlFor="confirmNewPassword"
                      className="block mb-2 text-sm font-medium text-black"
                    >
                      Confirm New Password
                    </label>
                    <input
                      type={showConfirmNewPassword ? "text" : "password"}
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="text-black w-full px-3 py-2 border rounded-full focus:outline-none focus:ring focus:ring-gray"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-12 transform -translate-y-1/2 text-gray-500"
                      onClick={() =>
                        setShowConfirmNewPassword(!showConfirmNewPassword)
                      }
                    >
                      {showConfirmNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                )}
                {/* Bouton pour passer en mode édition */}
                <button
                  type="submit"
                  className={`w-full px-4 py-2 font-sm text-white rounded-full focus:outline-none ${
                    isEditing ? "bg-black" : "bg-gray-500"
                  }`}
                >
                  {isEditing ? "Save Changes" : "Edit Profile"}
                </button>
              </form>

              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 font-sm text-white bg-red-500 rounded-full focus:outline-none mt-4"
              >
                Delete My Account
              </button>
            </>
          ) : (
            <div className="flex flex-grow items-center justify-center">
              <div className="justify-center flex items-center animate-spin rounded-full h-10 w-10 border-4 border-t-4 border-t-white border-black"></div>
            </div>
          )}
        </div>
      </div>
      <Footer />
      <ToastContainer />
    </div>
  );
}

export default withAuth(UserPage);
