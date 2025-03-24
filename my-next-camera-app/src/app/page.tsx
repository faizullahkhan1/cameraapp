"use client";
import { useRef, useState } from "react";
import CameraFeed from "./CameraFeed";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [images, setImages] = useState<{ src: string; filter: string }[]>([]);
  const [capturing, setCapturing] = useState(false);
  const [captureComplete, setCaptureComplete] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false); // State to track hover
  const [previewFilter, setPreviewFilter] = useState<string>("none"); // State for real-time filter preview
  const [isPreviewActive, setIsPreviewActive] = useState(false); // State to toggle preview
  const [isFrontCamera, setIsFrontCamera] = useState(true); // State to toggle camera
  const [hasCaptureStarted, setHasCaptureStarted] = useState(false); // State to track if capture has started

  const filters = [
    "None",
    "Grayscale",
    "Sepia",
    "Invert",
    "Brightness",
    "Contrast",
    "Blur",
    "Saturation",
    "Hue Rotate",
    "Opacity",
    "Shadow",
    "Vintage" // Added a new filter
  ];

  const startCapturing = () => {
    if (capturing) return;
    setCapturing(true);
    setCaptureComplete(false);
    setImages([]);
    setHasCaptureStarted(true); // Capture has started

    let count = 0;

    const captureNextImage = () => {
      if (count < 3) {
        startCountdown(() => {
          const imageData = captureImage();
          if (imageData) {
            setImages((prev) => [...prev, { src: imageData, filter: "none" }]);
          }
          count++;
          if (count < 3) captureNextImage();
          else {
            setCapturing(false);
            setCaptureComplete(true);
          }
        });
      }
    };

    captureNextImage();
  };

  const captureAgain = () => {
    setImages([]);
    setCaptureComplete(false);
    startCapturing();
  };

  const startCountdown = (callback: () => void) => {
    let count = 3;
    setCountdown(count);

    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);

      if (count === 0) {
        clearInterval(countdownInterval);
        setCountdown(null);
        callback();
      }
    }, 1000);
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg");
    }
  };

  const applyFilter = (filter: string) => {
    if (selectedImageIndex === null) return;
    const cssFilter =
      filter === "Grayscale"
        ? "grayscale(100%)"
        : filter === "Sepia"
        ? "sepia(100%)"
        : filter === "Invert"
        ? "invert(100%)"
        : filter === "Brightness"
        ? "brightness(150%)"
        : filter === "Contrast"
        ? "contrast(150%)"
        : filter === "Blur"
        ? "blur(5px)"
        : filter === "Saturation"
        ? "saturate(200%)"
        : filter === "Hue Rotate"
        ? "hue-rotate(90deg)"
        : filter === "Opacity"
        ? "opacity(50%)"
        : filter === "Shadow"
        ? "drop-shadow(8px 8px 10px gray)"
        : filter === "Vintage"
        ? "sepia(100%) contrast(120%) brightness(90%)"
        : "none";

    setImages((prev) =>
      prev.map((img, i) =>
        i === selectedImageIndex ? { ...img, filter: cssFilter } : img
      )
    );

    // If preview is active, apply the filter to the camera feed
    if (isPreviewActive) {
      setPreviewFilter(cssFilter);
    }
  };

  const downloadAllImages = async () => {
    const zip = new JSZip();

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const image = new Image();

      await new Promise((resolve) => {
        image.onload = () => {
          canvas.width = image.width;
          canvas.height = image.height;
          if (ctx) {
            ctx.filter = img.filter;
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            const base64Data = canvas.toDataURL("image/jpeg").split(",")[1];
            zip.file(`filtered_image_${i + 1}.jpg`, base64Data, { base64: true });
          }
          resolve(null);
        };
        image.src = img.src;
      });
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "filtered_images.zip");
  };

  // Function to toggle real-time filter preview
  const togglePreviewFilter = () => {
    setIsPreviewActive(!isPreviewActive);
    if (!isPreviewActive) {
      const selectedFilter = filters[selectedImageIndex || 0];
      handlePreviewFilter(selectedFilter); // Apply selected filter
    } else {
      setPreviewFilter("none"); // Remove filter
    }
  };

  // Function to preview filters on the camera feed
  const handlePreviewFilter = (filter: string) => {
    const cssFilter =
      filter === "Grayscale"
        ? "grayscale(100%)"
        : filter === "Sepia"
        ? "sepia(100%)"
        : filter === "Invert"
        ? "invert(100%)"
        : filter === "Brightness"
        ? "brightness(150%)"
        : filter === "Contrast"
        ? "contrast(150%)"
        : filter === "Blur"
        ? "blur(5px)"
        : filter === "Saturation"
        ? "saturate(200%)"
        : filter === "Hue Rotate"
        ? "hue-rotate(90deg)"
        : filter === "Opacity"
        ? "opacity(50%)"
        : filter === "Shadow"
        ? "drop-shadow(8px 8px 10px gray)"
        : filter === "Vintage"
        ? "sepia(100%) contrast(120%) brightness(90%)"
        : "none";

    setPreviewFilter(cssFilter);
  };

  // Function to toggle camera (front/back)
  const toggleCamera = async () => {
    if (videoRef.current) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: isFrontCamera ? "environment" : "user" },
      });
      videoRef.current.srcObject = stream;
      setIsFrontCamera(!isFrontCamera); // Toggle camera state
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex">
      {/* Filters Panel (40% width) */}
      <div className="w-[40%] bg-white shadow-lg rounded-xl p-4 flex flex-col items-center text-black">
        <h2 className="text-lg font-bold mb-4">Filters</h2>
        <div className="w-full grid grid-cols-6 gap-2">
          {filters.map((filter, i) => (
            <button
              key={i}
              className="aspect-square flex items-center justify-center p-2 bg-gray-300 text-black rounded-xl hover:bg-gray-400 overflow-hidden text-sm text-center"
              onClick={() => {
                applyFilter(filter);
                if (isPreviewActive) {
                  handlePreviewFilter(filter); // Apply filter to camera feed
                }
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Camera and Captured Images Section (60% width) */}
      <div className="w-[60%] flex flex-col items-center">
        <div
          className="w-[90%] h-[450px] rounded-3xl overflow-hidden flex items-center justify-center relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Pass the previewFilter to the CameraFeed component */}
          <CameraFeed videoRef={videoRef as any} previewFilter={previewFilter} />
          <div className="absolute">
            {countdown != null ? (
              <div className="w-28 h-28 flex items-center justify-center rounded-full bg-gray-500 opacity-80 text-white text-2xl font-bold mt-4 shadow-lg">
                {countdown}
              </div>
            ) : null}
          </div>

          {/* Bar with Buttons at the Bottom */}
          {isHovered && (
            <div className="absolute bottom-0 bg-gray-200 opacity-80 backdrop-blur-sm py-2 px-6 flex justify-center rounded-full">
              <div className="flex gap-4">
                <button
                  onClick={togglePreviewFilter}
                  className="bg-white bg-opacity-80 text-black px-6 py-2 rounded-full text-lg hover:bg-opacity-100 transition"
                >
                  {isPreviewActive ? "Previewing" : "Preview Filter"}
                </button>
                <button
                  onClick={startCapturing} // Button 2: Start capturing
                  className="bg-white bg-opacity-80 text-black px-6 py-2 rounded-full text-lg hover:bg-opacity-100 transition"
                >
                  Capture
                </button>
                <button
                  onClick={captureAgain} // Button 3: Retry capturing
                  disabled={!hasCaptureStarted || images.length !== 3} // Disable if capture hasn't started or 3 images aren't captured
                  className={`bg-white bg-opacity-80 text-black px-6 py-2 rounded-full text-lg ${
                    !hasCaptureStarted || images.length !== 3
                      ? "opacity-50"
                      : "hover:bg-opacity-100"
                  } transition`}
                >
                  Retry
                </button>
                <button
                  onClick={toggleCamera} // Button 4: Toggle camera
                  className="bg-white bg-opacity-80 text-black px-6 py-2 rounded-full text-lg hover:bg-opacity-100 transition"
                >
                  Toggle Camera
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-[90%] bg-white shadow-lg rounded-xl p-4 flex flex-col items-center mt-3">
          <h2 className="text-lg font-bold text-center mb-4 text-black">Captured Images</h2>
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, index) => (
              <img
                key={index}
                src={img.src}
                className={`w-48 rounded-lg cursor-pointer ${selectedImageIndex === index ? 'border-4 border-blue-500' : ''}`}
                style={{ filter: img.filter }}
                alt={`Captured ${index + 1}`}
                onClick={() => setSelectedImageIndex(index)}
              />
            ))}
          </div>

          {/* Add the "Download Zip" button here */}
          {images.length > 0 && (
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={downloadAllImages}
            >
              Download Zip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}