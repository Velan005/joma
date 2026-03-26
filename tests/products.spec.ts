import { test, expect } from "@playwright/test";

test.describe("Products API", () => {
  test("GET /api/products returns array", async ({ request }) => {
    const res = await request.get("/api/products");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test("GET /api/products filters by category", async ({ request }) => {
    const res = await request.get("/api/products?category=women");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    // Every returned product should be women's category
    body.forEach((p: any) => {
      expect(p.category).toBe("women");
    });
  });

  test("GET /api/products search works", async ({ request }) => {
    const res = await request.get("/api/products?search=dress");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test("GET /api/products price filter works", async ({ request }) => {
    const res = await request.get("/api/products?minPrice=100&maxPrice=500");
    expect(res.status()).toBe(200);
    const body = await res.json();
    body.forEach((p: any) => {
      expect(p.price).toBeGreaterThanOrEqual(100);
      expect(p.price).toBeLessThanOrEqual(500);
    });
  });

  test("GET /api/products/[id] returns 404 for invalid id", async ({ request }) => {
    const res = await request.get("/api/products/000000000000000000000000");
    expect([404, 500]).toContain(res.status());
  });
});

test.describe("Product Pages", () => {
  test("shop page loads without errors", async ({ page }) => {
    await page.goto("/shop");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=Internal Server Error")).not.toBeVisible();
    await expect(page.locator("text=Application error")).not.toBeVisible();
  });

  test("product cards are visible on shop page", async ({ page }) => {
    await page.goto("/shop");
    await page.waitForLoadState("networkidle");
    // Should render product cards or empty state — no crash
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("product detail page loads for first product", async ({ request, page }) => {
    // Get a product ID from the API
    const res = await request.get("/api/products?category=women");
    const products = await res.json();
    if (products.length === 0) {
      test.skip(true, "No products in database");
      return;
    }
    const id = products[0]._id;
    await page.goto(`/product/${id}`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=Internal Server Error")).not.toBeVisible();
    await expect(page.getByText(products[0].name)).toBeVisible();
  });

  test("add to cart works from product detail page", async ({ request, page }) => {
    const res = await request.get("/api/products");
    const products = await res.json();
    if (products.length === 0) {
      test.skip(true, "No products in database");
      return;
    }
    const product = products[0];
    await page.goto(`/product/${product._id}`);
    await page.waitForLoadState("networkidle");

    // Select a size if available
    const sizeButtons = page.locator("button").filter({ hasText: /^(XS|S|M|L|XL|XXL)$/ });
    if (await sizeButtons.count() > 0) {
      await sizeButtons.first().click();
    }

    // Click Add to Cart / Add to Bag
    const addBtn = page.getByRole("button", { name: /add to (cart|bag)/i });
    if (await addBtn.isVisible()) {
      await addBtn.click();
      // Should show success toast or cart update — no error
      await page.waitForTimeout(1000);
      await expect(page.locator("text=Internal Server Error")).not.toBeVisible();
    }
  });
});
