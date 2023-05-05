import { type Ref } from "vue";
export interface PaginationResult<T, E = any> {
    res?: T[];
    hasMore: boolean;
    extra?: E;
}
export declare type LoadFn<T> = (page: number, pageSize: number, extra?: any) => Promise<PaginationResult<T>>;
export interface Pagination<T, E> {
    refreshing: Ref<boolean>;
    loading: Ref<boolean>;
    hasMore: Ref<boolean>;
    error: Ref<boolean>;
    data: Ref<T[]>;
    extra: Ref<E | undefined>;
    load: (extra?: any) => Promise<T[]>;
    refresh: (extra?: any) => Promise<T[]>;
    clear: () => void;
}
export declare class CombinePaginationImpl<T, E> implements Pagination<T, E> {
    refreshing: Ref<boolean>;
    loading: Ref<boolean>;
    hasMore: Ref<boolean>;
    error: Ref<boolean>;
    data: Ref<T[]>;
    extra: Ref<E | undefined>;
    private userPgs;
    constructor(pgs?: Array<Pagination<T, E>>);
    private _load;
    load(extra?: any): Promise<T[]>;
    refresh(extra?: any): Promise<T[]>;
    clear(): void;
}
export default function <T = any, E = any>(loadFn: LoadFn<T>, initPage?: number, pageSize?: number): Pagination<T, E>;
