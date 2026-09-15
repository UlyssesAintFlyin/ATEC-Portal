import React from "react";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";

// Minimal toolbar: only export
function ExportToolbar() {
  return (
    <GridToolbarContainer sx={{ justifyContent: "flex-end", p: 1 }}>
      <GridToolbarExport
        csvOptions={{
          fileName: "students-report",
          utf8WithBom: true,
          allColumns: true,
        }}
        printOptions={{
          allColumns: true,
          hideFooter: true,
          hideToolbar: true,
        }}
      />
    </GridToolbarContainer>
  );
}

export const StandardTable = ({ rows, columns }) => {
  return (
    <Paper sx={{ width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", height: 540 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10]}
          disableColumnFilter
          disableColumnSelector
          disableDensitySelector
          disableSelectionOnClick
          components={{ Toolbar: ExportToolbar }}
          sx={{ border: 0 }}
        />
      </div>
    </Paper>
  );
};