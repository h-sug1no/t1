import { Box, TextField } from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  GridToolbar,
  useGridApiRef,
} from "@mui/x-data-grid";
import type React from "react";
import { useState } from "react";

// 500個のサンプルデータを生成
const generateSampleData = () => {
  return Array.from({ length: 500 }, (_, id) => ({
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

const App: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState(generateSampleData());
  const apiRef = useGridApiRef();

  // テキスト検索のロジック
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchText(value);
    const filteredRows = generateSampleData().filter(
      (row) =>
        row.name.toLowerCase().includes(value) ||
        row.email.toLowerCase().includes(value),
    );
    setRows(filteredRows);
    console.log(apiRef);
  };

  return (
    <Box sx={{ height: 600, width: "100%" }}>
      <TextField
        label="Search"
        variant="outlined"
        size="small"
        fullWidth
        value={searchText}
        onChange={handleSearch}
        sx={{ marginBottom: 2 }}
      />
      {/* 
      For the Community Data Grid, pagination is enabled by 
      default and cannot be disabled.;-p 

      The Data Grid (MIT license) is limited to 
      pages of up to 100 rows. If you want larger pages, you will need to upgrade to Pro plan or above.

      By default, each page contains 100 rows. The user can change the 
      size of the page through the selector in the footer.
      */}
      <DataGrid
        rows={rows}
        columns={columns}
        apiRef={apiRef}
        checkboxSelection
        sx={{
          "& .MuiDataGrid-columnHeaders": {
            position: "sticky",
            top: 0,
            zIndex: 1,
            backgroundColor: "white",
          },
        }}
      />
    </Box>
  );
};

export default App;
