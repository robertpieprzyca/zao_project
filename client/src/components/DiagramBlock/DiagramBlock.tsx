import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Operation } from "../../utils/pdmutils"; // Update import path if necessary
import "./DiagramBlock.css";

interface DiagramBlockProps {
  data: Operation;
}

const DiagramBlock: React.FC<DiagramBlockProps> = ({ data }) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ height: "100%", tableLayout: "fixed" }}>
        <TableBody>
          <TableRow>
            <TableCell className="block-data" align="center">
              {data.earliest_start ?? "-"}
            </TableCell>
            <TableCell className="block-data" align="center">
              {data.operation_time}
            </TableCell>
            <TableCell className="block-data" align="center">
              {data.earliest_finish ?? "-"}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="block-data" colSpan={3} align="center">
              {data.operation_number ?? "-"}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="block-data" align="center">
              {data.latest_start ?? "-"}
            </TableCell>
            <TableCell className="block-data" align="center">
              {data.time_slack ?? "-"}
            </TableCell>
            <TableCell className="block-data" align="center">
              {data.latest_finish ?? "-"}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DiagramBlock;
