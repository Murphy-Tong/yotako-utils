"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombinePaginationImpl = void 0;
const Vue = __importStar(require("vue"));
const vue_1 = require("vue");
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_START = 1;
class CombinePaginationImpl {
    refreshing;
    loading;
    hasMore;
    error;
    data;
    extra;
    userPgs;
    constructor(pgs = []) {
        this.userPgs = pgs;
        this.refreshing = (0, vue_1.computed)(() => {
            return pgs.some((p) => p.refreshing.value);
        });
        this.loading = (0, vue_1.computed)(() => {
            return pgs.some((p) => p.loading.value);
        });
        this.hasMore = (0, vue_1.computed)(() => {
            return pgs.some((p) => p.hasMore.value);
        });
        this.error = (0, vue_1.computed)(() => {
            return pgs.some((p) => p.error.value);
        });
        this.extra = Vue.ref();
        this.data = Vue.ref([]);
    }
    async _load(refresh = false, extra) {
        // 避免重复请求
        const vals = [];
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
    load(extra) {
        // 避免重复请求
        return this._load(false, extra);
    }
    refresh(extra) {
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
exports.CombinePaginationImpl = CombinePaginationImpl;
class PaginationImpl {
    currentLoadedPage;
    refreshing;
    loading;
    hasMore;
    error;
    data;
    extra;
    userInitPage = DEFAULT_PAGE_START;
    userPageSize = DEFAULT_PAGE_SIZE;
    userLoadFn;
    constructor(loadFn, initPage, pageSize) {
        this.currentLoadedPage = Vue.ref(initPage - 1);
        this.refreshing = Vue.ref(false);
        this.loading = Vue.ref(false);
        this.error = Vue.ref(false);
        this.hasMore = Vue.ref(true);
        this.extra = Vue.ref();
        this.data = Vue.ref([]);
        this.userInitPage = initPage;
        this.userPageSize = pageSize;
        this.userLoadFn = loadFn;
    }
    async _load(extra) {
        this.loading.value = true;
        let targetPage = this.refreshing.value
            ? this.userInitPage
            : this.currentLoadedPage.value + 1;
        try {
            const res = await this.userLoadFn(targetPage, this.userPageSize, extra);
            if (targetPage === this.currentLoadedPage.value) {
                return this.data.value;
            }
            if (this.refreshing.value) {
                this.data.value = res.res || [];
            }
            else {
                this.data.value = this.data.value.concat(res.res || []);
            }
            this.extra.value = res.extra;
            this.hasMore.value = res.hasMore;
            this.currentLoadedPage.value = targetPage;
            this.error.value = false;
        }
        catch (e) {
            console.log(e);
            this.error.value = true;
        }
        return this.data.value;
    }
    async load(extra) {
        // 避免重复请求
        return this._load(extra).finally(() => {
            this.loading.value = false;
            this.refreshing.value = false;
        });
    }
    refresh(extra) {
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
function default_1(loadFn, initPage = DEFAULT_PAGE_START, pageSize = DEFAULT_PAGE_SIZE) {
    return new PaginationImpl(loadFn, initPage, pageSize);
}
exports.default = default_1;
