import persist from "node-persist";
declare global {
    var externalRootFolder: string;
}
export declare function getItem(key: string): Promise<any>;
export declare function setItem(key: string, val: any): Promise<persist.WriteFileResult>;
export declare function init(configName: string): Promise<void>;
export declare function getCacheFoler(): string;
export declare function printAll(): Promise<void>;
