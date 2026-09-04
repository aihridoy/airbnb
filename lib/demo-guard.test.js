import { describe, it, expect } from "vitest";
import { denyDemoWrite } from "./demo-guard";
import {
  DEMO_WRITE_BLOCKED,
  DEMO_CATALOGUE_BLOCKED,
  DEMO_REVIEW_BLOCKED,
} from "./demo-account";

const demoAdmin = { user: { role: "admin", isDemo: true } };
const demoGuest = { user: { role: "user", isDemo: true } };
const realGuest = { user: { role: "user", isDemo: false } };
const realAdmin = { user: { role: "admin", isDemo: false } };

const body = async (res) => JSON.parse(await res.text());

describe("denyDemoWrite", () => {
  it("lets real accounts through", () => {
    expect(denyDemoWrite(realGuest)).toBeNull();
    expect(denyDemoWrite(realAdmin)).toBeNull();
  });

  it("blocks the demo admin with 403", async () => {
    const res = denyDemoWrite(demoAdmin);
    expect(res.status).toBe(403);
    expect((await body(res)).message).toBe(DEMO_WRITE_BLOCKED);
  });

  it("blocks the demo guest with 403", () => {
    expect(denyDemoWrite(demoGuest).status).toBe(403);
  });

  it("carries the caller's message so the reason is specific", async () => {
    const catalogue = denyDemoWrite(demoGuest, DEMO_CATALOGUE_BLOCKED);
    const review = denyDemoWrite(demoGuest, DEMO_REVIEW_BLOCKED);
    expect((await body(catalogue)).message).toBe(DEMO_CATALOGUE_BLOCKED);
    expect((await body(review)).message).toBe(DEMO_REVIEW_BLOCKED);
  });

  it("marks the response as unsuccessful for clients that check the flag", async () => {
    expect((await body(denyDemoWrite(demoGuest))).success).toBe(false);
  });

  it("ignores a signed-out request, leaving auth to the caller", () => {
    expect(denyDemoWrite(null)).toBeNull();
    expect(denyDemoWrite(undefined)).toBeNull();
    expect(denyDemoWrite({})).toBeNull();
  });
});
