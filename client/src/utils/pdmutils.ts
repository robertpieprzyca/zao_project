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

export const calculatePDM = (operations: Operation[]): Operation[] => {
  const operationMap = new Map<string, Operation>();

  operations.forEach((operation) => {
    // Initialize properties to avoid undefined errors
    operation.earliest_start = 0;
    operation.earliest_finish = 0;
    operation.latest_start = Infinity;
    operation.latest_finish = Infinity;

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
  if (operation.earliest_finish! > 0) return;

  // Find predecessors
  const predecessors = Array.from(operationMap.values()).filter(
    (op) => op.next_operation_number === operation.operation_number
  );

  if (predecessors.length === 0) {
    operation.earliest_start = 0;
  } else {
    // Calculate the earliest start based on predecessors' earliest finish
    operation.earliest_start = Math.max(
      ...predecessors.map((predecessor) => {
        calculateEarliest(predecessor, operationMap);
        return predecessor.earliest_finish!;
      })
    );
  }

  // Calculate earliest finish
  operation.earliest_finish =
    +operation.earliest_start! + +operation.operation_time;
};

const calculateLatest = (
  operation: Operation,
  operationMap: Map<string, Operation>
) => {
  if (operation.latest_finish! < Infinity) return;

  // Find successors
  const successors = Array.from(operationMap.values()).filter(
    (op) => op.operation_number === operation.next_operation_number
  );

  if (successors.length === 0 || operation.next_operation_number === "-") {
    // For the last operation or standalone
    operation.latest_finish = operation.earliest_finish!;
  } else {
    // Calculate latest finish based on successors' latest start
    operation.latest_finish = Math.min(
      ...successors.map((successor) => {
        calculateLatest(successor, operationMap);
        return successor.latest_start!;
      })
    );
  }

  // Calculate latest start
  operation.latest_start = operation.latest_finish! - operation.operation_time;
};
