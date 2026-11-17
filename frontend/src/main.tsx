import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { AuthProvider } from "./context/AuthProvider";
import { router } from "./routes";
import "./styles/global.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element #root not found");

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
