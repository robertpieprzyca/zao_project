import React, { useState } from "react";
import { Button } from "antd";

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
    // Add your calculation logic here
  };

  return (
    <div>
      <h2>Diagram Field</h2>
      <Button type="primary" onClick={handleCalculate}>
        Calculate
      </Button>
    </div>
  );
};

export default DiagramField;
