import React from "react";
import { createRoot } from 'react-dom/client';
import App from "./app.js";

import "./utils/constants";

// Render your React component instead
const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
