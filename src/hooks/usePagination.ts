import * as Vue from "vue";
import { computed, type Ref } from "vue";

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_START = 1;
export interface PaginationResult<T, E = any> {
  res?: T[];
  hasMore: boolean;
  extra?: E;
}

export type LoadFn<T> = (
  page: number,
  pageSize: number,
  extra?: any
) => Promise<PaginationResult<T>>;

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

export class CombinePaginationImpl<T, E> implements Pagination<T, E> {
  refreshing: Ref<boolean>;
  loading: Ref<boolean>;
  hasMore: Ref<boolean>;
  error: Ref<boolean>;
  data: Ref<T[]>;
  extra: Ref<E | undefined>;

  private userPgs: Array<Pagination<T, E>>;
  constructor(pgs: Array<Pagination<T, E>> = []) {
    this.userPgs = pgs;
    this.refreshing = computed(() => {
      return pgs.some((p) => p.refreshing.value);
    });
    this.loading = computed(() => {
      return pgs.some((p) => p.loading.value);
    });
    this.hasMore = computed(() => {
      return pgs.some((p) => p.hasMore.value);
    });
    this.error = computed(() => {
      return pgs.some((p) => p.error.value);
    });
    this.extra = Vue.ref<E>();
    this.data = Vue.ref<T[]>([]) as Ref<T[]>;
  }

  private async _load(refresh = false, extra?: any) {
    // 避免重复请求
    const vals: T[] = [];
    for (let index = 0; index < this.userPgs.length; index++) {
      const pg = this.userPgs[index];
      if (refresh) {
        const res = await pg.refresh(extra);
        vals.push(...res);
        break;
      }
      if (!pg.hasMore.value) {
        vals.push(...(pg.data.value || []));
        continue;
      }
      const res = await pg.load(extra);
      vals.push(...res);
    }
    this.data.value = vals;
    return this.data.value;
  }

  load(extra?: any) {
    // 避免重复请求
    return this._load(false, extra);
  }

  refresh(extra?: any) {
    for (let index = 0; index < this.userPgs.length; index++) {
      const pg = this.userPgs[index];
      pg.clear();
    }
    return this._load(true, extra);
  }

  clear() {
    this.data.value = [];
    for (let index = 0; index < this.userPgs.length; index++) {
      const pg = this.userPgs[index];
      pg.clear();
    }
  }
}

class PaginationImpl<T, E> implements Pagination<T, E> {
  private currentLoadedPage: Ref<number>;
  refreshing: Ref<boolean>;
  loading: Ref<boolean>;
  hasMore: Ref<boolean>;
  error: Ref<boolean>;
  data: Ref<T[]>;
  extra: Ref<E | undefined>;

  private userInitPage: number = DEFAULT_PAGE_START;
  private userPageSize: number = DEFAULT_PAGE_SIZE;
  private userLoadFn: LoadFn<T>;

  constructor(loadFn: LoadFn<T>, initPage: number, pageSize: number) {
    this.currentLoadedPage = Vue.ref(initPage - 1);
    this.refreshing = Vue.ref(false);
    this.loading = Vue.ref(false);
    this.error = Vue.ref(false);
    this.hasMore = Vue.ref(true);
    this.extra = Vue.ref<E>();
    this.data = Vue.ref<T[]>([]) as Ref<T[]>;
    this.userInitPage = initPage;
    this.userPageSize = pageSize;
    this.userLoadFn = loadFn;
  }

  private async _load(extra?: any) {
    this.loading.value = true;
    let targetPage = this.refreshing.value
      ? this.userInitPage
      : this.currentLoadedPage.value + 1;
    try {
      const res = await this.userLoadFn!(targetPage, this.userPageSize, extra);
      if (targetPage === this.currentLoadedPage.value) {
        return this.data.value;
      }
      if (this.refreshing.value) {
        this.data.value = res.res || [];
      } else {
        this.data.value = this.data.value.concat(res.res || []);
      }
      this.extra.value = res.extra;
      this.hasMore.value = res.hasMore;
      this.currentLoadedPage.value = targetPage;
      this.error.value = false;
    } catch (e) {
      console.log(e);
      this.error.value = true;
    }
    return this.data.value;
  }

  async load(extra?: any) {
    // 避免重复请求
    return this._load(extra).finally(() => {
      this.loading.value = false;
      this.refreshing.value = false;
    });
  }

  refresh(extra?: any) {
    this.refreshing.value = true;
    this.currentLoadedPage.value = this.userInitPage - 1;
    return this.load(extra);
  }

  clear() {
    this.data.value = [];
    this.hasMore.value = true;
    this.refreshing.value = false;
    this.loading.value = false;
    this.error.value = false;
    this.currentLoadedPage.value = this.userInitPage - 1;
  }
}

export default function <T = any, E = any>(
  loadFn: LoadFn<T>,
  initPage = DEFAULT_PAGE_START,
  pageSize = DEFAULT_PAGE_SIZE
): Pagination<T, E> {
  return new PaginationImpl(loadFn, initPage, pageSize);
}
