"use client";

interface CaptureButtonProps {
  startCapturing: () => void;
  captureAgain: () => void;
  capturing: boolean;
  captureComplete: boolean;
}

const CaptureButton: React.FC<CaptureButtonProps> = ({ startCapturing, captureAgain, capturing, captureComplete }) => {
  return (
    <button
      onClick={captureComplete ? captureAgain : startCapturing}
      className={`mt-4 px-6 py-3 text-white font-bold rounded-lg transition ${
        capturing ? "bg-gray-400 cursor-not-allowed"
        : captureComplete ? "bg-grey-600"
        : "bg-grey-600 hover:bg-grey-700 text-white"
      }`}
    >
      {captureComplete ? "Retry" : capturing ? "Capturing..." : "Start Capturing"}
    </button>
  );
};

export default CaptureButton;
