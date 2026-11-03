import { lazy } from "react";

// Each page is its own chunk, loaded on first visit
export const HomePage = lazy(() => import("../pages/Home"));
export const NotFoundPage = lazy(() => import("../pages/NotFound"));
