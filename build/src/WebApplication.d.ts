import { Page } from 'playwright';
export declare class WebApplication {
    private browser;
    private context;
    private pages;
    private static registeredInstances;
    static RegisterInstance(target: Object, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor;
    initialize(): Promise<void>;
    newPage(url: string): Promise<Page>;
    getPages(): Page[];
    close(): Promise<void>;
    static closeAll(): Promise<void>;
}
