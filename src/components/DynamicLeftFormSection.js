import React from "react";

const DynamicForm = ({ dataObj }) => {
  return (
    <form>
      {Object.entries(dataObj).map(([key, value]) => (
        <div key={key} style={{ display: "flex", padding: "0.4rem" }}>
          <label style={{ width: "40%" }}>{key}</label>
          <input type="text" name={key} defaultValue={value} />
          {/* <input value="" /> */}
        </div>
      ))}
    </form>
  );
};

export default DynamicForm;
// import { useState } from "react";

// const DynamicForm = ({ dataObj, onFieldClick }) => {
//   const [selectedField, setSelectedField] = useState(null);

//   const handleClick = (key, event) => {
//     onFieldClick(key);

//     // Get the position of the clicked field
//     const rect = event.currentTarget.getBoundingClientRect();
//     setSelectedField({
//       key,
//       position: {
//         top: rect.top + rect.height / 2,
//         left: rect.left + rect.width,
//       },
//     });
//   };

//   return (
//     <form>
//       {Object.entries(dataObj).map(([key]) => (
//         <div
//           key={key}
//           style={{ display: "flex", padding: "0.4rem", cursor: "pointer" }}
//           onClick={(event) => handleClick(key, event)}
//         >
//           <label style={{ width: "40%" }}>{key}</label>
//           <input type="text" name={key} defaultValue={value} />
//         </div>
//       ))}
//     </form>
//   );
// };

// export default DynamicForm;
