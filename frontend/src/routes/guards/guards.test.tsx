import { screen } from "@testing-library/react";
import { useLocation } from "react-router";
import { describe, expect, it } from "vitest";
import { makeAuth, makeUser, renderRoutes } from "../../test/auth.test-utils";
import { GuestRoute } from "./GuestRoute";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";

function LoginProbe() {
  const location = useLocation();
  return <p>login page {location.search}</p>;
}

const routes = [
  { path: "/login", element: <GuestRoute />, children: [{ index: true, element: <LoginProbe /> }] },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/dashboard", element: <p>dashboard page</p> },
      {
        element: <RoleRoute allow={["admin"]} />,
        children: [{ path: "/admin", element: <p>admin page</p> }],
      },
    ],
  },
];

describe("ProtectedRoute", () => {
  it("shows a spinner while the session is being checked", () => {
    renderRoutes(routes, "/dashboard", makeAuth({ status: "loading" }));
    expect(screen.getByRole("status")).toHaveTextContent("Checking your session");
  });

  it("redirects signed-out users to login and remembers where they were going", async () => {
    renderRoutes(routes, "/dashboard?tab=1", makeAuth());
    expect(await screen.findByText(/login page/)).toHaveTextContent(
      `?redirect=${encodeURIComponent("/dashboard?tab=1")}`
    );
  });

  it("does not add a redirect after an explicit logout", async () => {
    renderRoutes(routes, "/dashboard", makeAuth({ signOutReason: "logout" }));
    expect(await screen.findByText(/login page/)).not.toHaveTextContent("redirect");
  });

  it("renders the page for signed-in users", () => {
    renderRoutes(routes, "/dashboard", makeAuth({ user: makeUser() }));
    expect(screen.getByText("dashboard page")).toBeInTheDocument();
  });
});

describe("RoleRoute", () => {
  it("shows 403 to a member", () => {
    renderRoutes(routes, "/admin", makeAuth({ user: makeUser({ role: "member" }) }));
    expect(screen.getByText("403")).toBeInTheDocument();
    expect(screen.queryByText("admin page")).not.toBeInTheDocument();
  });

  it("lets an admin through", () => {
    renderRoutes(routes, "/admin", makeAuth({ user: makeUser({ role: "admin" }) }));
    expect(screen.getByText("admin page")).toBeInTheDocument();
  });
});

describe("GuestRoute", () => {
  it("sends signed-in users to the safe redirect target", async () => {
    renderRoutes(routes, "/login?redirect=/admin", makeAuth({ user: makeUser({ role: "admin" }) }));
    expect(await screen.findByText("admin page")).toBeInTheDocument();
  });

  it("ignores an external redirect target", async () => {
    renderRoutes(
      routes,
      `/login?redirect=${encodeURIComponent("//evil.com")}`,
      makeAuth({ user: makeUser() })
    );
    expect(await screen.findByText("dashboard page")).toBeInTheDocument();
  });
});
