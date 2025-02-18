import {Browser, BrowserContext, Page, chromium} from 'playwright';

export class WebApplication {

  private static _headless: boolean = true;
  private static _browserInitialized = false;

  public static get headless(): boolean {
    return WebApplication._headless;
  }

  public static set headless(value: boolean) {
    if(WebApplication._browserInitialized) {
      throw new Error('Cannot set headless after browser has been initialized');
    }
    WebApplication._headless = value;
  }
  private _browser: Browser | null = null;
  public get browser(): Browser | null {
    return this._browser;
  }
  public set browser(value: Browser | null) {
    this._browser = value;
  }
  
  private _context: BrowserContext | null = null;
  public get context(): BrowserContext | null {
    return this._context;
  }
  public set context(value: BrowserContext | null) {
    this._context = value;
  }
  
  private static registeredInstances: WebApplication[] = [];

  static RegisterInstance(
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: Object[]) {
      const result = await originalMethod.apply(this, args);
      WebApplication.registeredInstances.push(this as WebApplication);
      return result;
    };

    return descriptor;
  }

  // eslint-disable-next-line prettier/prettier
  @WebApplication.RegisterInstance
  async initialize(args?: {headless: boolean}) {
    if (!args) {
      args = {headless: WebApplication.headless};
    }
    this.browser = await chromium.launch(args);
    this.context = await this.browser.newContext();
    WebApplication._browserInitialized = true;
  }

  async gotoPage(url: string): Promise<Page> {
    if (!this.context) {
      throw new Error('WebApplication not initialized');
    }
    const page = await this.context.newPage();
    await page.goto(url);
    return page;
  }

  async close() {
    await this.context!.close();
    await this.browser!.close();
  }

  static async closeAll() {
    for (const instance of WebApplication.registeredInstances) {
      await instance.close();
    }
  }

  static getInstances() {
    return WebApplication.registeredInstances;
  }
}
