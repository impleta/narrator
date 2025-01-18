var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { chromium } from 'playwright';
export class WebApplication {
    browser = null;
    context = null;
    pages = [];
    static registeredInstances = [];
    static RegisterInstance(target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            const result = await originalMethod.apply(this, args);
            WebApplication.registeredInstances.push(this);
            return result;
        };
        return descriptor;
    }
    // eslint-disable-next-line prettier/prettier
    async initialize() {
        this.browser = await chromium.launch();
        this.context = await this.browser.newContext();
    }
    async newPage(url) {
        if (!this.context) {
            throw new Error('WebApplication not initialized');
        }
        const page = await this.context.newPage();
        await page.goto(url);
        this.pages.push(page);
        return page;
    }
    getPages() {
        return this.pages;
    }
    async close() {
        await this.context.close();
        await this.browser.close();
    }
    static async closeAll() {
        for (const instance of WebApplication.registeredInstances) {
            await instance.close();
        }
    }
}
__decorate([
    WebApplication.RegisterInstance,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WebApplication.prototype, "initialize", null);
function CallOnExit(p0) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            return p0(() => originalMethod.apply(this, args));
        };
    };
}
//# sourceMappingURL=WebApplication.js.map