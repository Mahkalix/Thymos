"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import * as faceapi from "face-api.js";
import Header from "../components/Header";
import withAuth from "../../hoc/withAuth";
import Camera from "../../../public/camera-off.svg";

function DashboardPage() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraError, setCameraError] = useState(null); // État pour gérer les erreurs de caméra
  const [userId, setUserId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true); // État pour gérer le chargement de la vidéo
  const videoRef = useRef(null);
  const router = useRouter();
  const noCamera = Camera.src;

  const availableMoods = useMemo(
    () => [
      { icon: "😊", name: "Happy", color: "#FFD700" },
      { icon: "😢", name: "Sad", color: "#1E90FF" },
      { icon: "😮​", name: "Surprised", color: "#FF4500" },
      { icon: "😐​", name: "Neutral", color: "#98FB98" },
      { icon: "😤", name: "Angry", color: "#8A2BE2" },
    ],
    []
  );

  const toggleVideoPlayback = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

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
          videoRef.current.onloadeddata = () => {
            setVideoLoading(false); // La vidéo est chargée
          };
        }

        const intervalId = setInterval(async () => {
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
                surprised: "Surprised",
                neutral: "Neutral",
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
          "Please activate your camera in your browser to detect your mood or choose one manually."
        );
      }
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

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-4 border-t-white border-gray-700"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-col items-center justify-center flex-grow bg-vinyle m-0">
          <div className="relative w-full overflow-hidden whitespace-nowrap p-2 bg-black mb-8">
            <motion.div
              duration={0.5}
              className="text-3xl font-bold inline-block"
              animate={{ x: ["0%", "-100%"] }}
              transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
              style={{ display: "inline-block", whiteSpace: "nowrap" }}
            >
              HOW ARE YOU FEELING TODAY ? 😊 ​HOW ARE YOU FEELING TODAY ? 🥲​
              HOW ARE YOU FEELING TODAY ? 😮​ HOW ARE YOU FEELING TODAY ? 😐​
              HOW ARE YOU FEELING TODAY ? 😤​ HOW ARE YOU FEELING TODAY ? 😊 HOW
              ARE YOU FEELING TODAY ? 🥲 HOW ARE YOU FEELING TODAY ?​ 😮​ HOW
              ARE YOU FEELING TODAY ? 😐​ HOW ARE YOU FEELING TODAY ? 😤​ HOW
              ARE YOU FEELING TODAY ?
            </motion.div>
          </div>

          {cameraError ? (
            <div
              className="flex flex-col justify-center items-center text-white-500 h-auto mb-6 p-2 bg-black rounded-3xl shadow-xl mx-auto text-center"
              style={{ height: "250px", width: "300px" }}
            >
              <img src={noCamera} alt="No Camera" className="w-16 h-16 mb-4" />
              {cameraError}
            </div>
          ) : (
            <div className="relative w-full max-w-md">
              {videoLoading && (
                <div
                  className="flex justify-center items-center w-full h-auto mb-6 p-2 bg-black rounded-3xl shadow-xl mx-auto"
                  style={{ height: "250px", width: "300px" }}
                >
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-4 border-t-white border-gray-700"></div>
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                muted
                transform="scaleX(-1)"
                className={`w-full h-auto mb-6 p-2 bg-black rounded-3xl shadow-xl mx-auto ${
                  videoLoading ? "hidden" : ""
                }`}
                style={{
                  maxWidth: "300px",
                  borderRadius: "20px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                }}
              />
              <button
                onClick={toggleVideoPlayback}
                className={`absolute top-2 right-20 bg-black text-white m-2 px-4 py-2 rounded-full shadow-lg ${
                  videoLoading ? "hidden" : ""
                }`}
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
            </div>
          )}

          {loading ? (
            <p className="text-lg text-white">Chargement...</p>
          ) : (
            <div className="flex flex-wrap gap-6 mb-8 justify-center">
              {availableMoods.map((mood, index) => (
                <motion.div
                  key={index}
                  onClick={() => handleMoodClick(mood)}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className={` flex flex-col items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full shadow-lg cursor-pointer`}
                  style={{
                    backgroundColor:
                      selectedMood?.name === mood.name ? mood.color : "white",
                    boxShadow:
                      selectedMood?.name === mood.name
                        ? "0 0 15px rgba(0, 0, 0, 0.3)"
                        : "none",
                  }}
                >
                  <span className="text-3xl sm:text-4xl mb-2">{mood.icon}</span>
                  <span className="text-xs sm:text-sm font-medium text-black">
                    {mood.name}
                  </span>
                </motion.div>
              ))}
            </div>
          )}

          {error && <p className="text-white mb-4">{error}</p>}

          <motion.div
            onClick={saveMood}
            className="px-6 py-2 bg-black text-white font-sm rounded-full focus:outline-none transition duration-300 cursor-pointer"
            whileHover={{ scale: 1.1, rotate: 5, backgroundColor: "#333" }}
            whileTap={{ scale: 0.9 }}
            style={{ display: "inline-block", textAlign: "center" }}
          >
            Save
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default withAuth(DashboardPage);
