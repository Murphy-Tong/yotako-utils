export declare type IExec<T = any> = () => Promise<T>;
export declare const ERROR: unique symbol;
export declare class Task<T = any> {
    canceled: boolean;
    exec: IExec<T>;
    wrappedExec: Promise<T | typeof ERROR>;
    resolve: ((v: T | typeof ERROR) => void) | undefined;
    reject: ((r?: any) => void) | undefined;
    noError?: boolean;
    constructor(exec: IExec<T>);
    run(): Promise<void>;
    get(): Promise<T | typeof ERROR>;
    cancel(): void;
}
export declare type IOption = {
    limit?: number;
    noError?: boolean;
};
export declare class ConcurrentRunner {
    tasks: Task[];
    currentRunning: number;
    opt: Required<IOption>;
    constructor(opt?: IOption);
    push<V>(task: Task<V> | IExec, first?: boolean): Task<V>;
    addFirst<V>(task: Task<V> | IExec<V>): Task<V>;
    cancelAll(): void;
    private checkRun;
}
