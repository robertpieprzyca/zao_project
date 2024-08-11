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
    calculatePDM(latestData);
    setDataSource(latestData);

    console.log("Calculating with data:", latestData);
  };

  return (
    <div className="diagram-field">
      <h2>Diagram Field</h2>
      <Button type="primary" onClick={handleCalculate}>
        Calculate
      </Button>

      {dataSource.map((item) => (
        <div key={item.key} className="diagram-block-container">
          <DiagramBlock
            data={{
              ...item,
              earliest_start: item.earliest_start ?? 0,
              earliest_finish: item.earliest_finish ?? 0,
              latest_start: item.latest_start ?? 0,
              latest_finish: item.latest_finish ?? 0,
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default DiagramField;
