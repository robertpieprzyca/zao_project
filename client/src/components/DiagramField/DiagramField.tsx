// DiagramField.tsx
import React, { useState } from "react";
import { Button } from "antd";
import DiagramBlock from "../DiagramBlock/DiagramBlock"; // Adjust import path as needed
import "./DiagramField.css"; // Import the CSS file

interface Item {
  key: string;
  operation_number: string;
  operation_time?: number;
  next_operation_number: string;
  number_of_resources?: number;
}

const DiagramField: React.FC = () => {
  const [dataSource, setDataSource] = useState<Item[]>([]);

  const fetchDataFromLocalStorage = () => {
    const savedData = localStorage.getItem("operationsData");
    if (savedData) {
      return JSON.parse(savedData);
    }
    return [];
  };

  const handleCalculate = () => {
    const latestData = fetchDataFromLocalStorage();
    setDataSource(latestData);

    console.log("Calculating with data:", latestData);
  };

  // Convert dataSource to fit DiagramBlock's DataType structure
  const formattedData = dataSource.map((item) => ({
    key: item.key,
    name: item.operation_number, // or any other mapping
    age: item.operation_time ?? 0, // provide default value if needed
    address: item.next_operation_number, // or any other mapping
  }));

  return (
    <div>
      <h2>Diagram Field</h2>
      <Button type="primary" onClick={handleCalculate}>
        Calculate
      </Button>
      <div className="diagram-field">
        {formattedData.map((data, index) => (
          <DiagramBlock key={index} data={[data]} />
        ))}
      </div>
    </div>
  );
};

export default DiagramField;
