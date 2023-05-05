"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConcurrentRunner = exports.Task = exports.ERROR = void 0;
const NOOP = () => { };
exports.ERROR = Symbol("concurrent runner raise silience ERROR");
class Task {
    canceled = false;
    exec;
    wrappedExec;
    resolve;
    reject;
    noError;
    constructor(exec) {
        this.exec = exec;
        this.wrappedExec = new Promise((r, j) => {
            this.resolve = r;
            this.reject = j;
        });
    }
    run() {
        return this.exec()
            .then((v) => {
            this.resolve(v);
        })
            .catch((e) => {
            if (this.noError) {
                this.resolve(exports.ERROR);
            }
            else {
                this.reject(e);
            }
        });
    }
    get() {
        return this.wrappedExec;
    }
    cancel() {
        if (this.canceled) {
            return;
        }
        this.canceled = true;
        this.reject(new Error("user canceled"));
    }
}
exports.Task = Task;
const DEFAULT_OPT = {
    limit: 5,
    noError: false,
};
class ConcurrentRunner {
    tasks = [];
    currentRunning = 0;
    opt;
    constructor(opt = {}) {
        this.opt = {
            ...DEFAULT_OPT,
            ...opt,
        };
    }
    push(task, first = false) {
        let t;
        t =
            task.run && typeof task.run === "function"
                ? task
                : new Task(task);
        if (t.canceled) {
            return t;
        }
        if (first) {
            this.tasks.unshift(t);
        }
        else {
            this.tasks.push(t);
        }
        this.checkRun();
        return t;
    }
    addFirst(task) {
        return this.push(task, true);
    }
    cancelAll() {
        this.tasks.forEach((t) => {
            t.canceled = true;
        });
        this.tasks = [];
    }
    checkRun() {
        if (!this.tasks.length) {
            return;
        }
        if (this.currentRunning >= this.opt.limit) {
            return;
        }
        while (this.tasks.length && this.currentRunning <= this.opt.limit) {
            this.currentRunning++;
            if (this.currentRunning > this.opt.limit) {
                this.currentRunning--;
                return;
            }
            const t = this.tasks.pop();
            if (!t || t.canceled) {
                this.currentRunning--;
                continue;
            }
            t.noError = this.opt.noError;
            t.run()
                .catch(NOOP)
                .finally(() => {
                this.currentRunning--;
                this.checkRun();
            });
        }
    }
}
exports.ConcurrentRunner = ConcurrentRunner;
