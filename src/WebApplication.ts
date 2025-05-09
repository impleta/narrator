import {Browser, BrowserContext, Page, chromium} from 'playwright';

/**
 * Represents a web application that manages browser instances and contexts using Playwright.
 */
export class WebApplication {

  private _headless: boolean = true;
  private  _browserInitialized = false;

  /**
   * Gets the headless mode setting.
   * @returns {boolean} True if headless mode is enabled, otherwise false.
   */
  public get headless(): boolean {
    return this._headless;
  }

  /**
   * Sets the headless mode setting.
   * @param {boolean} value - True to enable headless mode, false to disable.
   * @throws {Error} If the browser has already been initialized.
   */
  public set headless(value: boolean) {
    if(this._browserInitialized) {
      throw new Error('Cannot set headless after browser has been initialized');
    }
    this._headless = value;
  }

  private _browser: Browser | null = null;

  /**
   * Gets the browser instance.
   * @returns {Browser | null} The browser instance or null if not initialized.
   */
  public get browser(): Browser | null {
    return this._browser;
  }

  /**
   * Sets the browser instance.
   * @param {Browser | null} value - The browser instance to set.
   */
  public set browser(value: Browser | null) {
    this._browser = value;
  }
  
  private _context: BrowserContext | null = null;

  /**
   * Gets the browser context.
   * @returns {BrowserContext | null} The browser context or null if not initialized.
   */
  public async getContext(): Promise<BrowserContext | null> {
    await WebApplication.retryUntil(
      () => this._context != null,
      5000, // Total time to wait in milliseconds
      10, // Time period between retries in milliseconds
      "Initialization timed out after 5 seconds."
    );

    return this._context;
  }

  /**
   * Retries a condition until it is met or the timeout is reached.
   * @param {() => boolean} condition - The condition to evaluate.
   * @param {number} [totalTimeToWait=5000] - The total time to wait in milliseconds.
   * @param {number} [timeBetweenRetries=10] - The time interval between retries in milliseconds.
   * @param {string} [messageOnTimeout="Condition not met within the specified time."] - The error message to throw if the timeout is reached.
   * @throws {Error} If the condition is not met within the specified time.
   */
  static async retryUntil(
    condition: () => boolean, 
    totalTimeToWait: number = 5000, 
    timeBetweenRetries: number = 10,
    messageOnTimeout: string = "Condition not met within the specified time."
  ) {
    const startTime = Date.now();

    while (!condition()) {
      if (Date.now() - startTime > totalTimeToWait) {
        throw new Error(messageOnTimeout);
      }
      await new Promise(resolve => setTimeout(resolve, timeBetweenRetries));
    }
  }
  
  
  private static registeredInstances: WebApplication[] = [];

  /**
   * Decorator to register an instance of WebApplication.
   * @param {Object} target - The target object.
   * @param {string} propertyKey - The name of the method.
   * @param {PropertyDescriptor} descriptor - The method descriptor.
   * @returns {PropertyDescriptor} The modified method descriptor.
   */
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

  /**
   * Initializes the web application by launching a browser and creating a context.
   * @param {Object} [args] - Optional arguments for initialization.
   * @param {boolean} [args.headless] - Whether to launch the browser in headless mode.
   */
  @WebApplication.RegisterInstance
  async initialize(args?: {headless: boolean}) {
    if (!args) {
      args = {headless: this.headless};
    }
    this.browser = await chromium.launch(args);
    this._context = await this.browser.newContext();
    this._browserInitialized = true;
  }

  /**
   * Opens a new page and navigates to the specified URL.
   * @param {string} url - The URL to navigate to.
   * @returns {Promise<Page>} The page instance.
   * @throws {Error} If the web application is not initialized.
   */
  async gotoPage(url: string): Promise<Page> {
    const context = await this.getContext();
    if (!context) {
      throw new Error('WebApplication not initialized');
    }
    const page = await context.newPage();
    await page.goto(url);
    return page;
  }

  /**
   * Closes the browser context and browser instance.
   */
  async close() {
    const context = await this.getContext();
    await context!.close();
    await this.browser!.close();
  }

  /**
   * Closes all registered instances of WebApplication.
   */
  static async closeAll() {
    for (const instance of WebApplication.registeredInstances) {
      await instance.close();
    }
  }

  /**
   * Gets all registered instances of WebApplication.
   * @returns {WebApplication[]} The list of registered instances.
   */
  static getInstances() {
    return WebApplication.registeredInstances;
  }
}
