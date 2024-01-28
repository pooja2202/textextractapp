// import { useEffect, useRef } from "react";
// import useCanvas from "../hooks/useCanvas";

// const Canvas = (props) => {
//   const { draw, ...rest } = props;

//   const ref = useCanvas(draw);

//   return <canvas ref={ref} {...rest} />;
// };

// export default Canvas;
// Above code is working
// src/components/Canvas.js
// import { useEffect, useRef } from "react";
// import useCanvas from "../hooks/useCanvas";

// const Canvas = (props) => {
//   const { draw, ...rest } = props;

//   const ref = useCanvas(draw);

//   return <canvas ref={ref} {...rest} />;
// };

// export default Canvas;
// Above worked till getting text written inside canvas onclick
// src/components/Canvas.js
// import { useEffect, useRef, useState } from "react";
// import useCanvas from "../hooks/useCanvas";

// const Canvas = (props) => {
//   const { draw, ...rest } = props;
//   const [isHovering, setIsHovering] = useState(false);

//   const ref = useCanvas((context, count) => draw(context, count, isHovering));

//   const handleMouseMove = (event) => {
//     const canvas = ref.current;
//     const rect = canvas.getBoundingClientRect();
//     const x = event.clientX - rect.left;
//     const y = event.clientY - rect.top;

//     // Check if mouse is within the bounds of the text
//     const isInsideText = x >= 20 && x <= 120 && y >= 30 && y <= 50; // Adjust these values based on text position and size
//     setIsHovering(isInsideText);
//   };

//   const handleMouseLeave = () => {
//     setIsHovering(false);
//   };

//   return (
//     <canvas
//       ref={ref}
//       {...rest}
//       onMouseMove={handleMouseMove}
//       onMouseLeave={handleMouseLeave}
//     />
//   );
// };

// export default Canvas;
// Above code working till hovering the selected text blue dashed border
// src/components/Canvas.js
import { useEffect, useRef, useState } from "react";
import useCanvas from "../hooks/useCanvas";

const Canvas = (props) => {
  const { draw, ...rest } = props;
  const [isHovering, setIsHovering] = useState(false);
  const ref = useCanvas((context, count, x, y) =>
    draw(context, count, isHovering, x, y)
  );

  const handleMouseMove = (event) => {
    const canvas = ref.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if mouse is within the bounds of the text
    const isInsideText = x >= 20 && x <= 120 && y >= 30 && y <= 50; // Adjust these values based on text position and size
    setIsHovering(isInsideText);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleClick = (event) => {
    const canvas = ref.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    draw(ref.current.getContext("2d"), 0, false, x, y);
  };

  return (
    <canvas
      ref={ref}
      {...rest}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    />
  );
};

export default Canvas;
//Above code working till, text inside canvas , blue dashed border, blue text, both on hover and onclick able to get value
