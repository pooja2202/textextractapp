// // ImageProcessingHelper.js
// import React, { useEffect, useRef } from "react";
// import useCanvas from "../hooks/useCanvas";
// import { loadImage } from "canvas";

// function processError(error) {
//   return JSON.stringify({
//     errorType: error.name,
//     errorMessage: error.message,
//     stackTrace: error.stack,
//   });
// }

// async function uploadToS3(s3, buffer, BUCKET_NAME, key) {
//   await s3
//     .putObject({
//       Bucket: BUCKET_NAME,
//       Key: key,
//       Body: buffer,
//     })
//     .promise();
// }

// function drawBoundingBox(ctx, image, height, width, box, colorCode, thickness) {
//   ctx.drawImage(image, 0, 0, width, height);

//   const left = width * box.Left;
//   const top = height * box.Top;
//   const boxWidth = width * box.Width;
//   const boxHeight = height * box.Height;

//   ctx.strokeStyle = colorCode;
//   ctx.lineWidth = thickness;
//   ctx.beginPath();
//   ctx.rect(left, top, boxWidth, boxHeight);
//   ctx.stroke();
// }

// function useImageProcessing(response, s3, bucketName, fileName) {
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     async function processResponse() {
//       const selectedFile = fileName;
//       const image = await loadImage(selectedFile);
//       const height = image.height;
//       const width = image.width;

//       const canvas = canvasRef.current;
//       const ctx = canvas.getContext("2d");

//       for (const block of response.Blocks) {
//         if (block.BlockType === "KEY_VALUE_SET") {
//           const color =
//             block.EntityTypes[0] === "KEY"
//               ? "rgba(0, 0, 255, 1)"
//               : "rgba(0, 255, 0, 1)";
//           const boundingBox = block.Geometry.BoundingBox;
//           drawBoundingBox(ctx, image, height, width, boundingBox, color, 1);
//         } else if (block.BlockType === "TABLE") {
//           const boundingBox = block.Geometry.BoundingBox;
//           drawBoundingBox(
//             ctx,
//             image,
//             height,
//             width,
//             boundingBox,
//             "rgba(255, 0, 0, 1)",
//             2
//           );
//         } else if (block.BlockType === "CELL") {
//           const boundingBox = block.Geometry.BoundingBox;
//           drawBoundingBox(
//             ctx,
//             image,
//             height,
//             width,
//             boundingBox,
//             "rgba(0, 255, 255, 1)",
//             1
//           );
//         } else if (
//           block.BlockType === "SELECTION_ELEMENT" &&
//           block.SelectionStatus === "SELECTED"
//         ) {
//           const boundingBox = block.Geometry.BoundingBox;
//           drawBoundingBox(
//             ctx,
//             image,
//             height,
//             width,
//             boundingBox,
//             "rgba(0, 0, 255, 1)",
//             1
//           );
//         }
//       }

//       const buffer = canvas.toBuffer("image/png");
//       await uploadToS3(
//         s3,
//         buffer,
//         bucketName,
//         `processed/${fileName.split("/").pop()}`
//       );
//     }

//     processResponse();
//   }, [response, s3, bucketName, fileName]);

//   return canvasRef;
// }

// async function processResponse(response, s3, bucketName, fileName) {
//   try {
//     const selectedFile = fileName;
//     const image = await loadImage(selectedFile);
//     const height = image.height;
//     const width = image.width;

//     const canvas = createCanvas(width, height);
//     const ctx = canvas.getContext("2d");

//     for (const block of response.Blocks) {
//       if (block.BlockType === "KEY_VALUE_SET") {
//         const color =
//           block.EntityTypes[0] === "KEY"
//             ? "rgba(0, 0, 255, 1)"
//             : "rgba(0, 255, 0, 1)";
//         const boundingBox = block.Geometry.BoundingBox;
//         drawBoundingBox(ctx, image, height, width, boundingBox, color, 1);
//       } else if (block.BlockType === "TABLE") {
//         const boundingBox = block.Geometry.BoundingBox;
//         drawBoundingBox(
//           ctx,
//           image,
//           height,
//           width,
//           boundingBox,
//           "rgba(255, 0, 0, 1)",
//           2
//         );
//       } else if (block.BlockType === "CELL") {
//         const boundingBox = block.Geometry.BoundingBox;
//         drawBoundingBox(
//           ctx,
//           image,
//           height,
//           width,
//           boundingBox,
//           "rgba(0, 255, 255, 1)",
//           1
//         );
//       } else if (
//         block.BlockType === "SELECTION_ELEMENT" &&
//         block.SelectionStatus === "SELECTED"
//       ) {
//         const boundingBox = block.Geometry.BoundingBox;
//         drawBoundingBox(
//           ctx,
//           image,
//           height,
//           width,
//           boundingBox,
//           "rgba(0, 0, 255, 1)",
//           1
//         );
//       }
//     }

//     const buffer = canvas.toBuffer("image/png");
//     await uploadToS3(
//       s3,
//       buffer,
//       bucketName,
//       `processed/${fileName.split("/").pop()}`
//     );

//     return true;
//   } catch (error) {
//     return processError(error);
//   }
// }

// export { processError, uploadToS3, useImageProcessing, processResponse };
