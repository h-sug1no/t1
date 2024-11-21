// MuiApp.tsx
import { createContext, useContext, useState } from "react";

import {
  AppBar,
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
    <FormControl>
      <FormLabel id="theme-radio-buttons-group-label">Theme</FormLabel>
      <RadioGroup
        aria-labelledby="theme-radio-buttons-group-label"
        name="radio-buttons-group"
        value={selectedTheme === lightTheme ? "light" : "dark"}
        onChange={(e) => {
          const newTheme = e.target.value === "light" ? lightTheme : darkTheme;
          setSelectedTheme(newTheme);
        }}
      >
        <FormControlLabel value="light" control={<Radio />} label="Light" />
        <FormControlLabel value="dark" control={<Radio />} label="Dark" />
      </RadioGroup>
    </FormControl>
  );
};

// Main component
const InnerComponent = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  return (
    <>
      <ThemeSelection selectedTheme={theme} setSelectedTheme={setTheme} />
      <ThemeProvider theme={theme}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6">Theme Switcher Example</Typography>
          </Toolbar>
        </AppBar>
        <Button variant="contained" color="primary">
          Primary Button
        </Button>
        <TextField label="Text Field" variant="outlined" color="secondary" />
      </ThemeProvider>
    </>
  );
};

const MuiApp: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(lightTheme);
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <ThemeProvider theme={theme}>
        {/* Default theme */}
        <InnerComponent />
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default MuiApp;
