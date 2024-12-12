"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import * as faceapi from "face-api.js";
import Header from "../components/Header";
import withAuth from "../../hoc/withAuth";

function DashboardPage() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraError, setCameraError] = useState(null); // État pour gérer les erreurs de caméra
  const [userId, setUserId] = useState(null);

  const videoRef = useRef(null);
  const router = useRouter();

  const availableMoods = useMemo(
    () => [
      { icon: "😊", name: "Happy", color: "#FFD700" },
      { icon: "😢", name: "Sad", color: "#1E90FF" },
      { icon: "😆", name: "Excited", color: "#FF4500" },
      { icon: "😌", name: "Calm", color: "#98FB98" },
      { icon: "😤", name: "Angry", color: "#8A2BE2" },
    ],
    []
  );

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await fetch("/api/auth/user");
        if (!res.ok) {
          throw new Error("Utilisateur non connecté");
        }
        const data = await res.json();
        setUserId(data.id);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceExpressionNet.loadFromUri("/models");
        console.log("Models loaded successfully");
      } catch (err) {
        console.error("Erreur lors du chargement des modèles :", err);
      }
    };

    loadModels();

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setInterval(async () => {
          if (videoRef.current && faceapi.nets.tinyFaceDetector.isLoaded) {
            const detections = await faceapi
              .detectAllFaces(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions()
              )
              .withFaceExpressions();

            if (detections.length > 0) {
              const expressions = detections[0].expressions;
              const dominantExpression = Object.keys(expressions).reduce(
                (a, b) => (expressions[a] > expressions[b] ? a : b)
              );

              const moodMapping = {
                happy: "Happy",
                sad: "Sad",
                surprised: "Excited",
                neutral: "Calm",
                fearful: "Angry",
                angry: "Angry",
                disgusted: "Angry",
              };

              const mappedMood = availableMoods.find(
                (mood) => mood.name === moodMapping[dominantExpression]
              );

              if (mappedMood) {
                setSelectedMood(mappedMood);
              }
            }
          }
        }, 1000);

        return () => clearInterval(intervalId);
      } catch (err) {
        console.error("Erreur avec la caméra :", err);
        setCameraError(
          "Please activate your camera to detect your mood or choose one manually."
        );
      }
      const streamCleanup = async () => {
        const stream = videoRef.current?.srcObject;
        const tracks = stream?.getTracks();
        tracks?.forEach((track) => track.stop());
      };

      return () => {
        streamCleanup();
      };
    };

    startVideo();
  }, [availableMoods]);

  const handleMoodClick = (mood) => {
    setSelectedMood((prevMood) => (prevMood?.name === mood.name ? null : mood));
  };

  const saveMood = async () => {
    if (!userId) {
      setError("L'ID utilisateur est requis pour enregistrer l'humeur.");
      return;
    }
    if (!selectedMood) {
      setError("Please choose a mood before saving.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/moods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moods: [selectedMood.name],
          userId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || "Échec de l'enregistrement de l'humeur"
        );
      }

      router.push(`/playlist?mood=${selectedMood.name}`);
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de la sauvegarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <motion.div
          animate={{
            backgroundColor: selectedMood?.color || "bg-vinyle",
          }}
          transition={{ duration: 0.5 }}
          className={`flex flex-col items-center justify-center flex-grow ${
            selectedMood === null ? "bg-vinyle" : "bg-vinyle"
          }`}
        >
          <h1
            className="text-2xl text-white font-bold mb-8"
            style={{
              textShadow:
                "2px 2px 0 #000000, -2px -2px 0 #000000, 2px -2px 0 #000000, -2px 2px 0 #000000",
            }}
          >
            How are you feeling ?
          </h1>

          {cameraError ? (
            <div className="text-red-500 p-4 bg-white rounded-3xl shadow-xl  mx-auto mb-8 text-center">
              {cameraError}
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-auto mb-6 p-2 bg-white rounded-3xl shadow-xl  mx-auto"
              style={{
                maxWidth: "300px",
                borderRadius: "20px",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
              }}
            />
          )}

          {loading ? (
            <p className="text-lg text-white">Chargement...</p>
          ) : (
            <div className="flex flex-wrap gap-6 mb-8">
              {availableMoods.map((mood, index) => (
                <motion.div
                  key={index}
                  onClick={() => handleMoodClick(mood)}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className={`flex flex-col items-center justify-center w-32 h-32 rounded-full shadow-lg cursor-pointer`}
                  style={{
                    backgroundColor:
                      selectedMood?.name === mood.name ? mood.color : "white",
                    boxShadow:
                      selectedMood?.name === mood.name
                        ? "0 0 15px rgba(0, 0, 0, 0.3)"
                        : "none",
                  }}
                >
                  <span className="text-4xl mb-2">{mood.icon}</span>
                  <span className="text-sm font-medium text-black">
                    {mood.name}
                  </span>
                </motion.div>
              ))}
            </div>
          )}

          {error && <p className="text-white mb-4">{error}</p>}

          <motion.button
            onClick={saveMood}
            className="px-6 py-2 bg-black text-white font-sm rounded-full focus:outline-none  transition duration-300"
            disabled={loading || !selectedMood}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Save
          </motion.button>
        </motion.div>
      </div>
    </>
  );
}

export default withAuth(DashboardPage);
