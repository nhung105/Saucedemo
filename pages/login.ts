import { Page } from "@playwright/test";

class Login {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
  async navigate() {
    await this.page.goto("https://www.saucedemo.com/");
  }
  async login(username, password) {
    await this.navigate();
    await this.page.locator("#user-name").fill(username);
    await this.page.locator("#password").fill(password);
    await this.page.getByRole("button", { name: "Login" }).click();
  }
}
export default Login;
