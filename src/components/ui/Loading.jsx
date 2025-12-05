import React from "react";

export default function LoadingSpinner({ fullScreen = false }) {
  return (
    <div className={`flex justify-center items-center ${fullScreen ? 'h-screen' : 'h-64'}`}>
      <span className="loading loading-spinner loading-lg text-blue-500"></span>
    </div>
  );
}