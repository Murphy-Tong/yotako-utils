import { onMounted, onUnmounted, ref, type Ref } from "vue";

type Callback<P = void, R = void, P2 = void> = {
  (data: P, p2: P2): R;
};

export type IUseFetch<T = void, R = void> = {
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
export type IUseFetchProps<R = void> = Pick<IUseFetch<any, R>, "data" | "loading">;
export type IUseFetchActions<T = void, R = void> = Pick<IUseFetch<T, R>, "invoke" | "reset">;
export type FetchOptions<R> = {
  now?: boolean;
  initial?: R;
  onload?: (res: R) => void;
};

export type FetchFn<T, R> = Callback<T, Promise<R>>;

export function useLazyFetch<T = void, R = void>(req: FetchFn<T, R>, opt: FetchOptions<R> = { now: false }): IUseFetch<T, R> {
  return useFetch(req, opt);
}

export default function useFetch<T = void, R = void>(req: FetchFn<T, R>, opt: FetchOptions<R> = { now: true }): IUseFetch<T, R> {
  const loading = ref(false);
  const error = ref(false);
  const data = ref(opt.initial as R) as Ref<R | null>;
  let isDeattach = false;

  const invoke = function (args: T): Promise<R> {
    loading.value = true;
    return req
      .call(null, args)
      .then((r: R) => {
        if (isDeattach) {
          return r;
        }
        data.value = r;
        error.value = false;
        opt?.onload?.(r);
        return r;
      })
      .catch(function (e) {
        error.value = true;
        throw e;
      })
      .finally(function () {
        if (isDeattach) {
          return;
        }
        loading.value = false;
      });
  };

  const reset = function (newVal?: R) {
    data.value = newVal ?? null;
  };

  onMounted(function () {
    isDeattach = false;
    if (opt?.now) {
      invoke(null as unknown as T);
    }
  });

  onUnmounted(function () {
    isDeattach = true;
  });

  return {
    error,
    reset,
    invoke,
    loading,
    data,
  };
}
