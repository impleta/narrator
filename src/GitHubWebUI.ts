import { chromium, BrowserContext, Page } from 'playwright';
import { WebApplication } from './WebApplication';

export class GitHubWebUI extends WebApplication {
  private static _instance: GitHubWebUI;

  static async getInstance(args?: {headless: boolean}): Promise<GitHubWebUI> {
    if (GitHubWebUI._instance) {

      if(args && args.headless !== WebApplication.headless) {
        throw new Error('Cannot change headless setting after instance has been created');
      }
      return Promise.resolve(GitHubWebUI._instance);
    }

    GitHubWebUI._instance = new GitHubWebUI();
    await GitHubWebUI._instance.initialize(args);

    return  Promise.resolve(GitHubWebUI._instance);
  }

  static async homepage(): Promise<Page> {
    const instance = await GitHubWebUI.getInstance();
    return await instance.gotoPage('https://github.com');
  }

  static async login(username: string, password: string): Promise<Page> {
    const instance = await GitHubWebUI.getInstance();
    const page = await instance.gotoPage('https://github.com/login');

    await page.fill('input[name="login"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('input[type="submit"]');

    // TODO: Figure out how to determine what page loads after login
    

    return page;
  }
}