"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useObserver = exports.useNotfier = exports.useSubscribe = void 0;
const vue_1 = require("vue");
const MAP = new Map();
function getObsever() {
    let curIns = (0, vue_1.getCurrentInstance)();
    if (!curIns) {
        return;
    }
    while (true) {
        const subscribe = MAP.get(curIns);
        if (subscribe) {
            return subscribe;
        }
        curIns = curIns?.parent;
        if (!curIns) {
            return;
        }
    }
}
function useSubscribe(event, observer) {
    return getObsever()?.subscribe(event, observer);
}
exports.useSubscribe = useSubscribe;
function useNotfier() {
    const subscribe = getObsever();
    return (event, ...args) => subscribe?.notify(event, ...args);
}
exports.useNotfier = useNotfier;
function useObserver() {
    const observers = {};
    const ins = (0, vue_1.getCurrentInstance)();
    (0, vue_1.onUnmounted)(function () {
        MAP.delete(ins);
        Object.keys(observers).forEach((key) => {
            delete observers[key];
        });
    });
    const subscribe = function (event, observer) {
        if (!observers[event]) {
            observers[event] = [];
        }
        observers[event].push(observer);
        return function () {
            const subscribes = observers[event];
            if (!subscribes) {
                return;
            }
            observers[event] = subscribes.filter((i) => i !== observer);
        };
    };
    const notify = function (event, ...args) {
        const subscribers = observers[event];
        if (!subscribers?.length) {
            return;
        }
        subscribers.forEach((sub) => {
            sub(...args);
        });
    };
    MAP.set(ins, { subscribe, notify });
}
exports.useObserver = useObserver;
