import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";

export default function MoodDetector() {
  const videoRef = useRef(null);
  const [mood, setMood] = useState("Détection en cours...");

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models"; // Place les modèles ici dans le dossier public
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      await startVideo();
    };

    const startVideo = async () => {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error("Erreur d'accès à la caméra :", err));
    };

    loadModels();
  }, []);

  const handleVideoPlay = () => {
    setInterval(async () => {
      if (videoRef.current) {
        const detections = await faceapi
          .detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceExpressions();

        if (detections.length > 0) {
          const expressions = detections[0].expressions;
          const sortedExpressions = Object.entries(expressions).sort(
            (a, b) => b[1] - a[1]
          );
          setMood(sortedExpressions[0][0]); // Humeur dominante
        }
      }
    }, 500); // Détection toutes les 500ms
  };

  return (
    <div>
      <h1>Détection de l&apos;humeur</h1>
      <video
        ref={videoRef}
        autoPlay
        muted
        onPlay={handleVideoPlay}
        style={{ width: "100%", height: "auto" }}
      />
      <p>Humeur actuelle : {mood}</p>
    </div>
  );
}
