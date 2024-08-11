import React, { useState } from "react";
import { Button } from "antd";
import { calculatePDM } from "../../utils/pdmutils";
import type { Operation } from "../../utils/pdmutils";
import DiagramBlock from "../DiagramBlock/DiagramBlock";
import "./DiagramField.css";

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
    const calculatedData = calculatePDM(latestData);
    setDataSource(calculatedData);

    console.log("Calculating with data:", calculatedData);
  };

  // Group operations by earliest_start time
  const groupedData = dataSource.reduce(
    (acc: { [key: number]: Operation[] }, operation) => {
      if (
        operation.earliest_start !== undefined &&
        operation.earliest_finish !== undefined &&
        operation.latest_start !== undefined &&
        operation.latest_finish !== undefined &&
        operation.time_slack !== undefined
      ) {
        const level = operation.earliest_start;
        if (!acc[level]) {
          acc[level] = [];
        }
        acc[level].push(operation);
      }
      return acc;
    },
    {}
  );

  return (
    <div className="diagram-field">
      <h2 className="diagram-title">Diagram Field</h2>
      <Button type="primary" onClick={handleCalculate}>
        Calculate
      </Button>

      {Object.keys(groupedData).length > 0 && (
        <div className="diagram-grid-container">
          <div className="diagram-grid">
            {Object.keys(groupedData).map((level) => (
              <div key={level} className="diagram-column">
                {groupedData[+level].map((item) => (
                  <div key={item.key} className="diagram-block-container">
                    <DiagramBlock data={item as Required<Operation>} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagramField;
