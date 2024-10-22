import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
ReactDOM.createRoot(document.getElementById("root")!).render(
  <>
    {/* this may invoke some React functions (reducer etc) twice to 
  detect the side effect problems in dev build. application must 
  work correctly even this mode is on. */}
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </>,
);
