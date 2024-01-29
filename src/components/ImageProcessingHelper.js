// ImageProcessingHelper.js
import React, { useEffect, useRef } from "react";
import AWS from "aws-sdk";

function processError(error) {
  console.error(error);
  return false;
}

async function uploadToS3(s3, buffer, BUCKET_NAME, key) {
  await s3
    .putObject({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
    })
    .promise();
}

function drawBoundingBox(ctx, height, width, boundingBox, color, lineWidth) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  const x = boundingBox.Left * width;
  const y = boundingBox.Top * height;
  const w = boundingBox.Width * width;
  const h = boundingBox.Height * height;

  ctx.strokeRect(x, y, w, h);
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Failed to load image"));

      // Set the source to the data URL obtained from the FileReader
      image.src = event.target.result;
    };

    reader.readAsDataURL(file);
  });
}

// async function processResponse(response, bucketName, fileName) {
//   console.log("processResponse");
//   try {
//     const selectedFile =
//       "https://getstartednewbucket.s3.ap-south-1.amazonaws.com/testimgpt1.png";

//     // Use await to get the resolved image before proceeding
//     const image = await loadImage(selectedFile);

//     console.log("load image called successfully", image);
//     const height = image.height;
//     const width = image.width;

//     const canvas = document.createElement("canvas");
//     canvas.width = width;
//     canvas.height = height;
//     const ctx = canvas.getContext("2d");
//     console.log("canvas created", canvas);

//     ctx.drawImage(image, 0, 0, width, height);

// for (const block of response.Blocks) {
//   if (block.BlockType === "KEY_VALUE_SET") {
//     const color =
//       block.EntityTypes[0] === "KEY"
//         ? "rgba(0, 0, 255, 1)"
//         : "rgba(0, 255, 0, 1)";
//     const boundingBox = block.Geometry.BoundingBox;
//     drawBoundingBox(ctx, height, width, boundingBox, color, 1);
//   } else if (block.BlockType === "TABLE") {
//     const boundingBox = block.Geometry.BoundingBox;
//     drawBoundingBox(
//       ctx,
//       height,
//       width,
//       boundingBox,
//       "rgba(255, 0, 0, 1)",
//       2
//     );
//   } else if (block.BlockType === "CELL") {
//     const boundingBox = block.Geometry.BoundingBox;
//     drawBoundingBox(
//       ctx,
//       height,
//       width,
//       boundingBox,
//       "rgba(0, 255, 255, 1)",
//       1
//     );
//   } else if (
//     block.BlockType === "SELECTION_ELEMENT" &&
//     block.SelectionStatus === "SELECTED"
//   ) {
//     const boundingBox = block.Geometry.BoundingBox;
//     drawBoundingBox(
//       ctx,
//       height,
//       width,
//       boundingBox,
//       "rgba(0, 0, 255, 1)",
//       1
//     );
//   }
// }

//     const imageUrl = canvas.toDataURL("image/png");

//     // Use await for the asynchronous upload operation
//     await uploadImageToS3(
//       imageUrl,
//       "getstartednewbucket",
//       `processed/${fileName.split("/").pop()}`
//     );

//     return true;
//   } catch (error) {
//     console.log("error----", error);
//     return processError(error);
//   }
// }

async function processResponse(response, fileName, uploadedFile) {
  console.log("processResponse");
  try {
    // Use await to get the resolved image before proceeding
    const image = await loadImage(uploadedFile);

    console.log("load image called successfully", image);
    const height = image.height;
    const width = image.width;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    console.log("canvas created", canvas);

    ctx.drawImage(image, 0, 0, width, height);
    console.log("here  response.Blocks", response.Blocks);

    for (const block of response.Blocks) {
      if (block.BlockType === "KEY_VALUE_SET") {
        const color =
          block.EntityTypes[0] === "KEY"
            ? "rgba(0, 0, 255, 1)"
            : "rgba(0, 255, 0, 1)";
        const boundingBox = block.Geometry.BoundingBox;
        drawBoundingBox(ctx, height, width, boundingBox, color, 1);
      } else if (block.BlockType === "TABLE") {
        const boundingBox = block.Geometry.BoundingBox;
        drawBoundingBox(
          ctx,
          height,
          width,
          boundingBox,
          "rgba(255, 0, 0, 1)",
          2
        );
      } else if (block.BlockType === "CELL") {
        const boundingBox = block.Geometry.BoundingBox;
        drawBoundingBox(
          ctx,
          height,
          width,
          boundingBox,
          "rgba(0, 255, 255, 1)",
          1
        );
      } else if (
        block.BlockType === "SELECTION_ELEMENT" &&
        block.SelectionStatus === "SELECTED"
      ) {
        const boundingBox = block.Geometry.BoundingBox;
        drawBoundingBox(
          ctx,
          height,
          width,
          boundingBox,
          "rgba(0, 0, 255, 1)",
          1
        );
      }
    }
    return canvas.toDataURL("image/png");
  } catch (error) {
    console.log("error----", error);
    return processError(error);
  }
}

async function uploadImageToS3(imageUrl, bucketName, key) {
  // Initialize S3 client
  AWS.config.update({
    region: "ap-south-1",
    credentials: new AWS.Credentials({
      accessKeyId: "AKIAYRK5RWLUDM2GONFC",
      secretAccessKey: "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",
    }),
  });

  const s3 = new AWS.S3();

  // Convert the data URL to a blob
  const imageBlob = await fetch(imageUrl).then((response) => response.blob());

  // Upload the image to S3
  try {
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: imageBlob,
      ContentType: "image/png", // Change the content type if necessary
    };

    await s3.upload(params).promise();
    console.log("Image uploaded successfully.");
  } catch (error) {
    console.error("Error uploading image:", error);
  }
}

export { processError, uploadToS3, processResponse };
