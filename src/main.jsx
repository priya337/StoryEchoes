import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter as Router } from "react-router-dom";
import { VoicesProviderWrapper } from "./contexts/voices.context.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <VoicesProviderWrapper>
        <App />
      </VoicesProviderWrapper>
    </Router>
  </StrictMode>
);
