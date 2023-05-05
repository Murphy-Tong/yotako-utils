import { type Ref } from "vue";
declare type Callback<P = void, R = void, P2 = void> = {
    (data: P, p2: P2): R;
};
export declare type IUseFetch<T = void, R = void> = {
    data: Ref<R | null>;
    loading: Ref<boolean>;
    error: Ref<boolean>;
    /**
     * 刷新数据
     */
    invoke: (data: T) => Promise<R>;
    /**
     * 设置为null或data
     */
    reset: (data?: R) => void;
};
export declare type IUseFetchProps<R = void> = Pick<IUseFetch<any, R>, "data" | "loading">;
export declare type IUseFetchActions<T = void, R = void> = Pick<IUseFetch<T, R>, "invoke" | "reset">;
export declare type FetchOptions<R> = {
    now?: boolean;
    initial?: R;
    onload?: (res: R) => void;
};
export declare type FetchFn<T, R> = Callback<T, Promise<R>>;
export declare function useLazyFetch<T = void, R = void>(req: FetchFn<T, R>, opt?: FetchOptions<R>): IUseFetch<T, R>;
export default function useFetch<T = void, R = void>(req: FetchFn<T, R>, opt?: FetchOptions<R>): IUseFetch<T, R>;
export {};
