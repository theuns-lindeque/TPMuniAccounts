import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";

interface Report {
  period: string;
  totalInvoiceAmount: string;
  totalRecoveryAmount: string;
  deficit: string;
  riskLevel: string;
}

interface FinancialTableProps {
  reports: Report[];
}

export const FinancialTable = ({ reports }: FinancialTableProps) => {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
      <Table sx={{ minWidth: 650 }} aria-label="financial performance table">
        <TableHead sx={{ bgcolor: "action.hover" }}>
          <TableRow>
            <TableCell sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Period</TableCell>
            <TableCell align="right" sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Invoices</TableCell>
            <TableCell align="right" sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recoveries</TableCell>
            <TableCell align="right" sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Deficit</TableCell>
            <TableCell sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Risk Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reports.map((report, idx) => (
            <TableRow
              key={idx}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: 13, fontWeight: 600 }}>
                  {report.period}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: 13 }}>
                  R {parseFloat(report.totalInvoiceAmount).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: 13 }}>
                  R {parseFloat(report.totalRecoveryAmount).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: 13, color: "error.main", fontWeight: 600 }}>
                  R {parseFloat(report.deficit).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={report.riskLevel}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: 10,
                    borderRadius: 1,
                    textTransform: 'uppercase',
                    ...(report.riskLevel === "High" && { bgcolor: "error.light", color: "error.dark" }),
                    ...(report.riskLevel === "Medium" && { bgcolor: "warning.light", color: "warning.dark" }),
                    ...(report.riskLevel === "Low" && { bgcolor: "success.light", color: "success.dark" }),
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
