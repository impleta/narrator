import { chromium, BrowserContext, Page } from 'playwright';
import { WebApplication } from '../WebApplication';

/**
 * Represents a specialized web application for interacting with the GitHub web UI.
 * Extends the functionality of the WebApplication class.
 */
export class GitHubWebUI extends WebApplication {
  /**
   * Gets the singleton instance of GitHubWebUI, initializing it if necessary.
   * @param {Object} [args] - Optional arguments for initialization.
   * @param {boolean} [args.headless] - Whether to launch the browser in headless mode.
   * @returns {Promise<GitHubWebUI>} The singleton instance of GitHubWebUI.
   * @throws {Error} If the headless setting is changed after the instance is created.
   */
  static async launch(args?: {headless: boolean}): Promise<GitHubWebUI> {
    /*
    if (GitHubWebUI._instance) {
      console.log('GitHubWebUI instance already created, returning existing instance');
      if(args && args.headless !== this.headless) {
        throw new Error('Cannot change headless setting after instance has been created');
      }
      return Promise.resolve(GitHubWebUI._instance);
    }
    */
    console.log('Creating new GitHubWebUI instance');
    const instance = new GitHubWebUI();
    await instance.initialize(args);

    return Promise.resolve(instance);
  }
  
  /**
   * Navigates to the GitHub homepage.
   * @returns {Promise<Page>} The page instance for the GitHub homepage.
   */
  async homepage(): Promise<Page> {
    return await this.gotoPage('https://github.com');
  }

  /**
   * Logs into GitHub using the provided username and password.
   * @param {string} username - The GitHub username.
   * @param {string} password - The GitHub password.
   * @returns {Promise<Page>} The page instance after login.
   */
  async login(username: string, password: string): Promise<Page> {
    const page = await this.gotoPage('https://github.com/login');

    const loggedIn = await page.locator('[data-view-component="true"] header .avatar-user').isVisible();
    if (loggedIn) {
      return page;
    }

    await page.fill('input[name="login"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('input[type="submit"]');

    return page;
  }
}