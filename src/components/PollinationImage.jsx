import React, { useEffect } from "react";
import { usePollinationsImage } from "@pollinations/react";

const PollinationImage = ({ prompt, onComplete, onError }) => {
  const imageUrl = usePollinationsImage(prompt, {
    width: 512, // Width of the generated image
    height: 512, // Height of the generated image
    seed: 42, // Seed for consistent generation
    model: "flux", // Model used for image generation
    nologo: true, // Disable logo
  });

  const imageUrl1 = "";

  // Notify parent when the image URL is available or when there's an error
  useEffect(() => {
    if (imageUrl) {
      onComplete(imageUrl); // Notify the parent component of success
    } else if (imageUrl === null) {
      onError(new Error("Image generation failed")); // Notify the parent component of failure
    }
  }, [imageUrl, onComplete, onError]);

  return (
    <div>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`Generated for: ${prompt}`}
          style={{ width: "100px", height: "100px", objectFit: "cover" }}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default PollinationImage;
