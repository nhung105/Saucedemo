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

test("The item should display correct correct price value", async ({
  page,
}) => {
  const products = [
    { name: "Sauce Labs Backpack", price: "$29.99" },
    { name: "Sauce Labs Bike Light", price: "$9.99" },
    { name: "Sauce Labs Bolt T-Shirt", price: "$15.99" },
    { name: "Sauce Labs Fleece Jacket", price: "$49.99" },
    { name: "Sauce Labs Onesie", price: "$7.99" },
    { name: "Test.allTheThings() T-Shirt (Red)", price: "$15.99" },
  ];
  for (const { name, price } of products) {
    const actualPrices = await page
      .locator(".inventory_item")
      .filter({ hasText: name })
      .locator(".inventory_item_price")
      .textContent();
    expect(actualPrices?.trim()).toEqual(price);
  }
});

test("the product is successfully added to the cart", async ({ page }) => {
  await page.locator("#add-to-cart-sauce-labs-backpack").click();
  await expect(page.locator(".shopping_cart_badge")).toHaveText("1");
});
