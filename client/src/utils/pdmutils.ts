export type Operation = {
  key: string;
  operation_number: string;
  operation_time: number;
  next_operation_number: string;
  number_of_resources?: number;
  earliest_start?: number;
  earliest_finish?: number;
  latest_start?: number;
  latest_finish?: number;
};

export const calculatePDM = (operations: Operation[]) => {
  const operationMap = new Map<string, Operation>();

  operations.forEach((operation) => {
    // Initialize properties to avoid undefined errors
    operation.earliest_start = 0;
    operation.earliest_finish = 0;
    operation.latest_start = 0;
    operation.latest_finish = 0;

    operationMap.set(operation.operation_number, operation);
  });

  operations.forEach((operation) => {
    calculateEarliest(operation, operationMap);
  });

  operations.reverse().forEach((operation) => {
    calculateLatest(operation, operationMap);
  });

  return operations;
};

const calculateEarliest = (
  operation: Operation,
  operationMap: Map<string, Operation>
) => {
  if (operation.earliest_start !== 0) return;

  // Find predecessors based on their next_operation_number
  const predecessors = Array.from(operationMap.values()).filter((op) =>
    op.next_operation_number.split(",").includes(operation.operation_number)
  );

  if (predecessors.length === 0) {
    operation.earliest_start = 0;
  } else {
    operation.earliest_start = Math.max(
      ...predecessors.map((predecessor) => {
        calculateEarliest(predecessor, operationMap);
        return predecessor.earliest_finish!; // Non-null assertion
      })
    );
  }

  operation.earliest_finish =
    +operation.earliest_start + +operation.operation_time;
};

const calculateLatest = (
  operation: Operation,
  operationMap: Map<string, Operation>
) => {
  if (operation.latest_finish !== 0) return;

  const successors = Array.from(operationMap.values()).filter((op) =>
    operation.next_operation_number.split(",").includes(op.operation_number)
  );

  if (successors.length === 0) {
    operation.latest_finish = operation.earliest_finish!;
  } else {
    operation.latest_finish = Math.min(
      ...successors.map((successor) => {
        calculateLatest(successor, operationMap);
        return successor.latest_start!; // Non-null assertion
      })
    );
  }

  operation.latest_start = +operation.latest_finish - +operation.operation_time;
};
