import { test, request, expect, APIRequestContext } from "@playwright/test";
let apiContext: APIRequestContext;
let token: string;
let bookingId: number;
const baseURL = "https://restful-booker.herokuapp.com";
let createResponse: any;
let responseBody: any;
const bookingData = {
  "firstname": "Jim",
  "lastname": "Brown",
  "totalprice": 111,
  "depositpaid": true,
  "bookingdates": {
    "checkin": "2018-01-01",
    "checkout": "2019-01-01"
  },
  "additionalneeds": "Breakfast"
}

test.beforeAll(async () => {
  apiContext = await request.newContext({ ignoreHTTPSErrors: true, baseURL: baseURL })
  // create token 
  const authResponse = await apiContext.post("/auth", {
    data: {
      "username": "admin",
      "password": "password123"
    }
  })
  const authResponseBody = await authResponse.json();
  token = authResponseBody.token;

  // create a bookingID
  createResponse = await apiContext.post("/booking", {
    data: bookingData
  })
  responseBody = await createResponse.json();
  bookingId = responseBody.bookingid;
})
test.describe('Level 1: Basic HTTP requests', () => {
  test("1. Get a list of all bookings", async () => {
    const response = await apiContext.get("/booking");
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBeGreaterThan(0);
  });
  test("2. Get details of a specific booking by a valid ID", async () => {
    const response = await apiContext.get("booking/2");
    expect(response.status()).toBe(200);
    const data = await response.json();
    console.log(data);
    expect(data).toHaveProperty("firstname")
    expect(data).toHaveProperty("lastname")
    expect(data).toHaveProperty("totalprice")
    expect(data).toHaveProperty("depositpaid")
    expect(data).toHaveProperty("bookingdates")
  });

  test("3. Get details of a specific booking by an invalid ID", async () => {
    const response = await apiContext.get("booking/999122");
    expect(response.ok()).not.toBeTruthy()
    expect(response.status()).toBe(404);
    const errorMessage = await response.text();
    expect(errorMessage).toBe("Not Found")
  });

  test('4. Search bookings by first name and lastname', async () => {
    const response = await apiContext.get("/booking?firstname=Sally&lastname=Brown");
    expect(response.status()).toBe(200)
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy()
  })
})

test.describe('Level 2: Use HTTP POST and Authentication', () => {
  test('5. Check response and extract bookingid and store bookingid', async () => {
    expect(createResponse.status()).toBe(200);
    expect(responseBody).toHaveProperty("bookingid")
    expect(responseBody.booking).toMatchObject(bookingData)
    bookingId = await responseBody.bookingid;
    console.log("Booking id: ", bookingId);
  })


  test('6. Create an auth token (login)', async () => {
    console.log("Token: ", token);
  })
})


test.describe('Level 3: Update and Delete (requires auth)', () => {


  test('7. Update a booking using PUT', async () => {
    const updatedResponse = await apiContext.put(`/booking/${bookingId}`, {
      data: {
        firstname: "Nguyen",
        lastname: "Nhung",
        "totalprice": 111,
        "depositpaid": true,
        "bookingdates": {
          "checkin": "2018-01-01",
          "checkout": "2019-01-01"
        },
        "additionalneeds": "Breakfast"

      },
      headers: {
        Cookie: `token=${token}`
      }
    })
    expect(updatedResponse.status()).toBe(200);
    const updatedResponseBody = await updatedResponse.json();
    expect(updatedResponseBody.firstname).toBe("Nguyen");
    expect(updatedResponseBody.lastname).toBe("Nhung");

  })
  test('8. Partially update a booking using PATCH', async () => {
    const updatedResponse = await apiContext.patch(`/booking/${bookingId}`, {
      data: {
        firstname: "Nguyen"
      },
      headers: {
        Cookie: `token=${token}`
      }
    })
    expect(updatedResponse.status()).toBe(200);
    const updatedResponseBody = await updatedResponse.json();
    expect(updatedResponseBody.firstname).toBe("Nguyen");
  })

  test('9. Delete a booking', async () => {
    const response = await apiContext.delete(`/booking/${bookingId}`,
      {
        headers: {
          Cookie: `token=${token}`
        }
      }
    );
    expect(response.status()).toBe(201);

    // fetch it again and should return 404
    const responseAfterDeleted = await apiContext.get(`/booking/${bookingId}`);
    expect(responseAfterDeleted.status()).toBe(404);
  })
})

test.describe('Level 4: Edge Cases & Negative Tests', () => {
  test('10. Try accessing a booking with an invalid ID', async () => {
    const response = await apiContext.get('/booking/999999');
    expect(response.status()).toBe(404);
    const responseBody = await response.text()
    console.log(responseBody)
  })
  test('11. Try creating a booking with missing fields which are firstname and totalprice ', async () => {
    const response = await apiContext.post("/booking", {
      data: {
        "lastname": "Brown",
        "depositpaid": true,
        "bookingdates": {
          "checkin": "2018-01-01",
          "checkout": "2019-01-01"
        },
        "additionalneeds": "Breakfast"
      }
    })
    expect(response.status()).toBe(500);
  })

  test('12. Try updating or deleting a booking without authentication', async () => {
    const response = await apiContext.delete(`/booking/${bookingId}`);
    expect(response.status()).toBe(403);
  })
})






