import React, { useState, useEffect } from "react";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";

{
  /*Table toolbar*/
}
function CustomToolbar() {
  return (
    <GridToolbarContainer
      sx={{
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 1,
        p: 1,
      }}
    >
      <div>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport
          csvOptions={{
            allColumns: true, 
            fileName: "ATEC-report", 
            delimiter: ",", 
            utf8WithBom: true, 
          }}
          printOptions={{
            hideToolbar: true, 
            hideFooter: true, 
            allColumns: false,
          }}
        />
      </div>
      <GridToolbarQuickFilter sx={{ width: { xs: "100%", sm: "auto" } }} />
    </GridToolbarContainer>
  );
}

export const Table = ({ rows, columns, paginationModel, ...props }) => {
  return (
    <Paper sx={{ width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", height: 540 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={paginationModel?.pageSize || 5}
          rowsPerPageOptions={[5, 10]}
          checkboxSelection
          components={{ Toolbar: CustomToolbar }}
          sx={{ border: 0 }}
          {...props}
        />
      </div>
    </Paper>
  );
};
