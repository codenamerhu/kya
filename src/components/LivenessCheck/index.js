import React from "react";
import useLivenessCheck from "./useLivenessCheck";

const LivenessCheck = () => {
  const {
    videoRef,
    canvasRef,
    loading,
    flashing,
    instructions,
    currentInstructionIndex,
    isLivenessVerified,
  } = useLivenessCheck();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />
          <div className="absolute top-0 w-full flex justify-center pt-8 z-10">
            <div
              role="alert"
              className={`${
                isLivenessVerified
                  ? "alert alert-success w-80"
                  : "alert alert-warning w-80"
              } ${flashing ? "animate-pulse" : ""}`}
            >
              {isLivenessVerified ? (
                <span>Liveness verification successful!</span>
              ) : (
                <span>{instructions[currentInstructionIndex ?? 0]}</span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LivenessCheck;
