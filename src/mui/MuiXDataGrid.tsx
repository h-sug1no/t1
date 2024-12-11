import { AgGridReact } from "ag-grid-react";
// 必要なモジュールをインポート
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import type { ColDef, GridApi, GridReadyEvent } from "ag-grid-community";

type IRow = {
  id: number;
  col1: string;
  col2: string;
};
const rows: Array<IRow> = [];
for (let i = 0; i < 400; i += 1) {
  rows.push({ id: i, col1: `Row ${i}`, col2: `Data ${i}` });
}

const App = () => {
  const [rowData] = useState<Array<IRow>>(rows);

  const [columnDefs] = useState<ColDef<IRow>[]>([
    { field: "col1", sortable: true, filter: true, headerName: "Column 1" },
    { field: "col2", sortable: true, filter: true, headerName: "Column 2" },
  ]);

  const [viewMode, setViewMode] = useState("table");

  const gridApiRef = useRef<GridApi<IRow>>(null);
  //const gridColumnApiRef = useRef(null);

  const [filteredData, setFilteredData] = useState(rowData);
  const [searchText, setSearchText] = useState("");

  const resolveFilteredData = useCallback(() => {
    if (gridApiRef.current) {
      const allData: Array<IRow> = [];
      gridApiRef.current.forEachNodeAfterFilterAndSort((node) => {
        let ret = allData.length;
        if (node.data) {
          ret = allData.push(node.data);
        }
        return ret;
      });
      setFilteredData(allData);
    }
  }, []);

  useEffect(() => {
    resolveFilteredData();
  }, [
    resolveFilteredData,
    /*viewMode, rowData*/
  ]);

  const handleGridReady = (params: GridReadyEvent<IRow>) => {
    // @ts-ignore
    gridApiRef.current = params.api;
    // gridColumnApiRef.current = params.columnApi;
  };

  // フィルタとソートの状態更新
  const handleStateChange = () => {
    resolveFilteredData();
  };

  /*
  useEffect(() => {
    if (gridApiRef.current) {
      gridApiRef.current.setFilterModel(filterModel.current);
      gridApiRef.current.setSortModel(sortModel.current);
    }
  }, [viewMode]); // ビューモードが変更されたときのみ適用
*/
  // フリーテキスト検索フィルタ
  const handleSearchChange = (event: ChangeEvent) => {
    const value = (event.target as HTMLInputElement).value;
    setSearchText(value);
    if (gridApiRef.current) {
      gridApiRef.current.setGridOption("quickFilterText", value);
    }
  };

  // フィルタ設定ツールチップ用の状態を取得
  const getFilterState = () => {
    if (gridApiRef.current) {
      const filterState = gridApiRef.current.getFilterModel();
      const filterInfo = JSON.stringify(filterState);
      return filterInfo || "No filters applied";
    }
    return "No filters applied";
  };

  return (
    <div style={{ margin: "16px" }}>
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

      {/* フリーテキスト検索フィルタ */}
      <TextField
        label="Search"
        variant="outlined"
        value={searchText}
        onChange={handleSearchChange}
        style={{ marginBottom: "16px", width: "100%" }}
      />

      {/* フィルタ設定ツールチップ */}
      <Tooltip title={getFilterState()}>
        <Button variant="outlined" style={{ marginBottom: "16px" }}>
          Filter Settings
        </Button>
      </Tooltip>

      {/* ag-Gridは常に表示 */}
      <div
        className="ag-theme-alpine"
        style={{
          height: viewMode === "card" ? 50 : 400, // "card"ビューの場合、テーブルのボディ高さを0に設定
          width: "100%",
          overflow: "hidden",
        }}
      >
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          onGridReady={handleGridReady}
          onFilterChanged={handleStateChange}
          onSortChanged={handleStateChange}
          domLayout="autoHeight"
        />
      </div>

      {/* "card"ビューの表示 */}
      {viewMode === "card" && (
        <Grid
          container
          spacing={2}
          style={{ maxHeight: 400, overflowY: "auto" }}
        >
          {filteredData.map((row) => (
            <Grid item xs={12} sm={6} md={4} key={row.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{row.col1}</Typography>
                  <Typography variant="body2">{row.col2}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
};

export default App;
