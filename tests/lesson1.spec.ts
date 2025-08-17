import { test, expect } from "@playwright/test";
import Login from "../pages/login";
let loginPage: Login;
test.beforeEach(async ({ page }) => {
  loginPage = new Login(page);
  await loginPage.login("standard_user", "secret_sauce");
});

test("user can log in successfully using valid credentials", async ({
  page,
}) => {
  await expect(page.getByText("Products")).toBeVisible();
});

test("the product list contains exactly six items", async ({ page }) => {
  await expect(page.locator(".inventory_item")).toHaveCount(6);
});

test("each product in the list displays its price", async ({ page }) => {
  const prices = await page.locator(".inventory_item_price").allTextContents();
  prices.forEach((price) => {
    expect(price.trim()).toMatch(/^\$/);
  });
});

test("the product is successfully added to the cart", async ({ page }) => {
  await page.locator("#add-to-cart-sauce-labs-backpack").click();
  await expect(page.locator(".shopping_cart_badge")).toHaveText("1");
});
