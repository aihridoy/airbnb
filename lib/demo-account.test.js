import { describe, it, expect } from "vitest";
import {
  maskEmail,
  maskName,
  redactUserForDemo,
  redactUsersForDemo,
  isDemoSession,
} from "./demo-account";

const demoAdmin = { user: { role: "admin", isDemo: true } };
const demoGuest = { user: { role: "user", isDemo: true } };
const realAdmin = { user: { role: "admin", isDemo: false } };

describe("maskEmail", () => {
  it("keeps the first character and the top-level domain", () => {
    expect(maskEmail("alice@gmail.com")).toBe("a••••@•••••.com");
  });

  it("hides the domain name itself", () => {
    expect(maskEmail("bob@staybnb-private.com")).not.toContain("staybnb-private");
  });

  it("handles a single-character local part", () => {
    expect(maskEmail("a@b.com")).toBe("a•@•.com");
  });

  it("handles a domain with no dot", () => {
    expect(maskEmail("dev@localhost")).toBe("d••@•••••••••");
  });

  it("degrades safely on malformed input", () => {
    expect(maskEmail("not-an-email")).toBe("•••••");
    expect(maskEmail("@nolocal.com")).toBe("•••••");
    expect(maskEmail(null)).toBe("•••••");
    expect(maskEmail(undefined)).toBe("•••••");
  });
});

describe("maskName", () => {
  it("reduces a full name to initials", () => {
    expect(maskName("Ada Lovelace")).toBe("A. L.");
  });

  it("handles a single name", () => {
    expect(maskName("Prince")).toBe("P.");
  });

  it("collapses extra whitespace", () => {
    expect(maskName("  Grace   Brewster  Hopper ")).toBe("G. B. H.");
  });

  it("falls back when there is no name", () => {
    expect(maskName("")).toBe("Guest");
    expect(maskName(null)).toBe("Guest");
  });
});

describe("isDemoSession", () => {
  it("is true for either demo account", () => {
    expect(isDemoSession(demoAdmin)).toBe(true);
    expect(isDemoSession(demoGuest)).toBe(true);
  });

  it("is false for a real account or no session", () => {
    expect(isDemoSession(realAdmin)).toBe(false);
    expect(isDemoSession({ user: {} })).toBe(false);
    expect(isDemoSession(null)).toBe(false);
  });

  it("is not fooled by a truthy non-boolean", () => {
    expect(isDemoSession({ user: { isDemo: "yes" } })).toBe(false);
  });
});

describe("redactUserForDemo", () => {
  it("masks name, email and location but keeps everything else", () => {
    const out = redactUserForDemo({
      _id: "abc",
      name: "Ada Lovelace",
      email: "ada@analytical.com",
      location: "Sylhet, Bangladesh",
      role: "user",
      createdAt: "2026-01-01",
    });

    expect(out.name).toBe("A. L.");
    expect(out.email).not.toContain("ada@analytical");
    expect(out.location).toBe("•••••");
    expect(out._id).toBe("abc");
    expect(out.role).toBe("user");
    expect(out.createdAt).toBe("2026-01-01");
  });

  it("does not invent a location field when the record has none", () => {
    const out = redactUserForDemo({ name: "Ada", email: "a@b.com" });
    expect("location" in out).toBe(false);
  });
});

describe("redactUsersForDemo", () => {
  const users = [
    { name: "Ada Lovelace", email: "ada@analytical.com", location: "London" },
    { name: "Alan Turing", email: "alan@bletchley.uk", location: "Wilmslow" },
  ];

  it("redacts every record for a demo session", () => {
    const out = redactUsersForDemo(users, demoAdmin);
    const serialised = JSON.stringify(out);
    expect(serialised).not.toContain("analytical.com");
    expect(serialised).not.toContain("bletchley");
    expect(serialised).not.toContain("London");
    expect(serialised).not.toContain("Wilmslow");
  });

  it("leaves records untouched for a real admin", () => {
    expect(redactUsersForDemo(users, realAdmin)).toEqual(users);
  });

  it("does not mutate the input", () => {
    const input = [{ name: "Ada Lovelace", email: "ada@analytical.com" }];
    redactUsersForDemo(input, demoAdmin);
    expect(input[0].email).toBe("ada@analytical.com");
  });

  it("handles an empty or missing list", () => {
    expect(redactUsersForDemo([], demoAdmin)).toEqual([]);
    expect(redactUsersForDemo(undefined, demoAdmin)).toEqual([]);
  });
});
