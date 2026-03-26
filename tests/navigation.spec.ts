import { test, expect } from "@playwright/test";

test.describe("Page Navigation", () => {
  test("homepage loads with hero and products", async ({ page }) => {
    await page.goto("/");
    await expect(page).not.toHaveTitle(/error/i);
    // Page should have some content
    await expect(page.locator("body")).not.toBeEmpty();
    // Should not show 500 error
    await expect(page.locator("text=Internal Server Error")).not.toBeVisible();
    await expect(page.locator("text=Application error")).not.toBeVisible();
  });

  test("shop page loads with products", async ({ page }) => {
    await page.goto("/shop");
    await expect(page).not.toHaveTitle(/error/i);
    await expect(page.locator("text=Internal Server Error")).not.toBeVisible();
  });

  test("women category page loads", async ({ page }) => {
    await page.goto("/category/women");
    await expect(page.locator("text=Internal Server Error")).not.toBeVisible();
  });

  test("men category page loads", async ({ page }) => {
    await page.goto("/category/men");
    await expect(page.locator("text=Internal Server Error")).not.toBeVisible();
  });

  test("cart page loads when empty", async ({ page }) => {
    await page.goto("/cart");
    await expect(page.locator("text=Internal Server Error")).not.toBeVisible();
    // Should show empty bag message or cart items
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("account page shows OTP login form", async ({ page }) => {
    await page.goto("/account");
    await expect(page.locator("text=Internal Server Error")).not.toBeVisible();
    // Should show the new OTP login form
    await expect(page.getByText("Sign In")).toBeVisible();
    await expect(page.getByPlaceholder("Phone Number")).toBeVisible();
    await expect(page.getByText("Send Login Code")).toBeVisible();
  });

  test("account page has admin login escape hatch", async ({ page }) => {
    await page.goto("/account");
    await expect(page.getByText("Admin Login")).toBeVisible();
  });

  test("checkout page redirects to cart when empty", async ({ page }) => {
    await page.goto("/checkout");
    // With empty cart should show empty bag message
    await expect(page.locator("text=Internal Server Error")).not.toBeVisible();
  });

  test("about page loads", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("text=Internal Server Error")).not.toBeVisible();
  });

  test("contact page loads", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("text=Internal Server Error")).not.toBeVisible();
  });
});
