import React, { useState } from "react";
import { Button } from "antd";
import { BarChart } from "@mui/x-charts/BarChart";
import { calculatePDM } from "../../utils/pdmutils";
import type { Operation } from "../../utils/pdmutils";
import "./ScheduleField.css";

const ScheduleField: React.FC = () => {
  const [operationsData, setOperationsData] = useState<Operation[]>([]);
  const [calculated, setCalculated] = useState<Operation[]>([]);

  // Fetch data from local storage
  const fetchDataFromLocalStorage = () => {
    const savedData = localStorage.getItem("operationsData");
    if (savedData) {
      return JSON.parse(savedData);
    }
    return [];
  };

  // Handle calculate button click
  const handleCalculate = () => {
    const latestData = fetchDataFromLocalStorage();
    const calculatedData = calculatePDM(latestData);
    setCalculated(calculatedData);
    setOperationsData(latestData);
  };

  // Calculate the number of rows and columns
  const latestFinishTime = Math.max(
    ...calculated.map((operation) => operation.latest_finish ?? 0)
  );
  const numCols = latestFinishTime;

  // Reverse the operations list
  const reversedOperations = [...operationsData].reverse();

  // Function to calculate the sum of resources for each column
  const calculateResourcesSum = (
    operations: Operation[],
    timeStartKey: keyof Operation,
    timeEndKey: keyof Operation
  ) => {
    return Array.from({ length: numCols }).map((_, colIndex) => {
      const timePeriod = colIndex + 1;
      return operations.reduce((sum, operation) => {
        const isInOperationTimeRange =
          timePeriod >= +(operation[timeStartKey] ?? 0) + 1 &&
          timePeriod <= +(operation[timeEndKey] ?? 0);
        return isInOperationTimeRange
          ? +sum + +(operation.number_of_resources ?? 0)
          : +sum;
      }, 0);
    });
  };

  const forwardScheduleResourcesSum = calculateResourcesSum(
    reversedOperations,
    "earliest_start",
    "earliest_finish"
  );

  const backwardScheduleResourcesSum = calculateResourcesSum(
    reversedOperations,
    "latest_start",
    "latest_finish"
  );

  // Function to calculate the slack for an operation
  const calculateSlack = (operation: Operation) => {
    if (
      operation.latest_finish !== undefined &&
      operation.earliest_finish !== undefined
    ) {
      return operation.latest_finish - operation.earliest_finish;
    }
    return undefined;
  };

  // Function to determine the cell color based on slack
  const getCellColor = (slack: number | undefined) => {
    if (slack === 0) {
      return "#FF6666";
    } else if (slack !== undefined) {
      return "#FFB266";
    }
    return "transparent";
  };

  // Function to get color based on resource value
  const getResourceColor = (value: number) => {
    // Define color scale
    const maxValue = Math.max(
      ...forwardScheduleResourcesSum,
      ...backwardScheduleResourcesSum
    );
    const ratio = value / maxValue;
    const greenToRed = `rgb(${Math.round(255 * ratio)}, ${Math.round(
      255 * (1 - ratio)
    )}, 0)`;
    return greenToRed;
  };
  return (
    <>
      <div className="schedule-header">
        <h2 className="schedule-title">Schedule Field</h2>
        <Button type="primary" onClick={handleCalculate}>
          Calculate
        </Button>
      </div>
      {operationsData.length > 0 && (
        <div className="schedule-field">
          <h3 className="table-title">Forward Schedule</h3>
          <div className="table-wrapper">
            {/* First Table */}
            <table className="schedule-table">
              <tbody>
                {/* First row: Time labels */}
                <tr>
                  <td>Time</td>
                  {Array.from({ length: numCols }).map((_, colIndex) => (
                    <td key={colIndex + 1}>{colIndex + 1}</td>
                  ))}
                </tr>

                {/* Rows with operation numbers and resource allocation */}
                {reversedOperations.map((operation, rowIndex) => {
                  const slack = calculateSlack(operation);
                  return (
                    <tr key={rowIndex}>
                      <td>{operation.operation_number}</td>
                      {Array.from({ length: numCols }).map((_, colIndex) => {
                        const timePeriod = colIndex + 1;
                        const isInOperationTimeRange =
                          timePeriod >= (operation.earliest_start ?? 0) + 1 &&
                          timePeriod <= (operation.earliest_finish ?? 0);
                        const cellColor = getCellColor(
                          isInOperationTimeRange ? slack : undefined
                        );
                        return (
                          <td
                            key={colIndex}
                            style={{ backgroundColor: cellColor }}
                          >
                            {isInOperationTimeRange
                              ? operation.number_of_resources
                              : ""}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* Last row: Resources sum */}
                <tr>
                  <td>Resources</td>
                  {forwardScheduleResourcesSum.map((sum, colIndex) => (
                    <td
                      key={colIndex}
                      style={{ backgroundColor: getResourceColor(sum) }}
                    >
                      {sum}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            <h3 className="chart-title">Forward Chart</h3>
            {/* Forward Schedule Bar Chart */}
            <div className="chart">
              <BarChart
                yAxis={[{ label: "Resources" }]}
                xAxis={[
                  {
                    scaleType: "band",
                    data: Array.from({ length: numCols }, (_, i) => i + 1),
                    label: "Time",
                  },
                ]}
                series={[
                  { data: forwardScheduleResourcesSum, color: "#1677ff" },
                ]}
                width={600}
                height={300}
              />
            </div>
          </div>

          <h3 className="table-title">Backward Schedule</h3>
          <div className="table-wrapper">
            {/* Second Table */}
            <table className="schedule-table">
              <tbody>
                {/* First row: Time labels */}
                <tr>
                  <td>Time</td>
                  {Array.from({ length: numCols }).map((_, colIndex) => (
                    <td key={colIndex + 1}>{colIndex + 1}</td>
                  ))}
                </tr>

                {/* Rows with operation numbers and resource allocation */}
                {reversedOperations.map((operation, rowIndex) => {
                  const slack = calculateSlack(operation);
                  return (
                    <tr key={rowIndex}>
                      <td>{operation.operation_number}</td>
                      {Array.from({ length: numCols }).map((_, colIndex) => {
                        const timePeriod = colIndex + 1;
                        const isInOperationTimeRange =
                          timePeriod >= (operation.latest_start ?? 0) + 1 &&
                          timePeriod <= (operation.latest_finish ?? 0);
                        const cellColor = getCellColor(
                          isInOperationTimeRange ? slack : undefined
                        );
                        return (
                          <td
                            key={colIndex}
                            style={{ backgroundColor: cellColor }}
                          >
                            {isInOperationTimeRange
                              ? operation.number_of_resources
                              : ""}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* Last row: Resources sum */}
                <tr>
                  <td>Resources</td>
                  {backwardScheduleResourcesSum.map((sum, colIndex) => (
                    <td
                      key={colIndex}
                      style={{ backgroundColor: getResourceColor(sum) }}
                    >
                      {sum}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>

            {/* Backward Schedule Bar Chart */}
            <h3 className="chart-title">Backward Chart</h3>
            <div className="chart">
              <BarChart
                yAxis={[{ label: "Resources" }]}
                xAxis={[
                  {
                    scaleType: "band",
                    data: Array.from({ length: numCols }, (_, i) => i + 1),
                    label: "Time",
                  },
                ]}
                series={[
                  {
                    data: backwardScheduleResourcesSum,
                    color: "#1677ff",
                  },
                ]}
                width={600}
                height={300}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ScheduleField;
