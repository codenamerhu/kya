"use client";

import { useEffect, useRef, useState } from "react";

export default function LandingTestPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({});
  const [capturedImage, setCapturedImage] = useState(null);
  const [showVideo, setShowVideo] = useState(true);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Camera permission denied or unavailable.");
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/png");
      setCapturedImage(dataUrl);
      setShowVideo(false);

      // Stop video stream
      const stream = video.srcObject;
      const tracks = stream?.getTracks();
      tracks?.forEach(track => track.stop());
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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 space-y-4">
      <h1 className="text-3xl font-bold">Liveness Test</h1>
      <p>Environment: <strong>{searchParams.environment}</strong></p>
      <p>Config: <strong>{searchParams.configuration}</strong></p>
      <p>Name: <strong>{searchParams.name}</strong></p>
      <p>Session ID: <strong>{searchParams.sessionId}</strong></p>

      {/* Camera or Captured Image */}
      <div className="w-64 h-48 bg-black rounded overflow-hidden border-2 border-white flex items-center justify-center">
        {showVideo ? (
          <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
        ) : capturedImage ? (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
        ) : null}
      </div>

      <button
        onClick={captureImage}
        disabled={!showVideo}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-2 disabled:opacity-50"
      >
        Capture Photo
      </button>

      <canvas ref={canvasRef} className="hidden" />

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
