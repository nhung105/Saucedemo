import test, { expect } from "@playwright/test";

test("Get a list of all bookings", async ({ request }) => {
  const response = await request.get(
    "https://restful-booker.herokuapp.com/booking"
  );
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(Array.isArray(data)).toBeTruthy();
  expect(data.length).toBeGreaterThan(0);
});
test("Get details of a specific booking by ID", async ({ request }) => {
  const response = await request.get(
    "https://restful-booker.herokuapp.com/booking/1"
  );
  expect(response.status()).toBe(200);
  const data = await response.json();
  console.log(data);
});
