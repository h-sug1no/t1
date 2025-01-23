import styled from "@emotion/styled";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid2,
  Typography,
} from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  GridToolbar,
  gridFilteredSortedRowEntriesSelector,
  gridFilteredSortedRowIdsSelector,
  gridPageSizeSelector,
  useGridApiRef,
} from "@mui/x-data-grid";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MuiVirtualGrid } from "./MuiVirtualGrid";

// 500個のサンプルデータを生成
const generateSampleData = () => {
  return Array.from({ length: 5000 }, (_, id) => ({
    id,
    name: `Name ${id + 1}`,
    age: Math.floor(Math.random() * 50) + 20,
    email: `user${id + 1}@example.com`,
  }));
};

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "name", headerName: "Name", width: 150 },
  { field: "age", headerName: "Age", width: 100 },
  {
    field: "email",
    headerName: "Email",
    width: 200,
    renderCell: (params) => (
      <a href={`mailto:${params.value}`} style={{ color: "#1a73e8" }}>
        {params.value}
      </a>
    ),
  },
];

const TContainer = styled.div`
& .dg.vm-card {
  background-color: #eee;
  & .MuiDataGrid-footerContainer {
    display: none;
  }
}

& .tableContainer {
  width: calc(100vw - 200px);
  height: calc(100vh - 200px);
  position: relative;
  & .cardView {
    box-sizing: border-box;
    width: calc(100vw - 200px);
    height: calc(100vh - 200px);
    position: absolute;
    top: 100px;
    left: 0px;
    margin: 10px;
    margin-right: 0;

    .cardContainer {
      border-radius: 5px;
      border: solid gray 1px;
    }
    & .selected .cardContainer {
      background-color: #ddf;
    }
  }
}
`;

const App: React.FC = () => {
  const [rows /*, setRows*/] = useState(generateSampleData());
  const [viewMode, setViewMode] = useState("table");
  const [gdState, setGDState] = useState({});
  const apiRef = useGridApiRef();
  const gridRef = useRef(undefined);

  // @ts-ignore
  window.gdTest = () => {
    console.log(apiRef);
    // @ts-ignore
    window.gdApi = apiRef.current;

    console.log("gridPageSizeSelector", gridPageSizeSelector(apiRef));
    console.log(
      "gridFilteredSortedRowIdsSelector",
      gridFilteredSortedRowIdsSelector(apiRef),
    );
    console.log(
      "gridFilteredSortedRowEntriesSelector",
      gridFilteredSortedRowEntriesSelector(apiRef),
    );
  };

  const filteredData = useMemo(() => {
    return gdState && viewMode === "card"
      ? gridFilteredSortedRowEntriesSelector(apiRef)
      : [];
  }, [viewMode, apiRef, gdState]);

  // @ts-ignore
  const onStateUpdate = useCallback((param) => {
    setGDState(param);
  }, []);

  useEffect(() => {
    const { current } = apiRef;
    if (!current) {
      return;
    }
    switch (viewMode) {
      case "table": {
        current.setPageSize(100);
        break;
      }
      case "card":
        current.setPageSize(0);
        break;
      default:
        break;
    }
  }, [apiRef, viewMode]);

  return (
    <TContainer>
      <Box sx={{ height: 600, width: "100%" }}>
        <div style={{ marginBottom: "16px" }}>
          <Button
            variant={viewMode === "table" ? "contained" : "outlined"}
            onClick={() => setViewMode("table")}
          >
            Table View
          </Button>
          <Button
            variant={viewMode === "card" ? "contained" : "outlined"}
            onClick={() => setViewMode("card")}
            style={{ marginLeft: "8px" }}
          >
            Card View
          </Button>
        </div>

        {/* 
      For the Community Data Grid, pagination is enabled by 
      default and cannot be disabled.;-p 

      The Data Grid (MIT license) is limited to 
      pages of up to 100 rows. If you want larger pages, you will need to upgrade to Pro plan or above.

      By default, each page contains 100 rows. The user can change the 
      size of the page through the selector in the footer.
      */}
        <div className="tableContainer">
          <DataGrid
            className={`vm-${viewMode} dg`}
            rows={rows}
            columns={columns}
            apiRef={apiRef}
            disableDensitySelector
            disableColumnSelector
            disableMultipleRowSelection
            checkboxSelection
            onSortModelChange={onStateUpdate}
            onFilterModelChange={onStateUpdate}
            onRowSelectionModelChange={onStateUpdate}
            pageSizeOptions={[0, 10, 25, 100]}
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                position: "sticky",
                top: 0,
                zIndex: 1,
                backgroundColor: "white",
              },
            }}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                printOptions: { disableToolbarButton: true }, // disable export button
                csvOptions: { disableToolbarButton: true }, // disable export button
              },
            }}
          />
          {viewMode === "card" && (
            <Grid2
              className="cardView"
              container
              spacing={2}
              style={{ maxHeight: 400, overflowY: "auto" }}
            >
              <MuiVirtualGrid<(typeof filteredData)[0]>
                cardHeight={150}
                cardWidth={150}
                gutter={0}
                itemsData={filteredData}
                gridRef={gridRef}
                renderCard={({
                  data,
                  columnIndex,
                  columnCount,
                  rowIndex,
                  style,
                }) => {
                  const row = data[rowIndex * columnCount + columnIndex] as any;
                  if (row) {
                    const { model } = row;
                    return (
                      <div className="cardContainer" style={{ ...style }}>
                        <div>{row.id}</div>
                        <div>{model.name}</div>
                        <div>{model.email}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/*
              {filteredData.map(({ model: row }) => (
                <Grid2
                  key={row.id}
                  className={
                    apiRef.current?.isRowSelected(row.id) ? "selected" : ""
                  }
                  onClick={() => {
                    apiRef.current?.selectRow(
                      row.id,
                      !apiRef.current?.isRowSelected(row.id),
                      true,
                    );
                  }}
                >
                  <Card className="cardContainer">
                    <CardContent>
                      <Typography variant="h6">{row.id}</Typography>
                      <Typography variant="body2">{row.name}</Typography>
                      <Typography variant="body2">{row.email}</Typography>
                    </CardContent>
                  </Card>
                </Grid2>
              ))}
            */}
            </Grid2>
          )}
        </div>
      </Box>
    </TContainer>
  );
};

export default App;
