"use client";

interface ImageCanvasProps {
  images: string[];
  filters: string[];
}

const ImageCanvas: React.FC<ImageCanvasProps> = ({ images, filters }) => {
  return (
    <div className="mt-6">
      <div className="flex gap-4">
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Captured ${index}`}
            className="w-40 h-40 rounded-lg shadow-md border-2 border-gray-300"
            style={{ filter: filters[index] || "none" }} 
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCanvas;
