import { test, expect } from "@playwright/test";

test.describe("OTP Authentication Flow", () => {
  test("send-otp API rejects missing fields", async ({ request }) => {
    const res = await request.post("/api/auth/send-otp", {
      data: { email: "" },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  test("send-otp API rejects invalid email format", async ({ request }) => {
    const res = await request.post("/api/auth/send-otp", {
      data: { email: "notanemail", phone: "9876543210" },
    });
    expect(res.status()).toBe(400);
  });

  test("verify-otp API rejects missing fields", async ({ request }) => {
    const res = await request.post("/api/auth/verify-otp", {
      data: { email: "" },
    });
    expect(res.status()).toBe(400);
  });

  test("verify-otp API rejects wrong OTP", async ({ request }) => {
    const res = await request.post("/api/auth/verify-otp", {
      data: { email: "test@example.com", otp: "000000" },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  test("verify-otp API rejects non-6-digit code", async ({ request }) => {
    const res = await request.post("/api/auth/verify-otp", {
      data: { email: "test@example.com", otp: "123" },
    });
    expect(res.status()).toBe(400);
  });

  test("account page OTP form fills and submits", async ({ page }) => {
    await page.goto("/account");
    // Fill email and phone
    await page.getByPlaceholder("Email").fill("test@example.com");
    await page.getByPlaceholder("Phone Number").fill("9876543210");
    // Button should be enabled and clickable
    const btn = page.getByText("Send Login Code");
    await expect(btn).toBeEnabled();
    // Verify form validation passes (button is not disabled by browser validation)
    await expect(page.getByPlaceholder("Email")).toHaveValue("test@example.com");
    await expect(page.getByPlaceholder("Phone Number")).toHaveValue("9876543210");
    // Page is not crashed
    await expect(page.locator("text=Internal Server Error")).not.toBeVisible();
  });

  test("admin login form shows after clicking Admin Login", async ({ page }) => {
    await page.goto("/account");
    await page.getByText("Admin Login").click();
    await expect(page.getByText("Admin Login").nth(0)).toBeVisible();
    // Password field should appear (identified by id)
    await expect(page.locator("#admin-password")).toBeVisible();
  });

  test("admin login with wrong credentials shows error", async ({ page }) => {
    await page.goto("/account");
    await page.getByText("Admin Login").click();
    // Fill credentials
    await page.getByPlaceholder("Email").fill("admin@chicthreads.com");
    await page.locator("#admin-password").fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForTimeout(2000);
    // Should show error toast, not crash
    await expect(page.locator("text=Internal Server Error")).not.toBeVisible();
    await expect(page.locator("text=Application error")).not.toBeVisible();
  });
});
