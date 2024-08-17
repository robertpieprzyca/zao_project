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
  };

  useEffect(() => {
    // Group operations by their columns
    const groupedData = dataSource.reduce(
      (acc: { [key: number]: Operation[] }, operation) => {
        const level = operation.earliest_start ?? 0; // Use 0 as a default if undefined
        if (!acc[level]) {
          acc[level] = [];
        }
        acc[level].push(operation);
        return acc;
      },
      {}
    );

    const newPositions = new Map<string, number>();

    // First pass to set initial margins
    Object.keys(groupedData).forEach((level) => {
      const column = groupedData[+level];

      column.forEach((operation, index) => {
        const marginTop = index === 0 ? 0 : 48; // Set initial margin for the first item, and 48px for subsequent items
        newPositions.set(operation.key, marginTop);
      });
    });

    // Second pass to align alone operations with one predecessor
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
          const predecessorColumn =
            groupedData[+predecessor.earliest_start] || [];

          // Sort the predecessor column by the current positions to accurately count operations above
          const sortedColumn = [...predecessorColumn].sort((a, b) => {
            return (
              (newPositions.get(a.key) ?? 0) - (newPositions.get(b.key) ?? 0)
            );
          });

          // Calculate the number of operations above the predecessor in its column
          const numOperationsAbove = sortedColumn.findIndex(
            (op) => op.key === predecessor.key
          );

          const verticalOffset = 48; // Offset in px
          const blockheight = 134.7; // height of a block
          const adjustedMarginTop =
            numOperationsAbove * blockheight +
            (numOperationsAbove - 1) * verticalOffset;

          newPositions.set(
            operation.key,
            (newPositions.get(predecessor.key) ?? 0) +
              Math.max(adjustedMarginTop, 0)
          );
        }
      });
    });

    setPositions(newPositions);
  }, [dataSource]);

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

      {Object.keys(
        dataSource.reduce((acc: { [key: number]: Operation[] }, operation) => {
          const level = operation.earliest_start ?? 0; // Use 0 as a default if undefined
          if (!acc[level]) {
            acc[level] = [];
          }
          acc[level].push(operation);
          return acc;
        }, {})
      ).length > 0 && (
        <ArcherContainer>
          <div className="diagram-grid-container">
            <div className="diagram-grid">
              {Object.keys(
                dataSource.reduce(
                  (acc: { [key: number]: Operation[] }, operation) => {
                    const level = operation.earliest_start ?? 0; // Use 0 as a default if undefined
                    if (!acc[level]) {
                      acc[level] = [];
                    }
                    acc[level].push(operation);
                    return acc;
                  },
                  {}
                )
              ).map((level) => {
                const columnData = dataSource.reduce(
                  (acc: { [key: number]: Operation[] }, operation) => {
                    const level = operation.earliest_start ?? 0; // Use 0 as a default if undefined
                    if (!acc[level]) {
                      acc[level] = [];
                    }
                    acc[level].push(operation);
                    return acc;
                  },
                  {}
                )[+level];
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
