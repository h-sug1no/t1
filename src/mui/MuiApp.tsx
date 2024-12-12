// MuiApp.tsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import styled from "@emotion/styled";
import {
  AppBar,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { type Theme, ThemeProvider, createTheme } from "@mui/material/styles";
// biome-ignore lint/style/useImportType: <explanation>
import React from "react";
import { MuiKonvaTest } from "./MuiKonvaTest";
import CardDataGridWithFilters from "./MuiXDataGrid";
import MuiXDataGrid2 from "./MuiXDataGrid2";

//////////////////////////////////////////////////////////////

const BeatUITrack = styled.div`
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  border: solid 1px black;

  width: 400px;
  height: 100px;

  & .barContainer {
    box-sizing: content-box;
    height: 100%;
    width: 100%;
    display: flex;
    & .bar {
      box-sizing: border-box;
      height: 100%;
      width: 25%;
      &:nth-of-type(1), &:nth-of-type(3) {
        background-color: #ddeeee;
      }
      &:nth-of-type(2), &:nth-of-type(4) {
        background-color: #eeeedd;
      }
    }
  }
  & .markerContainer {
    box-sizing:content-box;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    background-color: rgba(100,10,10,0.2);
    & .marker {
      box-sizing: content-box;
      width: 4px;
      position: absolute;
      top: 0;
      height: 100%;
      background-color: black;
    }
  }

  margin-bottom: 100%;
  & .konvaStageContainer {
    width: 100%;
    height: 100%;
    background-color: pink;
  }
`;

const BeatUI = () => {
  const [count, setRepaintCount] = useState(0);
  useEffect(() => {
    let requestId: number;
    const draw = () => {
      setRepaintCount((v) => v + 1);
      requestId = requestAnimationFrame(draw);
    };

    requestId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(requestId);
    };
  }, []);

  const marker = useMemo(() => {
    const beat = 30 * 20;
    return (
      <div
        className="marker"
        style={{
          left: `calc(${((count % beat) / beat) * 100}% - 2px)`,
        }}
      />
    );
  }, [count]);

  return (
    <BeatUITrack className="track">
      <div className="barContainer">
        <div className="bar" />
        <div className="bar" />
        <div className="bar" />
        <div className="bar" />
      </div>
      <div className="markerContainer">{marker}</div>
      <MuiKonvaTest />
    </BeatUITrack>
  );
};

//////////////////////////////////////////////////////////////

// Define two custom MUI themes
const lightTheme: Theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#007bff",
    },
    secondary: {
      main: "#6c757d",
    },
  },
});

const darkTheme: Theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#6c757d",
    },
    secondary: {
      main: "#007bff",
    },
  },
});

// Create a theme context
const ThemeContext = createContext<{
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}>({ theme: lightTheme, setTheme: () => {} });

// Theme selection component
const ThemeSelection = ({
  selectedTheme,
  setSelectedTheme,
}: {
  selectedTheme: Theme;
  setSelectedTheme: React.Dispatch<React.SetStateAction<Theme>>;
}) => {
  return (
    <>
      <a
        target="mui-theme-creator"
        href="https://zenoo.github.io/mui-theme-creator/"
      >
        mui-theme-creator
      </a>
      <FormControl sx={{ display: "flex", flexDirection: "row" }}>
        <FormLabel id="theme-radio-buttons-group-label">Theme</FormLabel>
        <RadioGroup
          aria-labelledby="theme-radio-buttons-group-label"
          name="radio-buttons-group"
          value={selectedTheme === lightTheme ? "light" : "dark"}
          onChange={(e) => {
            const newTheme =
              e.target.value === "light" ? lightTheme : darkTheme;
            setSelectedTheme(newTheme);
          }}
        >
          <FormControlLabel value="light" control={<Radio />} label="Light" />
          <FormControlLabel value="dark" control={<Radio />} label="Dark" />
        </RadioGroup>
      </FormControl>
    </>
  );
};

// Main component
const InnerComponent = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  return (
    <Box sx={{ backgroundColor: "lightgray" }}>
      <ThemeSelection selectedTheme={theme} setSelectedTheme={setTheme} />
      <BeatUI />
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            backgroundColor: (theme) => theme.palette.background.default,
          }}
        >
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6">Theme Switcher Example</Typography>
            </Toolbar>
          </AppBar>
          <Button variant="contained" color="primary">
            Primary Button
          </Button>
          <TextField label="Text Field" variant="outlined" color="secondary" />
        </Box>
      </ThemeProvider>
    </Box>
  );
};

const MuiApp: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(lightTheme);
  return (
    <>
      <div>
        <MuiXDataGrid2 />
      </div>
      <div style={{ marginTop: "200px" }}>
        <CardDataGridWithFilters />
      </div>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <ThemeProvider theme={theme}>
          {/* Default theme */}
          <InnerComponent />
        </ThemeProvider>
      </ThemeContext.Provider>
    </>
  );
};

export default MuiApp;
