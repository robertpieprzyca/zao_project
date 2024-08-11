import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

interface DiagramBlockProps {
  data: {
    earliest_start: number;
    operation_number: string;
    earliest_finish: number;
    latest_start: number;
    operation_time: number;
    latest_finish: number;
  };
}

const DiagramBlock: React.FC<DiagramBlockProps> = ({ data }) => {
  return (
    <TableContainer component={Paper} style={{ width: 200, height: 200 }}>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell align="center">{data.earliest_start}</TableCell>
            <TableCell align="center">{data.operation_number}</TableCell>
            <TableCell align="center">{data.earliest_finish}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="center">{data.latest_start}</TableCell>
            <TableCell align="center">{data.operation_time}</TableCell>
            <TableCell align="center">{data.latest_finish}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DiagramBlock;
