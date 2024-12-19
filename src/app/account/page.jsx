"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
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
  const [message, setMessage] = useState("");
  const router = useRouter();
  const fileInputRef = useRef(null);

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
            profileImage: res.data.profileImage || "/default-avatar.jpg",
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError(null);

    try {
      const res = await axios.patch("/api/auth/user", formData);
      setMessage(res.data.message || "Update successful!");
      setUser(res.data.user);
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred during update."
      );
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

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  // Handle image upload from file input
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          profileImage: reader.result, // Set the profile image from file input
        });
        setUser((prevUser) => ({
          ...prevUser,
          profileImage: reader.result, // Update user profile image
        }));
      };
      reader.readAsDataURL(file); // Read image as base64
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex items-center justify-center bg-cover bg-vinyle p-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <h1 className="text-1xl text-black font-normal text-center">
            Your Account
          </h1>
          {error && <p className="text-red-500 text-center">{error}</p>}
          {message && <p className="text-green-500 text-center">{message}</p>}
          {user ? (
            <>
              <div className="relative flex items-center justify-center">
                {formData.profileImage &&
                !formData.profileImage.startsWith("data:image") ? (
                  <Avatar
                    onClick={handleAvatarClick}
                    className="shadow-xl rounded-full border-2 border-white"
                    name={formData.profileImage || "default-avatar"}
                    colors={[
                      "#c92c2c",
                      "#cf6123",
                      "#f3c363",
                      "#f1e9bb",
                      "#5c483a",
                    ]}
                    variant="marble"
                    size={80}
                  />
                ) : (
                  <img
                    src={formData.profileImage || "/default-avatar.jpg"}
                    alt="Profile"
                    className="shadow-xl rounded-full border-2 border-white"
                    width={80}
                    height={80}
                    onClick={handleAvatarClick}
                  />
                )}
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="w-8 h-8 absolute top-12 right-36 text-l bg-white rounded-full p-1 shadow-lg border-2 border-white"
                >
                  ✏️
                </button>
              </div>
              <div>
                <div className="flex flex-wrap gap-4 justify-center">
                  {avatarSeeds.map((seed, index) => (
                    <div
                      key={index}
                      onClick={() => handleAvatarSelect(seed)}
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
              </div>
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
                    className="text-black w-full px-3 py-2 border rounded-full focus:outline-none focus:ring focus:ring-grey"
                  />
                </div>

                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                  />
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
            <div className="flex flex-grow items-center justify-center">
              <div className="justify-center flex items-center animate-spin rounded-full h-10 w-10 border-4 border-t-4 border-t-white border-black"></div>
            </div>
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

export default withAuth(UserPage);
