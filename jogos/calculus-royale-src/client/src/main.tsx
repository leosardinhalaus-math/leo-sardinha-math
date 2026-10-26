import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import "./enhancements.css";
import "./royale-card.css";
import "./navigation-lite.css";
import "./world-arena.css";
import "./battle-preparation.css";
import "./combat-ui.css";
import "./special-items.css";
import "./accessibility.css";

createRoot(document.getElementById("root")!).render(<App />);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((error) => console.warn('Modo offline indisponível.', error));
  });
}
