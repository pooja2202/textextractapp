import React, { useEffect, useState } from "react";
import Canvas from "./components/Canvas";
import {
  DetectDocumentTextCommand,
  TextractClient,
  AnalyzeDocumentCommand,
} from "@aws-sdk/client-textract";
import { Buffer } from "buffer";
import "./App.css";
import DynamicForm from "./components/DynamicForm";
import {
  extractText,
  mapWordId,
  extractTableInfo,
  getKeyMap,
  getValueMap,
  getKvMap,
} from "./components/ExtractionCode";
import { processResponse } from "./components/ImageProcessingHelper";
import AWS from "aws-sdk";

if (typeof window !== "undefined") {
  window.Buffer = Buffer;
}

function App() {
  //below starts for aws
  const [src, setSrc] = useState("");
  const [image, setImage] = useState(null);
  const [data, setData] = useState([]);
  const [inputNameValue, setInputNameValue] = useState("");
  const [inputAddressValue, setInputAddressValue] = useState("");
  const [inputEmailValue, setInputEmailValue] = useState("");
  const [inputPhoneValue, setInputPhoneValue] = useState("");

  const onSelectFile = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    const reader = new FileReader();
    const file = e.target.files[0];

    reader.onload = function (upload) {
      setSrc(upload?.target?.result);
    };
    reader.onloadend = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const onRunOCR = async () => {
    const client = new TextractClient({
      region: "ap-south-1",
      credentials: {
        accessKeyId: "AKIAYRK5RWLUDM2GONFC",
        secretAccessKey: "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",
      },
    });

    // convert image to byte Uint8Array base 64
    const blob = Buffer.from(src.split(",")[1], "base64");

    const input = {
      Document: {
        Bytes: blob,
      },
      FeatureTypes: ["FORMS", "TABLES"],
    };

    // const params = {
    //   Document: {
    //     Bytes: blob,
    //   },
    //   FeatureTypes: ["FORMS", "TABLES"],
    // };

    // const command = new DetectDocumentTextCommand(params);
    // console.log("pooja----", command);
    const command = new AnalyzeDocumentCommand(input);

    try {
      const data = await client.send(command);
      // const data = await client.send(command);
      console.log("pooja raw data------", data);
      const raw_text = extractText(data);
      console.log("pooja raw_text---", raw_text);
      const word_map = mapWordId(data);
      console.log("pooja word_map---", word_map);
      const table_data = extractTableInfo(data, word_map);
      console.log("pooja table_data----", table_data);
      const key_map = getKeyMap(data, word_map);
      console.log("pooja key_map-----", key_map);
      const value_map = getValueMap(data, word_map);
      console.log("pooja value_map-----", value_map);
      const final_map = getKvMap(key_map, value_map);
      console.log("pooja final_map-----", final_map);
      // AWS.config.update({
      //   region: "ap-south-1",
      //   credentials: new AWS.Credentials({
      //     accessKeyId: "AKIAYRK5RWLUDM2GONFC",
      //     secretAccessKey: "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",
      //   }),
      // });
      // const s3 = new AWS.S3();
      // processResponse(data, s3, "getstartednewbucket", "testimgpt1.png");
      // process data
      if (data?.Blocks) {
        const filteredArray = data?.Blocks.filter(
          (item) => item.BlockType === "LINE"
        );

        setData(filteredArray);
        // setData(data.Blocks);
      }
    } catch (error) {
      console.log("err", error);
      // error handling
    }
  };

  const texts = data?.map((item) => item.Text);
  //canvas ->
  const draw = (context, count, isHovering, x, y, texts) => {
    let clickHandled = false;
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillStyle = "#9781b0";
    const lineHeight = 30; // Adjust this value as needed for spacing
    const rectHeight = (texts.length + 2) * lineHeight; // Add one for padding
    context.fillRect(10, 10, 800, rectHeight);
    // Add text

    const text = "data";
    context.fillStyle = isHovering ? "blue" : "black";
    context.font = "20px Arial";
    // context.fillText(text, 20, 50);
    if (texts && texts.length > 0) {
      texts.forEach((text, index) => {
        const textX = 20;
        const textY = 50 + index * 30; // Adjust vertical spacing
        context.fillText(text, textX, textY);

        if (
          !clickHandled &&
          x >= textX &&
          x <= textX + context.measureText(text).width &&
          y >= textY - parseInt(context.font) &&
          y <= textY
        ) {
          handleClick(text);
          clickHandled = true;
        }
      });
    }
    if (isHovering) {
      const textMetrics = context.measureText(text);
      const textWidth = textMetrics.width;
      const textHeight = parseInt(context.font);
      const textX = 20;
      const textY = 50 - textHeight;
      context.strokeStyle = "blue";
      context.setLineDash([5, 5]);
      context.strokeRect(textX, textY, textWidth, textHeight);
      context.setLineDash([]);
      // Check if click is within the bounds of the text
      if (
        x >= textX &&
        x <= textX + textWidth &&
        y >= textY &&
        y <= textY + textHeight
      ) {
        handleClick(text);
      }
    }
  };

  const handleClick = (text) => {
    console.log(text);
  };

  const handleInputNameChange = (e) => {
    setInputNameValue(e.target.value);
  };

  const handleInputAddressChange = (e) => {
    setInputAddressValue(e.target.value);
  };

  const handleInputPhoneChange = (e) => {
    setInputPhoneValue(e.target.value);
  };
  const handleInputEmailChange = (e) => {
    setInputEmailValue(e.target.value);
  };

  return (
    <div className="container">
      <div className="left-section">
        <div>
          <div>
            <label>Name : </label>
            <input
              type="text"
              value={inputNameValue}
              onChange={handleInputNameChange}
            />
          </div>
          <div>
            <label>Address : </label>
            <input
              type="text"
              value={inputAddressValue}
              onChange={handleInputAddressChange}
            />
          </div>
          <div>
            <label>Email : </label>
            <input
              type="text"
              value={inputEmailValue}
              onChange={handleInputEmailChange}
            />
          </div>
          <div>
            <label>Phone : </label>
            <input
              type="text"
              value={inputPhoneValue}
              onChange={handleInputPhoneChange}
            />
          </div>
        </div>
      </div>
      <div className="center-section">
        <input
          className="inputfile"
          id="file"
          type="file"
          name="file"
          onChange={onSelectFile}
        />
        {image && <img src={image} alt="Uploaded" className="uploaded-image" />}
        <button onClick={onRunOCR} style={{ margin: "10px" }}>
          Run OCR
        </button>
      </div>
      <div className="right-section">
        <p>Rendered Image Data</p>
        {/* <div style={{ border: "1px" }}>
          {data?.map((item, index) => {
            return (
              <span key={index} style={{ margin: "2px", padding: "2px" }}>
                {item.Text}
              </span>
            );
          })}
        </div> */}
        <Canvas
          width="500"
          height="1900"
          draw={(context, count, isHovering, x, y) =>
            draw(context, count, isHovering, x, y, texts)
          }
        />
      </div>
    </div>
  );
}

export default App;
