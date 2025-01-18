import {Browser, BrowserContext, Page, chromium} from 'playwright';

export class WebApplication {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private pages: Page[] = [];

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
  async initialize() {
    this.browser = await chromium.launch();
    this.context = await this.browser.newContext();
  }

  async newPage(url: string): Promise<Page> {
    if (!this.context) {
      throw new Error('WebApplication not initialized');
    }
    const page = await this.context.newPage();
    await page.goto(url);
    this.pages.push(page);
    return page;
  }

  getPages(): Page[] {
    return this.pages;
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
}

function CallOnExit(p0: (method: () => Promise<void>) => Promise<void>) {
  return function (
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: Object[]) {
      return p0(() => originalMethod.apply(this, args));
    };
  };
}
