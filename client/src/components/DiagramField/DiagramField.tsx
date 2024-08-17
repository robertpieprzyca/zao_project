import React, { useState, useEffect } from "react";
import { Button } from "antd";
import { ArcherContainer, ArcherElement } from "react-archer";
import { calculatePDM } from "../../utils/pdmutils";
import type { Operation } from "../../utils/pdmutils";
import DiagramBlock from "../DiagramBlock/DiagramBlock";
import "./DiagramField.css";

const DiagramField: React.FC = () => {
  const [dataSource, setDataSource] = useState<Operation[]>([]);
  const [positions, setPositions] = useState<Map<string, number>>(new Map());

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

  useEffect(() => {
    const newPositions = new Map<string, number>();

    // Initial margin calculation
    Object.keys(groupedData).forEach((level) => {
      const column = groupedData[+level];

      column.forEach((operation, index) => {
        // Set the marginTop for the first item to 0px and subsequent items to 48px
        const marginTop = index === 0 ? 0 : 48;
        newPositions.set(operation.key, marginTop);
      });
    });

    // Align operations with a single predecessor
    Object.keys(groupedData).forEach((level) => {
      const column = groupedData[+level];

      column.forEach((operation) => {
        const predecessors = dataSource.filter((op) =>
          op.next_operation_number
            .split(",")
            .map((opNum) => opNum.trim())
            .includes(operation.operation_number)
        );

        if (predecessors.length === 1 && column.length === 1) {
          const predecessor = predecessors[0];
          const predecessorPosition = positions.get(predecessor.key);

          if (predecessorPosition !== undefined) {
            // Calculate vertical offset for alignment
            const numOperationsAbove = dataSource.filter(
              (op) =>
                op.key !== operation.key &&
                (groupedData[+op.earliest_start as number] || []).length
            ).length;
            const verticalOffset = 48; // Offset in px
            newPositions.set(
              operation.key,
              predecessorPosition - 67.35 + numOperationsAbove * verticalOffset
            );
          }
        }
      });
    });

    setPositions(newPositions);
  }, [dataSource]);

  // Group operations by earliest_start time to maintain column structure
  const groupedData = dataSource.reduce(
    (acc: { [key: number]: Operation[] }, operation) => {
      if (
        operation.earliest_start !== undefined &&
        operation.earliest_finish !== undefined &&
        operation.latest_start !== undefined &&
        operation.latest_finish !== undefined &&
        operation.time_slack !== undefined
      ) {
        const level = operation.earliest_start ?? 0; // Use 0 as a default if undefined
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
              {Object.keys(groupedData).map((level) => {
                const columnData = groupedData[+level];
                return (
                  <div key={level} className="diagram-column">
                    {columnData.map((operation) => {
                      const marginTop = positions.get(operation.key) || 0;

                      return (
                        <ArcherElement
                          key={operation.key}
                          id={operation.key}
                          relations={
                            operation.next_operation_number
                              .split(",")
                              .map((nextOp) => {
                                const targetId = idMap[nextOp.trim()];
                                const targetOperation = dataSource.find(
                                  (op) => op.key === targetId
                                );
                                const strokeColor =
                                  operation.time_slack === 0 &&
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
                          }
                        >
                          <div
                            className="diagram-block-container"
                            style={{
                              marginTop: `${marginTop}px`,
                            }}
                          >
                            <DiagramBlock
                              data={operation as Required<Operation>}
                            />
                          </div>
                        </ArcherElement>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </ArcherContainer>
      )}
    </div>
  );
};

export default DiagramField;
