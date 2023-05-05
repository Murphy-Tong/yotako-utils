import { getCurrentInstance, onUnmounted } from "vue";

export type Observer = (...args: any) => void;

export type Subscriber = {
  subscribe: (event: string, observer: Observer) => () => void;
  notify: (event: string, ...args: any) => void;
};

const MAP = new Map<object, Subscriber>();

function getObsever() {
  let curIns = getCurrentInstance();
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
export function useSubscribe(event: string, observer: Observer) {
  return getObsever()?.subscribe(event, observer);
}

export function useNotfier() {
  const subscribe = getObsever();
  return (event: string, ...args: any) => subscribe?.notify(event, ...args);
}

export function useObserver() {
  const observers: { [key: string]: Observer[] } = {};
  const ins = getCurrentInstance();
  onUnmounted(function () {
    MAP.delete(ins!);
    Object.keys(observers).forEach((key) => {
      delete observers[key];
    });
  });
  const subscribe = function (event: string, observer: Observer) {
    if (!observers[event]) {
      observers[event] = [];
    }
    observers[event].push(observer);
    return function () {
      const subscribes = observers[event];
      if (!subscribes) {
        return;
      }
      observers[event] = subscribes.filter((i: any) => i !== observer);
    };
  };
  const notify = function (event: string, ...args: any) {
    const subscribers = observers[event];
    if (!subscribers?.length) {
      return;
    }
    subscribers.forEach((sub) => {
      sub(...args);
    });
  };
  MAP.set(ins!, { subscribe, notify });
}
