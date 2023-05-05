import Spinnies from "spinnies";
export declare const spinnies: Spinnies;
declare global {
    var silientLog: boolean;
    var logErrorWhenSilient: boolean;
}
export declare class Logger {
    tag: string;
    prefix: string;
    finished: boolean;
    constructor(tag: string, prefix: string, text: string);
    modifyText(text: string): string | undefined;
    success(text: string): void;
    fail(text: string): void;
    update(text: string): void;
}
