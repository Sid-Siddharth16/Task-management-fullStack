import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HttpError } from "../../api/api.helper";
import { GuestRoute } from "../../routes/guards/GuestRoute";
import { makeAuth, makeUser, renderRoutes } from "../../test/auth.test-utils";
import LoginPage from ".";

const routes = [
  { element: <GuestRoute />, children: [{ path: "/login", element: <LoginPage /> }] },
  { path: "/dashboard", element: <p>dashboard page</p> },
];

const fill = (label: RegExp | string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe("LoginPage", () => {
  it("validates fields before calling the API", async () => {
    const auth = makeAuth();
    renderRoutes(routes, "/login", auth);

    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
    expect(auth.login).not.toHaveBeenCalled();
  });

  it("submits trimmed credentials", async () => {
    const auth = makeAuth({ login: vi.fn().mockResolvedValue(makeUser()) });
    renderRoutes(routes, "/login", auth);

    fill("Email", "  ada@example.com ");
    fill("Password", "Sup3rSecret!");
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() =>
      expect(auth.login).toHaveBeenCalledWith({
        email: "ada@example.com",
        password: "Sup3rSecret!",
      })
    );
  });

  it("shows the server error and clears the password", async () => {
    const auth = makeAuth({
      login: vi.fn().mockRejectedValue(new HttpError(401, "Invalid email or password")),
    });
    renderRoutes(routes, "/login", auth);

    fill("Email", "ada@example.com");
    fill("Password", "wrong-password1");
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password");
    expect(screen.getByLabelText("Password")).toHaveValue("");
  });

  it("explains an expired session", () => {
    renderRoutes(routes, "/login", makeAuth({ signOutReason: "expired" }));
    expect(screen.getByRole("status")).toHaveTextContent("Your session expired");
  });

  it("toggles password visibility", () => {
    renderRoutes(routes, "/login", makeAuth());
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(input).toHaveAttribute("type", "text");
  });
});
