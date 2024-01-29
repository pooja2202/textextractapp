import React, { useState } from "react";

const TextractAnalyzer = ({ image, ocrData }) => {
  const [selectedPair, setSelectedPair] = useState(null);

  const handleTextClick = (key, value, index) => {
    setSelectedPair({ key, value, index });
    console.log(`Clicked: ${key} - ${value}`);
  };

  return (
    <div style={{ position: "relative" }}>
      <img src={image} width={600} height={600} alt="Uploaded Image" />
      {ocrData &&
        ocrData.map((block, index) => (
          <div
            key={block.key}
            onClick={() => handleTextClick(block.key, block.value, index)}
            style={{
              position: "absolute",
              top: block.BoundingBox.Top * 600,
              left: block.BoundingBox.Left * 600,
              width: block.BoundingBox.Width * 600,
              height: block.BoundingBox.Height * 600,
              background:
                selectedPair && selectedPair.index === index
                  ? "rgba(0, 0, 255, 0.3)"
                  : "transparent",
              cursor: "pointer",
            }}
          ></div>
        ))}
    </div>
  );
};

export default TextractAnalyzer;
