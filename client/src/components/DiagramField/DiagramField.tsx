import React, { useState } from "react";
import { Button } from "antd";
import { ArcherContainer, ArcherElement } from "react-archer";
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

  // Define idMap with the appropriate type
  const idMap: { [key: string]: string } = dataSource.reduce(
    (map, operation) => {
      map[operation.operation_number] = operation.key;
      return map;
    },
    {} as { [key: string]: string }
  );

  return (
    <div className="diagram-field">
      <h2 className="diagram-title">Diagram Field</h2>
      <Button type="primary" onClick={handleCalculate}>
        Calculate
      </Button>

      {Object.keys(groupedData).length > 0 && (
        <ArcherContainer>
          <div className="diagram-grid-container">
            <div className="diagram-grid">
              {Object.keys(groupedData).map((level) => (
                <div key={level} className="diagram-column">
                  {groupedData[+level].map((item) => (
                    <ArcherElement
                      key={item.key}
                      id={item.key}
                      relations={
                        item.next_operation_number
                          .split(",")
                          .map((nextOp) => {
                            const targetId = idMap[nextOp.trim()];
                            const targetOperation = dataSource.find(
                              (op) => op.key === targetId
                            );
                            const strokeColor =
                              item.time_slack === 0 &&
                              targetOperation?.time_slack === 0
                                ? "red"
                                : "black";
                            return targetId
                              ? {
                                  targetId: targetId,
                                  targetAnchor: "left",
                                  sourceAnchor: "right",
                                  style: {
                                    strokeColor: strokeColor,
                                    strokeWidth: 1.5,
                                    lineStyle: "curve",
                                  },
                                }
                              : null;
                          })
                          .filter((relation) => relation !== null) as any
                      } // Remove null entries
                    >
                      <div className="diagram-block-container">
                        <DiagramBlock data={item as Required<Operation>} />
                      </div>
                    </ArcherElement>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </ArcherContainer>
      )}
    </div>
  );
};

export default DiagramField;
