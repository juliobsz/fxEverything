import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@fontsource-variable/geist/wght.css";
import { uiLanguage } from "../shared/i18n";
import { App } from "./App";
import "./main.css";

document.documentElement.lang = uiLanguage();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
