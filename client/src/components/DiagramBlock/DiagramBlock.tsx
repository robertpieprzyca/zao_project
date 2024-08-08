import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import type { Operation } from "../../utils/pdmutils"; // Import the type for Operation
import "./DiagramBlock.css"; // Ensure you have the styles

interface DiagramBlockProps {
  data: Operation;
}

const DiagramBlock: React.FC<DiagramBlockProps> = ({ data }) => {
  // Define the rows with the relevant data
  const rows = [
    {
      value1: data.earliest_start ?? 0,
      value2: data.operation_number,
      value3: data.earliest_finish ?? 0,
    },
    {
      value1: data.latest_start ?? 0,
      value2: data.operation_time,
      value3: data.latest_finish ?? 0,
    },
  ];

  return (
    <TableContainer component={Paper} className="diagram-block">
      <Table size="small">
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              <TableCell className="diagram-cell">{row.value1}</TableCell>
              <TableCell className="diagram-cell">{row.value2}</TableCell>
              <TableCell className="diagram-cell">{row.value3}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DiagramBlock;
