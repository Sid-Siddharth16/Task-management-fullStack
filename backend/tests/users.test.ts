import { describe, expect, it } from "vitest";
import { UserModel } from "../src/models/user.model.js";
import { createClient, VALID_USER } from "./helpers/client.js";
import { useTestDatabase } from "./helpers/db.js";

useTestDatabase();

async function clientWithRole(
  role: "admin" | "manager" | "member",
  email: string
) {
  const client = createClient();
  const res = await client.post("/auth/signup", { ...VALID_USER, email });
  expect(res.status).toBe(201);
  if (role !== "member") await UserModel.updateOne({ email }, { role });
  return { client, id: res.body.data.user.id as string };
}

describe("role-based access to /users", () => {
  it("forbids members", async () => {
    const { client } = await clientWithRole("member", "member@example.com");
    const res = await client.get("/users");
    expect(res.status).toBe(403);
  });

  it("lets managers list users but not change roles", async () => {
    const { client } = await clientWithRole("manager", "manager@example.com");
    const { id } = await clientWithRole("member", "member@example.com");

    const list = await client.get("/users");
    expect(list.status).toBe(200);
    expect(list.body.data.pagination.total).toBe(2);
    expect(JSON.stringify(list.body)).not.toMatch(/password/i);

    expect(
      (await client.patch(`/users/${id}/role`, { role: "admin" })).status
    ).toBe(403);
  });

  it("lets admins change roles, applied on the next request", async () => {
    const { client: admin } = await clientWithRole(
      "admin",
      "admin@example.com"
    );
    const { client: member, id } = await clientWithRole(
      "member",
      "member@example.com"
    );

    expect((await member.get("/users")).status).toBe(403);
    const res = await admin.patch(`/users/${id}/role`, { role: "manager" });
    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe("manager");
    // no re-login needed: role is read from the DB on every request
    expect((await member.get("/users")).status).toBe(200);
  });

  it("rejects invalid roles, invalid ids and self-changes", async () => {
    const { client: admin, id: adminId } = await clientWithRole(
      "admin",
      "admin@example.com"
    );
    const { id } = await clientWithRole("member", "member@example.com");

    expect(
      (await admin.patch(`/users/${id}/role`, { role: "superuser" })).status
    ).toBe(400);
    expect(
      (await admin.patch(`/users/not-an-id/role`, { role: "manager" })).status
    ).toBe(400);
    expect(
      (await admin.patch(`/users/${adminId}/role`, { role: "member" })).status
    ).toBe(400);
  });

  it("deactivating a user signs them out everywhere", async () => {
    const { client: admin } = await clientWithRole(
      "admin",
      "admin@example.com"
    );
    const { client: member, id } = await clientWithRole(
      "member",
      "member@example.com"
    );

    expect(
      (await admin.patch(`/users/${id}/status`, { isActive: false })).status
    ).toBe(200);
    expect((await member.get("/auth/me")).status).toBe(401);
    expect((await member.post("/auth/refresh")).status).toBe(401);
  });

  it("escapes regex characters in search", async () => {
    const { client: admin } = await clientWithRole(
      "admin",
      "admin@example.com"
    );
    const res = await admin.get("/users?search=.*(");
    expect(res.status).toBe(200);
    expect(res.body.data.users).toHaveLength(0);
  });
});
