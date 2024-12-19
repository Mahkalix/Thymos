"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import defaultImage from "../../../public/default-avatar.jpg";
import withAuth from "@/hoc/withAuth";
import Avatar from "boring-avatars";

function UserPage() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    profileImage: "",
  });
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(""); // Message de succès
  const [isEditing, setIsEditing] = useState(false); // État pour activer/désactiver le mode édition
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false); // État pour gérer l'ouverture de la sélection d'avatars
  const router = useRouter();
  const defaultImagePath = defaultImage.src;
  console.log(defaultImagePath);

  const avatarSeeds = [
    "default1",
    "default2",
    "default3",
    "default4",
    "default5",
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/user");
        if (res.data.id) {
          setUser(res.data);
          setFormData({
            email: res.data.email,
            newPassword: "",
            profileImage: res.data.profileImage || defaultImagePath,
          });
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAvatarSelect = (seed) => {
    setFormData({ ...formData, profileImage: seed });
    setUser((prevUser) => ({ ...prevUser, profileImage: seed }));
    setIsAvatarSelectorOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    try {
      const response = await fetch("/api/auth/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          newPassword: formData.newPassword,
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
      const res = await axios.delete("/api/auth/user");
      alert(res.data.message || "Account deleted successfully.");
      router.push("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete account.");
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
          {error && <p className="text-red-500 text-center">{error}</p>}
          {message && <p className="text-green-500 text-center">{message}</p>}
          {user ? (
            <>
              <div className="relative flex items-center justify-center">
                {formData.profileImage &&
                formData.profileImage !== "null" &&
                formData.profileImage !== "" ? (
                  formData.profileImage ? (
                    <img
                      src={defaultImagePath}
                      alt="Profile"
                      className={`shadow-xl rounded-full border-2 border-white ${
                        !isEditing ? "opacity-50" : ""
                      }`}
                      width={80}
                      height={80}
                    />
                  ) : (
                    <Avatar
                      name={formData.profileImage}
                      size={80}
                      variant="marble"
                      colors={[
                        "#c92c2c",
                        "#cf6123",
                        "#f3c363",
                        "#f1e9bb",
                        "#5c483a",
                      ]}
                      className={!isEditing ? "opacity-50" : ""}
                    />
                  )
                ) : null}

                <button
                  type="button"
                  className={`w-8 h-8 absolute top-12 right-36 text-l bg-white rounded-full p-1 shadow-lg border-2 border-white ${
                    !isEditing ? "cursor-not-allowed" : ""
                  }`}
                  onClick={() =>
                    isEditing && setIsAvatarSelectorOpen(!isAvatarSelectorOpen)
                  } // Ouvre/ferme la sélection d'avatars
                  disabled={!isEditing} // Désactive le bouton si isEditing est false
                >
                  ✏️
                </button>
              </div>

              {/* Affichage de la sélection d'avatars si l'état isAvatarSelectorOpen est true */}
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
                          "#5c483a",
                        ]}
                      />
                    </div>
                  ))}
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
                    disabled={!isEditing} // Désactive l'édition si isEditing est false
                    className={`text-black w-full px-3 py-2 border rounded-full focus:outline-none focus:ring focus:ring-black ${
                      !isEditing ? "opacity-50" : ""
                    }`}
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block mb-2 text-sm font-medium text-black"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    disabled={!isEditing} // Désactive l'édition si isEditing est false
                    className={`text-black w-full px-3 py-2 border rounded-full focus:outline-none focus:ring focus:ring-gray ${
                      !isEditing ? "opacity-50" : ""
                    }`}
                  />
                </div>

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
    </div>
  );
}

export default withAuth(UserPage);
