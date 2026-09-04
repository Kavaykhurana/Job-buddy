import { describe, expect, it } from "vitest";
import { hashPassword, issueAccessToken, verifyAccessToken, verifyPassword, type StoredUser } from "./auth";

const user: StoredUser = { id: "usr_test", email: "test@example.edu", displayName: "Test User", roles: ["STUDENT"], passwordHash: "" };

describe("authentication primitives", () => {
  it("hashes and verifies passwords without storing the plaintext", () => {
    const hash = hashPassword("correct-horse-123");
    expect(hash).not.toContain("correct-horse-123");
    expect(verifyPassword("correct-horse-123", hash)).toBe(true);
    expect(verifyPassword("wrong-password-123", hash)).toBe(false);
  });

  it("signs access tokens and rejects tampering", () => {
    const issued = issueAccessToken(user, "rfs_test");
    expect(verifyAccessToken(issued.token)?.sub).toBe("usr_test");
    const parts = issued.token.split(".");
    parts[1] = `${parts[1]}x`;
    expect(verifyAccessToken(parts.join("."))).toBeNull();
  });
});
