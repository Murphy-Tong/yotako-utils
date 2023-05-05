export declare type Observer = (...args: any) => void;
export declare type Subscriber = {
    subscribe: (event: string, observer: Observer) => () => void;
    notify: (event: string, ...args: any) => void;
};
export declare function useSubscribe(event: string, observer: Observer): (() => void) | undefined;
export declare function useNotfier(): (event: string, ...args: any) => void | undefined;
export declare function useObserver(): void;
