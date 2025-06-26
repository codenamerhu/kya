"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LandingTestPage() {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({});

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
    const params = new URLSearchParams(window.location.search);
    setSearchParams({
      configuration: params.get("configuration"),
      environment: params.get("environment"),
      name: params.get("name"),
      sessionId: params.get("sessionId"),
    });
  
    startCamera();
  }, []);

  return (
    
    <div className="w-screen h-screen bg-gray-900 text-white flex flex-col items-center justify-center space-y-6 p-4">
      <h1 className="text-3xl font-bold">Liveness Test</h1>
      <p>Environment: <strong>{searchParams.environment}</strong></p>
      <p>Config: <strong>{searchParams.configuration}</strong></p>
      <p>Name: <strong>{searchParams.name}</strong></p>
      <p>Session ID: <strong>{searchParams.sessionId}</strong></p>

      <video ref={videoRef} autoPlay className="w-80 h-60 rounded shadow border-2 border-white" />

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
