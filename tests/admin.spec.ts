import { test, expect } from "@playwright/test";

test.describe("Admin Route Protection", () => {
  test("dashboard redirects unauthenticated users", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    // Should redirect away from dashboard
    expect(page.url()).not.toContain("/dashboard");
  });

  test("dashboard/products redirects unauthenticated users", async ({ page }) => {
    await page.goto("/dashboard/products");
    await page.waitForLoadState("networkidle");
    expect(page.url()).not.toContain("/dashboard");
  });

  test("dashboard/orders redirects unauthenticated users", async ({ page }) => {
    await page.goto("/dashboard/orders");
    await page.waitForLoadState("networkidle");
    expect(page.url()).not.toContain("/dashboard");
  });

  test("GET /api/admin/stats returns 401 for unauthenticated", async ({ request }) => {
    const res = await request.get("/api/admin/stats");
    expect(res.status()).toBe(401);
  });
});

test.describe("Admin Orders API", () => {
  test("GET /api/orders returns 401 without session", async ({ request }) => {
    const res = await request.get("/api/orders");
    expect(res.status()).toBe(401);
  });

  test("PATCH /api/orders/[id] returns 401 without session", async ({ request }) => {
    const res = await request.patch("/api/orders/000000000000000000000000", {
      data: { status: "shipped" },
    });
    expect([401, 404]).toContain(res.status());
  });
});
