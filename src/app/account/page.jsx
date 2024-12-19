"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";

function UserPage() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    profileImage: "", // Initialisation avec une chaîne vide
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const fileInputRef = useRef(null); // Référence pour l'input de fichier

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/user");
        console.log("Fetched user data:", res.data); // Vérifie les données récupérées
        if (res.data.id) {
          setUser(res.data);
          setFormData({
            email: res.data.email,
            newPassword: "",
            profileImage: res.data.profileImage || "/default-avatar.jpg", // Utilisation de l'URL relative pour l'image par défaut
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("Profile image updated:", reader.result); // Vérifie le chargement de l'image
        setFormData({ ...formData, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
      setImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError(null);

    console.log("Data being submitted:", formData); // Vérifie les données du formulaire

    try {
      const res = await axios.patch("/api/auth/user", formData);
      console.log("Update response:", res.data); // Vérifie la réponse de l'API
      setMessage(res.data.message || "Update successful!");
      setUser(res.data.user);
    } catch (err) {
      console.error(
        "An error occurred during update:",
        err.response?.data || err
      );
      setError(
        err.response?.data?.message || "An error occurred during update."
      );
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your account?")) return;

    console.log("Attempting to delete user ID:", user?.id); // Vérifie l'ID avant suppression

    try {
      const res = await axios.delete("/api/auth/user");
      console.log("Delete response:", res.data); // Vérifie la réponse de l'API
      alert(res.data.message || "Account deleted successfully.");
      router.push("/login");
    } catch (err) {
      console.error("Failed to delete account:", err.response?.data || err);
      setError(err.response?.data?.message || "Failed to delete account.");
    }
  };

  const generateAvatar = async () => {
    try {
      const seed = user?.email || "default";
      const avatarUrl = `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(
        seed
      )}`;
      console.log("Generated avatar URL:", avatarUrl); // Vérifie l'URL générée
      setFormData({ ...formData, profileImage: avatarUrl });
      setError(null);
    } catch (err) {
      console.error("Failed to generate avatar:", err);
      setError("Failed to generate avatar.");
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click(); // Ouvre le dialogue de fichier lorsqu'on clique sur l'emoji
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex items-center justify-center bg-cover bg-vinyle p-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl text-black font-normal text-center">
            Manage Your Account
          </h1>
          {error && <p className="text-red-500 text-center">{error}</p>}
          {message && <p className="text-green-500 text-center">{message}</p>}
          {user ? (
            <>
              {console.log("Current user ID:", user.id)} {/* Vérifie l'ID */}
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    disabled={user.provider !== "email"}
                    className="text-black w-full px-3 py-2 border rounded-full focus:outline-none focus:ring focus:ring-black"
                  />
                </div>

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
                    className="text-black w-full px-3 py-2 border rounded-full focus:outline-none focus:ring focus:ring-black"
                  />
                </div>

                <div>
                  <label
                    htmlFor="profileImage"
                    className="block mb-2 text-sm font-medium text-black"
                  >
                    Profile Image
                  </label>
                  <div className="relative flex items-center">
                    <div
                      className="cursor-pointer w-24 h-24 rounded-full overflow-hidden"
                      onClick={handleAvatarClick}
                    >
                      <img
                        src={formData.profileImage || "/default-avatar.jpg"} // Utilisation de l'URL par défaut
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAvatarClick} // Ouvre le dialogue de fichier
                      className="absolute top-0 right-0 m-2 text-xl"
                    >
                      ✏️
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef} // Référence de l'input
                    onChange={handleImageChange}
                    className="hidden" // Cache l'input de fichier
                  />
                  <button
                    type="button"
                    onClick={generateAvatar}
                    className="w-full mt-2 px-4 py-2 text-white bg-green-500 rounded-full focus:outline-none"
                  >
                    Generate Avatar
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 font-sm text-white bg-black rounded-full focus:outline-none"
                >
                  Update
                </button>
              </form>
            </>
          ) : (
            <p>Loading user information...</p>
          )}

          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 font-sm text-white bg-red-500 rounded-full focus:outline-none mt-4"
          >
            Delete My Account
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default UserPage;
