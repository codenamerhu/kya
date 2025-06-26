import { useState, useEffect, useRef, useCallback } from "react";
import * as faceapi from "face-api.js";

const useLivenessCheck = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState<number | null>(null);
  const [completedInstructions, setCompletedInstructions] = useState([]);
  const [isLivenessVerified, setIsLivenessVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flashing, setFlashing] = useState(false);

  const nodThreshold = 10;
  const mouthOpenThreshold = 30;
  const eyeClosedThreshold = 10;

  const openMouthDone = useRef(false);
  const blinkDone = useRef(false);
  const blinkStarted = useRef(false);
  const blinkCount = useRef(0);
  const nodDone = useRef(false);
  const initialNoseY = useRef<number | null>(null);

  const instructions = [
    "Please open your mouth wide.",
    "Please blink your eyes twice.",
    "Please nod your head.",
  ];

  const loadModels = useCallback(async () => {
    setLoading(true);
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch((e) => console.warn("Playback error:", e));
        }
      }
    } catch (error) {
      console.error("Camera or model loading error:", error);
      alert("Unable to access camera. Please check your permissions or HTTPS connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  const pickRandomInstruction = useCallback(() => {
    const availableInstructions = instructions
      .map((inst, i) => i)
      .filter(i => !completedInstructions.includes(i));

    if (availableInstructions.length > 0) {
      const randomIndex = availableInstructions[Math.floor(Math.random() * availableInstructions.length)];
      setCurrentInstructionIndex(randomIndex);
    } else {
      setIsLivenessVerified(true);
    }
  }, [completedInstructions]);

  const detectFace = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || currentInstructionIndex === null) return;

    const detections = await faceapi
      .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    if (detections.length > 0) {
      const landmarks = detections[0].landmarks;
      const canvasCtx = canvasRef.current.getContext("2d");

      const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
      const resized = faceapi.resizeResults(detections, dims);
      canvasCtx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      faceapi.draw.drawDetections(canvasRef.current, resized);
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resized);

      switch (currentInstructionIndex) {
        case 0: { // Open mouth
          const d = landmarks.positions[66].y - landmarks.positions[62].y;
          if (d > mouthOpenThreshold && !openMouthDone.current) {
            openMouthDone.current = true;
            setCompletedInstructions(prev => [...prev, 0]);
            setCurrentInstructionIndex(null);
          }
          break;
        }
        case 1: { // Blink twice
          const l = landmarks.positions[41].y - landmarks.positions[37].y;
          const r = landmarks.positions[47].y - landmarks.positions[43].y;
          if (l < eyeClosedThreshold && r < eyeClosedThreshold && !blinkStarted.current) {
            blinkStarted.current = true;
            blinkCount.current++;
          } else if (l >= eyeClosedThreshold && r >= eyeClosedThreshold && blinkStarted.current) {
            blinkStarted.current = false;
          }
          if (blinkCount.current >= 2 && !blinkDone.current) {
            blinkDone.current = true;
            setCompletedInstructions(prev => [...prev, 1]);
            setCurrentInstructionIndex(null);
          }
          break;
        }
        case 2: { // Nod
          const noseY = landmarks.positions[30].y;
          if (initialNoseY.current === null) {
            initialNoseY.current = noseY;
          } else if (Math.abs(noseY - initialNoseY.current) > nodThreshold && !nodDone.current) {
            nodDone.current = true;
            setCompletedInstructions(prev => [...prev, 2]);
            setCurrentInstructionIndex(null);
          }
          break;
        }
        default:
          break;
      }
    }
  }, [currentInstructionIndex]);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  useEffect(() => {
    if (currentInstructionIndex === null) {
      pickRandomInstruction();
    }
  }, [currentInstructionIndex, pickRandomInstruction]);

  useEffect(() => {
    if (currentInstructionIndex !== null) {
      setFlashing(true);
      const timeout = setTimeout(() => setFlashing(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [currentInstructionIndex]);

  useEffect(() => {
    const interval = setInterval(() => detectFace(), 100);
    return () => clearInterval(interval);
  }, [detectFace]);

  return {
    videoRef,
    canvasRef,
    loading,
    flashing,
    instructions,
    currentInstructionIndex,
    isLivenessVerified,
  };
};

export default useLivenessCheck;
