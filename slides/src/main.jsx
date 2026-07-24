import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Deck from "./deck/Deck.jsx";
import StaticDeck from "./deck/StaticDeck.jsx";
import LiveApp from "./live/LiveApp.jsx";
import HwpxChecker from "./hwpx/HwpxChecker.jsx";

const router = createBrowserRouter([
  { path: "/", element: <Deck /> },
  { path: "/slide", element: <StaticDeck /> },
  { path: "/live", element: <LiveApp /> },
  { path: "/hwpx", element: <HwpxChecker /> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
