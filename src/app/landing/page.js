"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LivenessTestPage() {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const params = useSearchParams();

  const configuration = params.get("configuration");
  const environment = params.get("environment");
  const name = params.get("name");
  const sessionId = params.get("sessionId");

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Camera permission denied or unavailable.");
    }
  };

  useEffect(() => {
    startCamera();
  }, []);

  return (
    <div className="w-screen h-screen bg-gray-900 text-white flex flex-col items-center justify-center space-y-6 p-4">
      <h1 className="text-3xl font-bold">Liveness Test</h1>
      <p>Environment: <strong>{environment}</strong></p>
      <p>Config: <strong>{configuration}</strong></p>
      <p>Name: <strong>{name}</strong></p>
      <p>Session ID: <strong>{sessionId}</strong></p>

      <video ref={videoRef} autoPlay className="w-80 h-60 rounded shadow border-2 border-white" />

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
