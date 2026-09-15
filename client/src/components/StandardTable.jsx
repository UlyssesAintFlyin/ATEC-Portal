import React from "react";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";

const defaultPageStyle = `
  @page { size: landscape; margin: 10mm; }
  .MuiDataGrid-root { width: 100% !important; }
  .MuiDataGrid-main { width: 100% !important; }
  .MuiDataGrid-root .MuiDataGrid-columnHeaders,
  .MuiDataGrid-root .MuiDataGrid-row { width: 100% !important; }
  table { width: 100% !important; table-layout: fixed !important; }
`;

function ExportToolbar({ fileName, printFields, pageStyle }) {
  return (
    <GridToolbarContainer sx={{ justifyContent: "space-between", gap: 1, p: 1 }}>
      <GridToolbarQuickFilter sx={{ width: { xs: "100%", sm: "auto" } }} />
      <GridToolbarExport
        csvOptions={{
          fileName,
          utf8WithBom: true,
          allColumns: true,
        }}
        printOptions={{
          allColumns: !printFields,
          fields: printFields,
          hideFooter: true,
          hideToolbar: true,
          pageStyle,
        }}
      />
    </GridToolbarContainer>
  );
}

export const StandardTable = ({
  rows,
  columns,
  fileName = "export",
  printFields, // e.g. ["subjectName", "instructor", "grade"] 
  pageStyle = defaultPageStyle,
  pageSize = 5,
  rowsPerPageOptions = [5, 10],
  height = 540,
  showToolbar = true,
}) => {
  return (
    <Paper sx={{ width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", height }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={pageSize}
          rowsPerPageOptions={rowsPerPageOptions}
          disableColumnFilter
          disableColumnSelector
          disableDensitySelector
          disableSelectionOnClick
          components={showToolbar ? { Toolbar: ExportToolbar } : {}}
          componentsProps={{
            toolbar: { fileName, printFields, pageStyle },
          }}
          sx={{ border: 0}}
        />
      </div>
    </Paper>
  );
};