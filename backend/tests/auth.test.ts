import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { API_PREFIX } from "../src/constants.js";
import { SessionModel } from "../src/models/session.model.js";
import { UserModel } from "../src/models/user.model.js";
import { mailer } from "../src/services/mail.service.js";
import { sha256 } from "../src/utils/tokens.js";
import { createClient, parseSetCookies, VALID_USER } from "./helpers/client.js";
import { useTestDatabase } from "./helpers/db.js";

useTestDatabase();

async function signupClient(overrides: Partial<typeof VALID_USER> = {}) {
  const client = createClient();
  const res = await client.post("/auth/signup", {
    ...VALID_USER,
    ...overrides,
  });
  expect(res.status).toBe(201);
  return { client, res, cookies: parseSetCookies(res.headers["set-cookie"]) };
}

describe("POST /auth/signup", () => {
  it("creates a member, sets secure httpOnly cookies and never returns the password", async () => {
    const { res, cookies } = await signupClient();

    expect(res.body.data.user).toMatchObject({
      name: VALID_USER.name,
      email: VALID_USER.email,
      role: "member",
      isActive: true,
    });
    expect(res.body.data.user.id).toBeDefined();
    expect(JSON.stringify(res.body)).not.toMatch(/password|Sup3rSecret/i);
    expect(res.headers["cache-control"]).toBe("no-store");

    expect(cookies.access_token.attributes).toEqual(
      expect.arrayContaining(["httponly", "samesite=strict", "path=/api"])
    );
    expect(cookies.refresh_token.attributes).toEqual(
      expect.arrayContaining([
        "httponly",
        "samesite=strict",
        "path=/api/v1/auth",
      ])
    );

    const stored = await UserModel.findOne({ email: VALID_USER.email }).select(
      "+password"
    );
    expect(stored!.password).toMatch(/^\$argon2id\$/);
  });

  it("normalises email to lowercase", async () => {
    const { res } = await signupClient({ email: "  ADA@Example.COM " });
    expect(res.body.data.user.email).toBe("ada@example.com");
  });

  it("rejects a duplicate email with 409", async () => {
    await signupClient();
    const res = await createClient().post("/auth/signup", VALID_USER);
    expect(res.status).toBe(409);
    expect(res.body.errors[0].field).toBe("email");
  });

  it("rejects a role in the body (no mass assignment)", async () => {
    const res = await createClient().post("/auth/signup", {
      ...VALID_USER,
      role: "admin",
    });
    expect(res.status).toBe(400);
    expect(await UserModel.countDocuments()).toBe(0);
  });

  it.each([
    ["short", "Ab1"],
    ["no number", "abcdefghij"],
    ["no letter", "1234567890"],
    ["too long", `a1${"x".repeat(200)}`],
  ])("rejects a weak password (%s)", async (_label, password) => {
    const res = await createClient().post("/auth/signup", {
      ...VALID_USER,
      password,
    });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe("password");
  });

  it("rejects NoSQL-injection style payloads", async () => {
    const res = await createClient().post("/auth/login", {
      email: { $gt: "" },
      password: { $gt: "" },
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 (not 500) for malformed JSON", async () => {
    const res = await request(app)
      .post(`${API_PREFIX}/auth/login`)
      .set("Content-Type", "application/json")
      .send('{"email": ');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Malformed JSON in request body");
  });
});

describe("POST /auth/login", () => {
  it("signs in with valid credentials", async () => {
    await signupClient();
    const client = createClient();
    const res = await client.post("/auth/login", {
      email: VALID_USER.email,
      password: VALID_USER.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(VALID_USER.email);
    expect(
      parseSetCookies(res.headers["set-cookie"]).access_token
    ).toBeDefined();
    expect((await client.get("/auth/me")).status).toBe(200);
  });

  it("returns the same generic 401 for a wrong password and an unknown email", async () => {
    await signupClient();
    const wrongPassword = await createClient().post("/auth/login", {
      email: VALID_USER.email,
      password: "WrongPass123",
    });
    const unknownEmail = await createClient().post("/auth/login", {
      email: "nobody@example.com",
      password: "WrongPass123",
    });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body.message).toBe("Invalid email or password");
    expect(unknownEmail.body.message).toBe(wrongPassword.body.message);
  });

  it("rejects a deactivated account", async () => {
    await signupClient();
    await UserModel.updateOne({ email: VALID_USER.email }, { isActive: false });
    const res = await createClient().post("/auth/login", {
      email: VALID_USER.email,
      password: VALID_USER.password,
    });
    expect(res.status).toBe(401);
  });

  it("rate limits repeated failed attempts", async () => {
    const client = createClient();
    const attempt = () =>
      client.post("/auth/login", {
        email: "x@example.com",
        password: "WrongPass123",
      });

    for (let i = 0; i < 10; i++) expect((await attempt()).status).toBe(401);
    const blocked = await attempt();
    expect(blocked.status).toBe(429);
  });
});

describe("GET /auth/me", () => {
  it("requires authentication", async () => {
    const res = await createClient().get("/auth/me");
    expect(res.status).toBe(401);
  });

  it("rejects a tampered or foreign-signed token", async () => {
    const { cookies } = await signupClient();
    const [header, payload] = cookies.access_token.value.split(".");
    const forged = `${header}.${payload}.invalidsignature`;
    const unsigned = `${Buffer.from('{"alg":"none","typ":"JWT"}').toString("base64url")}.${payload}.`;

    for (const token of [forged, unsigned]) {
      const res = await request(app)
        .get(`${API_PREFIX}/auth/me`)
        .set("Cookie", `access_token=${token}`);
      expect(res.status).toBe(401);
    }
  });

  it("stops accepting the token once the user is deactivated", async () => {
    const { client } = await signupClient();
    await UserModel.updateOne({ email: VALID_USER.email }, { isActive: false });
    expect((await client.get("/auth/me")).status).toBe(401);
  });
});

describe("POST /auth/refresh", () => {
  it("rotates the refresh token", async () => {
    const { client, cookies } = await signupClient();
    const res = await client.post("/auth/refresh");
    const rotated = parseSetCookies(res.headers["set-cookie"]);

    expect(res.status).toBe(200);
    expect(rotated.refresh_token.value).not.toBe(cookies.refresh_token.value);
    const old = await SessionModel.findOne({
      tokenHash: sha256(cookies.refresh_token.value),
    });
    expect(old!.revokedAt).not.toBeNull();
    expect(old!.replacedBy).not.toBeNull();
  });

  it("detects reuse of a rotated token and revokes the whole session family", async () => {
    const { client, cookies } = await signupClient();
    const oldToken = cookies.refresh_token.value;
    await client.post("/auth/refresh");

    // move the rotation outside the concurrent-refresh grace window
    await SessionModel.updateOne(
      { tokenHash: sha256(oldToken) },
      { revokedAt: new Date(Date.now() - 60_000) }
    );

    const replay = await request(app)
      .post(`${API_PREFIX}/auth/refresh`)
      .set("Cookie", `refresh_token=${oldToken}`);
    expect(replay.status).toBe(401);

    // the legitimate (newest) token is now dead as well
    expect((await client.post("/auth/refresh")).status).toBe(401);
    expect(await SessionModel.countDocuments({ revokedAt: null })).toBe(0);
  });

  it("tolerates a concurrent refresh with the same token (multiple tabs)", async () => {
    const { cookies } = await signupClient();
    const token = cookies.refresh_token.value;
    const send = () =>
      request(app)
        .post(`${API_PREFIX}/auth/refresh`)
        .set("Cookie", `refresh_token=${token}`);

    const [first, second] = await Promise.all([send(), send()]);
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
  });

  it("returns 401 and clears cookies without a refresh token", async () => {
    const res = await createClient().post("/auth/refresh");
    expect(res.status).toBe(401);
    expect(parseSetCookies(res.headers["set-cookie"]).refresh_token.value).toBe(
      ""
    );
  });
});

describe("POST /auth/logout", () => {
  it("revokes the session so its refresh token can't be used again", async () => {
    const { client, cookies } = await signupClient();
    const res = await client.post("/auth/logout");
    expect(res.status).toBe(200);

    const replay = await request(app)
      .post(`${API_PREFIX}/auth/refresh`)
      .set("Cookie", `refresh_token=${cookies.refresh_token.value}`);
    expect(replay.status).toBe(401);
  });
});

describe("password reset", () => {
  const captureResetToken = () => {
    const spy = vi.spyOn(mailer, "send").mockResolvedValue();
    return {
      spy,
      token: () => {
        const text = spy.mock.calls.at(-1)?.[0].text ?? "";
        return new URL(text.match(/https?:\/\/\S+/)![0]).searchParams.get(
          "token"
        )!;
      },
    };
  };

  it("responds identically for known and unknown emails", async () => {
    await signupClient();
    const { spy } = captureResetToken();

    const known = await createClient().post("/auth/forgot-password", {
      email: VALID_USER.email,
    });
    const unknown = await createClient().post("/auth/forgot-password", {
      email: "nobody@example.com",
    });

    expect(known.status).toBe(200);
    expect(unknown.status).toBe(200);
    expect(known.body.message).toBe(unknown.body.message);
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it("resets the password once, revokes old sessions and old access tokens", async () => {
    const { client } = await signupClient();
    const mail = captureResetToken();
    await createClient().post("/auth/forgot-password", {
      email: VALID_USER.email,
    });
    const token = mail.token();

    // only the hash is stored
    const stored = await UserModel.findOne({ email: VALID_USER.email }).select(
      "+passwordResetTokenHash"
    );
    expect(stored!.passwordResetTokenHash).toBe(sha256(token));

    // wait a second so the new passwordChangedAt is strictly after the old token's iat
    await new Promise((r) => setTimeout(r, 1100));

    const reset = await createClient().post("/auth/reset-password", {
      token,
      password: "BrandNew123",
    });
    expect(reset.status).toBe(200);

    // old session (access + refresh) is dead
    expect((await client.get("/auth/me")).status).toBe(401);
    expect((await client.post("/auth/refresh")).status).toBe(401);

    // token is single-use
    const again = await createClient().post("/auth/reset-password", {
      token,
      password: "Another123",
    });
    expect(again.status).toBe(400);

    // new password works, old one doesn't
    const login = (password: string) =>
      createClient().post("/auth/login", { email: VALID_USER.email, password });
    expect((await login("BrandNew123")).status).toBe(200);
    expect((await login(VALID_USER.password)).status).toBe(401);
    mail.spy.mockRestore();
  });

  it("rejects an expired reset token", async () => {
    await signupClient();
    const mail = captureResetToken();
    await createClient().post("/auth/forgot-password", {
      email: VALID_USER.email,
    });
    await UserModel.updateOne(
      { email: VALID_USER.email },
      { passwordResetExpires: new Date(Date.now() - 1000) }
    );

    const res = await createClient().post("/auth/reset-password", {
      token: mail.token(),
      password: "BrandNew123",
    });
    expect(res.status).toBe(400);
    mail.spy.mockRestore();
  });
});

describe("CSRF origin check", () => {
  it("rejects state-changing requests from a foreign origin", async () => {
    const res = await request(app)
      .post(`${API_PREFIX}/auth/login`)
      .set("Origin", "https://evil.example.com")
      .send({ email: VALID_USER.email, password: VALID_USER.password });
    expect(res.status).toBe(403);
  });

  it("allows the configured origin", async () => {
    await signupClient();
    const res = await createClient()
      .post("/auth/login", {
        email: VALID_USER.email,
        password: VALID_USER.password,
      })
      .set("Origin", "http://localhost:5173");
    expect(res.status).toBe(200);
  });
});
