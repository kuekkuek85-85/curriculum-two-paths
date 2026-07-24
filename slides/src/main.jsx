import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Deck from "./deck/Deck.jsx";
import LiveApp from "./live/LiveApp.jsx";

const router = createBrowserRouter([
  { path: "/", element: <Deck /> },
  { path: "/live", element: <LiveApp /> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
