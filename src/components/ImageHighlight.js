import React, { useState } from "react";
import Tesseract from "tesseract.js";
import "./ImageHighlight.css";

const ImageHighlight = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [extractedText, setExtractedText] = useState("");

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async () => {
      setUploadedImage(reader.result);
      const {
        data: { text },
      } = await Tesseract.recognize(
        reader.result,
        "eng", // Language for text recognition
        { logger: (m) => console.log(m) } // Optional logger
      );
      setExtractedText(text);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {uploadedImage && (
        <div className="image-container">
          <img src={uploadedImage} alt="Uploaded" className="image" />
          {/* <div className="overlay">
            <span className="highlight-text">{extractedText}</span>
          </div> */}
        </div>
      )}
    </div>
  );
};

export default ImageHighlight;
