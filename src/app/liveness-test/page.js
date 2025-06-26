"use client";

import { useEffect, useRef, useState } from "react";

export default function LivenessTestPage() {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError(err.message);
      }
    }

    startCamera();
  }, []);

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center">
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}
