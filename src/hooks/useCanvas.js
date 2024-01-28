// import { useEffect, useRef } from "react";

// const useCanvas = (draw) => {
//   const ref = useRef();

//   useEffect(() => {
//     const canvas = ref.current;
//     const context = canvas.getContext("2d");
//     let count = 0;
//     let animationID;

//     const renderer = () => {
//       count++;
//       draw(context, count);
//       animationID = window.requestAnimationFrame(renderer);
//     };
//     renderer();
//     return () => window.cancelAnimationFrame(animationID);
//   }, [draw]);

//   return ref;
// };

// export default useCanvas;
//Above code is working
// src/hooks/useCanvas.js
// import { useEffect, useRef } from "react";

// const useCanvas = (draw) => {
//   const ref = useRef();

//   useEffect(() => {
//     const canvas = ref.current;
//     const context = canvas.getContext("2d");
//     let count = 0;
//     let animationID;

//     const renderer = () => {
//       count++;
//       draw(context, count);
//       animationID = window.requestAnimationFrame(renderer);
//     };
//     renderer();
//     return () => window.cancelAnimationFrame(animationID);
//   }, [draw]);

//   return ref;
// };

// export default useCanvas;
//Above working till text is inside
// src/hooks/useCanvas.js
import { useEffect, useRef } from "react";

const useCanvas = (draw) => {
  const ref = useRef();

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas.getContext("2d");
    let count = 0;
    let animationID;

    const renderer = () => {
      count++;
      draw(context, count);
      animationID = window.requestAnimationFrame(renderer);
    };
    renderer();

    const handleClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      draw(context, count, x, y);
    };

    canvas.addEventListener("click", handleClick);

    return () => {
      canvas.removeEventListener("click", handleClick);
      window.cancelAnimationFrame(animationID);
    };
  }, [draw]);

  return ref;
};

export default useCanvas;
//Above code working till, text inside canvas , blue dashed border, blue text, both on hover and onclick able to get value
