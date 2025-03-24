import { useEffect } from "react";

interface CameraFeedProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  previewFilter: string; // Add the previewFilter prop
}

export default function CameraFeed({ videoRef, previewFilter }: CameraFeedProps) {
  useEffect(() => {
    const startCamera = async () => {
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 500, height: 500, facingMode: "user" },
        });
        videoRef.current.srcObject = stream;
      }
    };

    startCamera();
  }, [videoRef]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      style={{ filter: previewFilter }} // Apply the filter here
      className="w-full h-full object-cover"
    />
  );
}