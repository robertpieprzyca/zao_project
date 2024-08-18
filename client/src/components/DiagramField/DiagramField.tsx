import React, { useState, useEffect, useRef } from "react";
import { Button } from "antd";
import { ArcherContainer, ArcherElement } from "react-archer";
import { calculatePDM } from "../../utils/pdmutils";
import type { Operation } from "../../utils/pdmutils";
import DiagramBlock from "../DiagramBlock/DiagramBlock";
import "./DiagramField.css";

const DiagramField: React.FC = () => {
  const [dataSource, setDataSource] = useState<Operation[]>([]);
  const [positions, setPositions] = useState<Map<string, number>>(new Map());
  const containerRef = useRef<HTMLDivElement | null>(null);
  let borderColor: string;

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
    const groupedData = dataSource.reduce(
      (acc: { [key: number]: Operation[] }, operation) => {
        const level = operation.earliest_start ?? 0;
        if (!acc[level]) {
          acc[level] = [];
        }
        acc[level].push(operation);
        return acc;
      },
      {}
    );

    const newPositions = new Map<string, number>();

    Object.keys(groupedData).forEach((level) => {
      const column = groupedData[+level];

      column.forEach((operation, index) => {
        const marginTop = index === 0 ? 0 : 48;
        newPositions.set(operation.key, marginTop);
      });
    });

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

          const sortedColumn = [...predecessorColumn].sort((a, b) => {
            return (
              (newPositions.get(a.key) ?? 0) - (newPositions.get(b.key) ?? 0)
            );
          });

          const numOperationsAbove = sortedColumn.findIndex(
            (op) => op.key === predecessor.key
          );

          const verticalOffset = 48;
          const blockHeight = 134.7;
          const adjustedMarginTop =
            numOperationsAbove * blockHeight +
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

  const resizeSVG = () => {
    if (containerRef.current) {
      const svgElement = containerRef.current.querySelector("svg");
      if (svgElement) {
        const contentWidth = containerRef.current.scrollWidth;
        const contentHeight = containerRef.current.scrollHeight;
        svgElement.setAttribute("width", `${contentWidth}`);
        svgElement.setAttribute("height", `${contentHeight}`);
      }
    }
  };

  useEffect(() => {
    resizeSVG();
    window.addEventListener("resize", resizeSVG);

    return () => {
      window.removeEventListener("resize", resizeSVG);
    };
  }, [dataSource]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", resizeSVG);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", resizeSVG);
      }
    };
  }, []);

  const idMap: { [key: string]: string } = dataSource.reduce(
    (map, operation) => {
      map[operation.operation_number] = operation.key;
      return map;
    },
    {} as { [key: string]: string }
  );

  return (
    <>
      <div className="diagram-header">
        <h2 className="diagram-title">Diagram Field</h2>
        <Button type="primary" onClick={handleCalculate}>
          Calculate
        </Button>
      </div>
      <div className="diagram-field">
        {dataSource.length > 0 && (
          <div className="archer-container-wrapper" ref={containerRef}>
            <ArcherContainer className="archer-container">
              <div className="diagram-grid-container">
                <div className="diagram-grid">
                  {Object.keys(
                    dataSource.reduce(
                      (acc: { [key: number]: Operation[] }, operation) => {
                        const level = operation.earliest_start ?? 0;
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
                        const level = operation.earliest_start ?? 0;
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
                                    const borderColor =
                                      operation.time_slack === 0 ? "red" : "";
                                    return targetId
                                      ? {
                                          targetId: targetId,
                                          targetAnchor: "left",
                                          sourceAnchor: "right",
                                          style: {
                                            borderColor: borderColor,
                                            strokeColor: strokeColor,
                                            strokeWidth: 1.5,
                                            lineStyle: "curve",
                                          },
                                        }
                                      : null;
                                  })
                                  .filter(
                                    (relation) => relation !== null
                                  ) as any
                              }
                            >
                              <div
                                className={
                                  "diagram-block-container " +
                                  (borderColor === "red"
                                    ? "critical-block"
                                    : "")
                                }
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
          </div>
        )}
      </div>
    </>
  );
};

export default DiagramField;
