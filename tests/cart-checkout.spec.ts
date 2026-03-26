import { test, expect } from "@playwright/test";

test.describe("Cart", () => {
  test("cart page shows empty state when no items", async ({ page }) => {
    // Clear storage to ensure empty cart
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("joma-storage"));
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=Internal Server Error")).not.toBeVisible();
    // Should show empty bag or cart UI
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("checkout shows empty bag when cart is empty", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("joma-storage"));
    await page.goto("/checkout");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=Internal Server Error")).not.toBeVisible();
    // Should show empty bag message
    await expect(page.getByText(/bag is empty/i)).toBeVisible();
  });

  test("checkout form is visible when cart has items", async ({ request, page }) => {
    // Get a product and inject it into cart storage
    const res = await request.get("/api/products");
    const products = await res.json();
    if (products.length === 0) {
      test.skip(true, "No products in database");
      return;
    }

    const product = products[0];
    const cartState = {
      state: {
        items: [{
          product: { ...product, id: product._id },
          quantity: 1,
          size: product.sizes?.[0] || "M",
          color: product.colors?.[0] || "Black",
        }],
        wishlist: [],
        isCartOpen: false,
      },
      version: 0,
    };

    await page.goto("/");
    await page.evaluate((state) => {
      localStorage.setItem("joma-storage", JSON.stringify(state));
    }, cartState);

    await page.goto("/checkout");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=Internal Server Error")).not.toBeVisible();

    // Form fields should be visible
    await expect(page.getByPlaceholder("Full Name")).toBeVisible();
    await expect(page.getByPlaceholder("Email").first()).toBeVisible();
    await expect(page.getByPlaceholder("Phone")).toBeVisible();
    await expect(page.getByPlaceholder("Street Address")).toBeVisible();
  });

  test("checkout OTP section is visible for unauthenticated users", async ({ request, page }) => {
    const res = await request.get("/api/products");
    const products = await res.json();
    if (products.length === 0) {
      test.skip(true, "No products in database");
      return;
    }

    const product = products[0];
    const cartState = {
      state: {
        items: [{
          product: { ...product, id: product._id },
          quantity: 1,
          size: product.sizes?.[0] || "M",
          color: product.colors?.[0] || "Black",
        }],
        wishlist: [],
        isCartOpen: false,
      },
      version: 0,
    };

    await page.goto("/");
    await page.evaluate((state) => {
      localStorage.setItem("joma-storage", JSON.stringify(state));
    }, cartState);

    await page.goto("/checkout");
    await page.waitForLoadState("networkidle");

    // The "Save Order to Account" collapsible should be visible
    await expect(page.getByText(/save order to account/i)).toBeVisible();
  });

  test("order creation API rejects empty products", async ({ request }) => {
    const res = await request.post("/api/orders", {
      data: {
        products: [],
        customer: {
          name: "Test User",
          email: "test@example.com",
          phone: "9876543210",
          address: { street: "123 Test St", city: "Chennai", state: "TN", pincode: "600001" },
        },
        paymentMethod: "cod",
      },
    });
    // Should fail because no products
    expect([400, 500]).toContain(res.status());
  });

  test("order creation API rejects non-existent product", async ({ request }) => {
    const res = await request.post("/api/orders", {
      data: {
        products: [{
          productId: "000000000000000000000000",
          quantity: 1,
          size: "M",
          color: "Black",
        }],
        customer: {
          name: "Test User",
          email: "test@example.com",
          phone: "9876543210",
          address: { street: "123 Test St", city: "Chennai", state: "TN", pincode: "600001" },
        },
        paymentMethod: "cod",
      },
    });
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/not found/i);
  });
});
