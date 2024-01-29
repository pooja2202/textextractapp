// App.js
import React, { useState } from "react";
import "./App.css";
import ImageUploader from "./components/ImageUploader";
import TextractAnalyzer from "./components/TextAnalyzer";
import {
  TextractClient,
  AnalyzeDocumentCommand,
} from "@aws-sdk/client-textract";
import { Buffer } from "buffer";
import DynamicForm from "./components/DynamicLeftFormSection";

const App = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [ocrData, setOcrData] = useState(null);
  const [finalKeyValueMap, setFinalKeyValueMap] = useState({});
  const [selectedField, setSelectedField] = useState(null);
  //new below
  const [inputValue, setInputValue] = useState("");
  const [inputFocused, setInputFocused] = useState(false);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleInputFocus = () => {
    setInputFocused(true);
  };

  const handleInputBlur = () => {
    setInputFocused(false);
  };

  const handleFieldClick = (fieldName) => {
    setSelectedField(fieldName);
  };

  const handleImageUpload = async (imageFile) => {
    const blob = Buffer.from(imageFile.split(",")[1], "base64");
    setUploadedImage(imageFile);
    await runOCR(blob);
  };

  const runOCR = async (blob) => {
    const client = new TextractClient({
      region: "ap-south-1",
      credentials: {
        accessKeyId: "AKIAYRK5RWLUDM2GONFC",
        secretAccessKey: "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",
      },
    });
    const input = {
      Document: {
        Bytes: blob,
      },
      FeatureTypes: ["FORMS", "TABLES"],
    };
    const command = new AnalyzeDocumentCommand(input);
    try {
      const data = await client.send(command);
      console.log("data---", data);
      const final_method = generateKeyValuePairs(data.Blocks);
      console.log("final_method-----", final_method);
      const word_map = mapWordId(data);
      console.log("word_map-----", word_map);
      const word_map_detail = mapWordDetail(data);
      console.log("word_map_detail", word_map_detail);
      setOcrData(word_map_detail);
      const key_map = getKeyMap(data, word_map);
      console.log("key_map----", key_map);
      const value_id_map = getValueIdMap(data, word_map);
      console.log("value_id_map----", value_id_map);
      const value_map = getValueMap(data, word_map);
      console.log("value_map----", value_map);
      const final_map = getKvMap(key_map, value_map);
      console.log("final_map------", final_map);
      setFinalKeyValueMap(final_map);
    } catch (error) {
      console.log("err", error);
    }
  };

  function generateKeyValuePairs(input) {
    // const outputData = {};
    // const keywordMap = {};

    // input.forEach((item, index) => {
    //   if (item.BlockType === "WORD" && item.TextType === "PRINTED") {
    //     if (!keywordMap.hasOwnProperty(item.Text)) {
    //       keywordMap[item.Text] = [];
    //     }
    //     keywordMap[item.Text].push(item.Id);
    //   }
    // });

    // Object.keys(keywordMap).forEach((keyword, index) => {
    //   const key = keyword;
    //   const value = keywordMap[keyword]
    //     .map((id) => input.find((item) => item.Id === id).Text)
    //     .join("");
    //   const valueIds = keywordMap[keyword];
    //   outputData[index + 1] = { key, value, value_id: valueIds };
    // });

    // console.log(outputData);
    // return outputData;
    //
    const outputData = {};
    const keywordMap = {};

    input.forEach((item, index) => {
      if (item.BlockType === "WORD" && item.TextType === "PRINTED") {
        if (!keywordMap.hasOwnProperty(item.Text)) {
          keywordMap[item.Text] = [];
        }
        keywordMap[item.Text].push(item.Id);
      }
    });

    Object.keys(keywordMap).forEach((keyword, index) => {
      const key = keyword;
      const value = keywordMap[keyword]
        .map((id) => input.find((item) => item.Id === id).Text)
        .join(" ");
      const valueIds = keywordMap[keyword];
      outputData[index + 1] = { key, value, value_id: valueIds };
    });

    console.log(outputData);
    return outputData;
  }

  function getValueIdMap(response, wordMap) {
    // Check if response is defined and contains the 'Blocks' property
    if (!response || !response.Blocks || !Array.isArray(response.Blocks)) {
      console.error("Invalid or missing response structure");
      return {};
    }

    // Initialize an empty object to store the value IDs and values
    const valueMap = {};

    // Iterate through each block in the response data
    response.Blocks.forEach((block) => {
      // Check if the block represents a key-value set and contains a value
      if (
        block.BlockType === "KEY_VALUE_SET" &&
        block.EntityTypes.includes("VALUE") &&
        block.Relationships && // Check if Relationships property exists
        Array.isArray(block.Relationships)
      ) {
        // Initialize variables to store the value ID and value
        let valueId = "";
        let value = "";

        // Iterate through relationships within the block
        block.Relationships.forEach((relation) => {
          // If the relationship type is "CHILD," map the Ids to words using wordMap
          if (
            relation.Type === "CHILD" &&
            relation.Ids &&
            Array.isArray(relation.Ids)
          ) {
            value = relation.Ids.map((id) => wordMap[id]).join(" ");
          }

          // Store the value ID associated with the value
          valueId = relation.Ids;
        });

        // Add the value ID and value to the valueMap object
        valueMap[valueId] = value;
      }
    });

    // Return the populated valueMap object
    return valueMap;
  }

  // function generateKeyValuePairs(input) {
  //   const output = {};

  //   input.forEach((item) => {
  //     if (item.BlockType === "KEY_VALUE_SET") {
  //       const key = item.Text;
  //       console.log("key pooja-----", key);
  //       const value = item.EntityTypes.includes("VALUE")
  //         ? item.Text.split(" : ")[1]
  //         : null;
  //       const valueIds = item.Relationships[0].Ids.join(",");

  //       const index = Object.keys(output).length + 1;
  //       output[index] = {
  //         key: key,
  //         value: value,
  //         value_id: valueIds,
  //       };
  //     }
  //   });

  //   return output;
  // }

  function mapWordId(response) {
    const wordMap = {};
    response.Blocks.forEach((block) => {
      if (block.BlockType === "WORD") {
        wordMap[block.Id] = block.Text;
      }
      if (block.BlockType === "SELECTION_ELEMENT") {
        wordMap[block.Id] = block.SelectionStatus;
      }
    });
    return wordMap;
  }

  function mapWordDetail(response) {
    const dummyKeyValuePairs = [];
    for (let i = 0; i < response.Blocks.length; i++) {
      if (response.Blocks[i].BlockType === "WORD") {
        dummyKeyValuePairs.push({
          key: response.Blocks[i].Id,
          value: response.Blocks[i].Text,
          BoundingBox: response.Blocks[i].Geometry.BoundingBox,
        });
      }
    }
    return dummyKeyValuePairs;
  }

  function getKeyMap(response, wordMap) {
    const keyMap = {};
    response.Blocks.forEach((block) => {
      if (
        block.BlockType === "KEY_VALUE_SET" &&
        block.EntityTypes.includes("KEY")
      ) {
        let valueId;
        let key = "";
        block.Relationships.forEach((relation) => {
          if (relation.Type === "VALUE") {
            valueId = relation.Ids;
          }
          if (relation.Type === "CHILD") {
            key = relation.Ids.map((id) => wordMap[id]).join(" ");
          }
        });
        keyMap[key] = valueId;
      }
    });
    return keyMap;
  }

  function getValueMap(response, wordMap) {
    const valueMap = {};
    response.Blocks.forEach((block) => {
      if (
        block.BlockType === "KEY_VALUE_SET" &&
        block.EntityTypes.includes("VALUE")
      ) {
        let value = "";
        if (block.Relationships) {
          block.Relationships.forEach((relation) => {
            if (relation.Type === "CHILD") {
              value = relation.Ids.map((id) => wordMap[id]).join(" ");
            }
          });
        } else {
          value = "VALUE_NOT_FOUND";
        }
        valueMap[block.Id] = value;
      }
    });
    return valueMap;
  }

  function getKvMap(keyMap, valueMap) {
    const finalMap = {};
    for (const key in keyMap) {
      finalMap[key] = keyMap[key].map((id) => valueMap[id]).join("");
    }
    return finalMap;
  }

  const calculateXCoordinate = (ocrData, selectedField, imageWidth) => {
    if (!ocrData || !selectedField || !imageWidth) return null;

    const selectedBlock = ocrData.find(
      (block) => block.key === selectedField.key
    );
    if (!selectedBlock) return null;

    // Calculate the x-coordinate based on the BoundingBox
    return (
      (selectedBlock.BoundingBox.Left + selectedBlock.BoundingBox.Width / 2) *
      imageWidth
    );
  };

  const calculateYCoordinate = (ocrData, selectedField, imageHeight) => {
    if (!ocrData || !selectedField || !imageHeight) return null;

    const selectedBlock = ocrData.find(
      (block) => block.key === selectedField.key
    );
    if (!selectedBlock) return null;

    // Calculate the y-coordinate based on the BoundingBox
    return (
      selectedBlock.BoundingBox.Top * imageHeight +
      (selectedBlock.BoundingBox.Height / 2) * imageHeight
    );
  };

  return (
    <>
      {/* // <div style={{ display: "flex" }}>
    //   <div
    //     style={{ width: "600px", height: "600px", backgroundColor: "#ebc4bb" }}
    //   >
    //     {uploadedImage && ocrData && <DynamicForm dataObj={finalKeyValueMap} />}
    //   </div>
    //   <div
    //     style={{ width: "15vw", height: "600px", backgroundColor: "#d78b79" }}
    //   >
    //     <ImageUploader onImageUpload={handleImageUpload} />
    //   </div>
    //   <div>
    //     {uploadedImage && ocrData && (
    //       <TextractAnalyzer image={uploadedImage} ocrData={ocrData} />
    //     )}
    //   </div>
    // </div> */}
      {/* <div className="app">
        <div className="input-container">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="input-box"
          />
          {inputFocused && (
            <svg className="line-svg" height="100" width="100">
              <line
                x1="0"
                y1="0"
                x2="50"
                y2="50"
                style={{ stroke: "black", strokeWidth: 2 }}
              />
            </svg>
          )}
        </div>
        <div className="image-container">
          <img
            src="https://getstartednewbucket.s3.ap-south-1.amazonaws.com/testimgpt1.png"
            alt="Your Image"
            width={200}
            height={200}
          />
        </div>
      </div> */}
      <div style={{ display: "flex" }}>
        <div
          style={{
            width: "600px",
            height: "600px",
            backgroundColor: "#ebc4bb",
          }}
        >
          {uploadedImage && ocrData && (
            <DynamicForm
              dataObj={finalKeyValueMap}
              onFieldClick={handleFieldClick}
            />
          )}
        </div>
        <div
          style={{ width: "15vw", height: "600px", backgroundColor: "#d78b79" }}
        >
          <ImageUploader onImageUpload={handleImageUpload} />
        </div>
        <div>
          {uploadedImage && ocrData && (
            <TextractAnalyzer
              image={uploadedImage}
              ocrData={ocrData}
              selectedField={selectedField}
            />
          )}
        </div>
      </div>
      {/* <div style={{ display: "flex" }}>
        <div
          style={{
            width: "600px",
            height: "600px",
            backgroundColor: "#ebc4bb",
          }}
        >
          {uploadedImage && ocrData && (
            <DynamicForm
              dataObj={finalKeyValueMap}
              onFieldClick={handleFieldClick}
            />
          )}
        </div>
        <div>
          {console.log(selectedField)}
          {selectedField && (
            <svg className="line-svg" height="100%" width="100%">
              <line
                x1={selectedField.position.left}
                y1={selectedField.position.top}
                x2={calculateXCoordinate(ocrData, selectedField, 300)}
                y2={calculateYCoordinate(ocrData, selectedField, 300)}
                style={{ stroke: "black", strokeWidth: 2 }}
              />
            </svg>
          )}
        </div>
        <div
          style={{ width: "15vw", height: "600px", backgroundColor: "#d78b79" }}
        >
          <ImageUploader onImageUpload={handleImageUpload} />
        </div>
        <div>
          {uploadedImage && ocrData && (
            <TextractAnalyzer
              image={uploadedImage}
              ocrData={ocrData}
              selectedField={selectedField}
            />
          )}
        </div>
      </div> */}
    </>
  );
};

export default App;
