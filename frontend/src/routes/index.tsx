import { createBrowserRouter } from "react-router";
import { ROUTES } from "../constants/route.constant";
import RootLayout from "../layouts/RootLayout";
import RouteErrorPage from "../pages/RouteError";
import { HomePage, NotFoundPage } from "./lazy.pages";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: ROUTES.HOME, element: <HomePage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
