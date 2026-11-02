import React from "react";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarQuickFilter,
  useGridApiRef,
  gridFilteredSortedRowIdsSelector,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const defaultPageStyle = `
  @page { size: landscape; margin: 10mm; }
  body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #000; background: #fff; }
  .MuiDataGrid-root { width: 100% !important; border: none !important; }
  .MuiDataGrid-main { width: 100% !important; }
  .MuiDataGrid-columnHeaders { background-color: #f3f9ff !important; }
`;

function ExportToolbar({ fileName, printFields, pageStyle, rows, columns, apiRef }) {
  const handleExportPDF = () => {
    const doc = new jsPDF("landscape", "mm", "a4");

    const activeColumns = printFields
      ? columns.filter((col) => printFields.includes(col.field))
      : columns.filter((col) => col.field !== "action");

    const tableHeaders = activeColumns.map((col) => col.headerName);

    let currentRows = rows;
    try {
      if (apiRef?.current?.state) {
        const sortedFilteredIds = gridFilteredSortedRowIdsSelector(apiRef.current.state);
        if (sortedFilteredIds && sortedFilteredIds.length > 0) {
          const rowMap = new Map(rows.map((r) => [r.id, r]));
          currentRows = sortedFilteredIds.map((id) => rowMap.get(id)).filter(Boolean);
        }
      }
    } catch (err) {
      console.warn("Falling back to default row order due to uninitialized apiRef state:", err);
    }

    const tableData = currentRows.map((row) =>
      activeColumns.map((col) => {
        const val = row[col.field];
        return val !== undefined && val !== null ? String(val) : "";
      })
    );

    const titleText = fileName
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    const img = new Image();
    img.src = "/resources/print-header.png";
    img.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const imgWidth = 140;
      const imgHeight = (img.height * imgWidth) / img.width;
      const xPos = (pageWidth - imgWidth) / 2;

      doc.addImage(img, "PNG", xPos, 10, imgWidth, imgHeight);

      const titleY = 10 + imgHeight + 6;
      doc.setFont("Arial", "bold");
      doc.setFontSize(13);
      doc.text(titleText, pageWidth / 2, titleY, { align: "center" });

      autoTable(doc, {
        startY: titleY + 6,
        head: [tableHeaders],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [59, 71, 136] },
        styles: { fontSize: 10, cellPadding: 5 },
      });
      doc.save(`${fileName}.pdf`);
    };

    img.onerror = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFont("Arial", "bold");
      doc.setFontSize(13);
      doc.text(titleText, pageWidth / 2, 15, { align: "center" });

      autoTable(doc, {
        startY: 20,
        head: [tableHeaders],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [59, 71, 136] },
      });
      doc.save(`${fileName}.pdf`);
    };
  };

  return (
    <GridToolbarContainer sx={{ justifyContent: "space-between", gap: 1, p: 1 }}>
      <GridToolbarQuickFilter sx={{ width: { xs: "100%", sm: "auto" } }} />
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <Button
          variant="text"
          size="small"
          startIcon={<PictureAsPdfIcon />}
          onClick={handleExportPDF}
          sx={{ color: "text.primary", textTransform: "none", minWidth: "auto", px: 1 }}
        >
          PDF
        </Button>
        <GridToolbarExport
          csvOptions={{
            fileName,
            utf8WithBom: true,
            allColumns: true,
          }}
          printOptions={{
            disableToolbarButton: true,
            allColumns: !printFields,
            fields: printFields,
            hideFooter: true,
            hideToolbar: true,
            pageStyle,
          }}
        />
      </div>
    </GridToolbarContainer>
  );
}

export const StandardTable = ({
  rows,
  columns,
  fileName = "export",
  printFields,
  pageStyle = defaultPageStyle,
  pageSize = 10,
  rowsPerPageOptions = [5, 10, 20],
  height = 540,
  showToolbar = true,
  checkboxSelection = false,
  disableRowSelectionOnClick = true,
  onSelectionModelChange,
  selectionModel,
}) => {
  const apiRef = useGridApiRef();

  return (
    <Paper sx={{ width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", height }}>
        <DataGrid
          apiRef={apiRef}
          rows={rows}
          columns={columns}
          pageSize={pageSize}
          rowsPerPageOptions={rowsPerPageOptions}
          disableColumnFilter={false}
          disableColumnSelector
          disableDensitySelector
          disableSelectionOnClick={disableRowSelectionOnClick}
          checkboxSelection={checkboxSelection}
          onSelectionModelChange={onSelectionModelChange}
          selectionModel={selectionModel}
          components={showToolbar ? { Toolbar: ExportToolbar } : {}}
          componentsProps={{
            toolbar: { fileName, printFields, pageStyle, rows, columns, apiRef },
          }}
          sx={{ border: 0 }}
        />
      </div>
    </Paper>
  );
};