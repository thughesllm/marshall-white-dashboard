"use client";

import { useState } from "react";
import Image from "next/image";

export function ImageGallery({ images }: { images: string[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) return null;

  const selectedImage = images[selectedIndex];

  return (
    <div className="space-y-2">
      {/* Hero image */}
      <div className="relative w-full overflow-hidden rounded-xl aspect-video">
        <Image
          src={selectedImage}
          alt={`Property image ${selectedIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 65vw"
          priority={selectedIndex === 0}
        />
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative flex-shrink-0 overflow-hidden rounded border-2 transition-colors ${
                index === selectedIndex
                  ? "border-[#002a52]"
                  : "border-transparent hover:border-gray-300"
              }`}
              style={{ width: 80, height: 56 }}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
