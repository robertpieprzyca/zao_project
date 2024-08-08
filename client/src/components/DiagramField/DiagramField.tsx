import React, { useState } from "react";
import { Button } from "@mui/material";
import { calculatePDM } from "../../utils/pdmutils"; // Import the calculation functions
import type { Operation } from "../../utils/pdmutils"; // Import the type for Operation
import DiagramBlock from "../DiagramBlock/DiagramBlock"; // Ensure this is the correct path to your DiagramBlock component
import "./DiagramField.css"; // Ensure you have the styles

const DiagramField: React.FC = () => {
  const [dataSource, setDataSource] = useState<Operation[]>([]);

  const fetchDataFromLocalStorage = () => {
    const savedData = localStorage.getItem("operationsData");
    if (savedData) {
      return JSON.parse(savedData);
    }
    return [];
  };

  const handleCalculate = () => {
    const latestData = fetchDataFromLocalStorage();
    const calculatedData = calculatePDM(latestData); // Calculate the PDM values
    setDataSource(calculatedData);

    console.log("Calculated data:", calculatedData);
  };

  return (
    <div className="diagram-field">
      <h2>Diagram Field</h2>
      <Button variant="contained" color="primary" onClick={handleCalculate}>
        Calculate
      </Button>

      {/* Render DiagramBlocks based on dataSource */}
      <div className="diagram-blocks-container">
        {dataSource.map((item) => (
          <DiagramBlock key={item.key} data={item} />
        ))}
      </div>
    </div>
  );
};

export default DiagramField;
