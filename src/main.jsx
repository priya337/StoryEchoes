import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter as Router } from "react-router-dom";
import { VoicesProviderWrapper } from "./contexts/voices.context.jsx";
import { StoriesProviderWrapper } from "./contexts/stories.context.jsx";
import { UserProviderWrapper } from "./contexts/user.context.jsx";
import { ToastProviderWrapper } from "./contexts/toast.context.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <UserProviderWrapper>
        <StoriesProviderWrapper>
          <VoicesProviderWrapper>
            <ToastProviderWrapper>
              <App />
            </ToastProviderWrapper>
          </VoicesProviderWrapper>
        </StoriesProviderWrapper>
      </UserProviderWrapper>
    </Router>
  </StrictMode>
);
