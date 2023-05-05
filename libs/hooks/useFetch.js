"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLazyFetch = void 0;
const vue_1 = require("vue");
function useLazyFetch(req, opt = { now: false }) {
    return useFetch(req, opt);
}
exports.useLazyFetch = useLazyFetch;
function useFetch(req, opt = { now: true }) {
    const loading = (0, vue_1.ref)(false);
    const error = (0, vue_1.ref)(false);
    const data = (0, vue_1.ref)(opt.initial);
    let isDeattach = false;
    const invoke = function (args) {
        loading.value = true;
        return req
            .call(null, args)
            .then((r) => {
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
    const reset = function (newVal) {
        data.value = newVal ?? null;
    };
    (0, vue_1.onMounted)(function () {
        isDeattach = false;
        if (opt?.now) {
            invoke(null);
        }
    });
    (0, vue_1.onUnmounted)(function () {
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
exports.default = useFetch;
