import React from "react";

const DynamicForm = ({ sampleData }) => {
  return (
    <div>
      {sampleData.map((item, index) => (
        <div key={index}>
          <label>{getFieldName(item.Text)}</label>
          <input value={getFieldValue(item.Text)} />
        </div>
      ))}
    </div>
  );
};

const getFieldName = (text) => {
  // Extracting field name from the text (e.g., "Name : Estelle Darcy" -> "Name")
  return text.split(" : ")[0];
};

const getFieldValue = (text) => {
  // Extracting field value from the text (e.g., "Name : Estelle Darcy" -> "Estelle Darcy")
  return text.split(" : ")[1];
};

export default DynamicForm;
