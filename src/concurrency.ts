export type IExec<T = any> = () => Promise<T>;

const NOOP = () => {};

export const ERROR = Symbol("concurrent runner raise silience ERROR");

export class Task<T = any> {
  canceled: boolean = false;
  exec: IExec<T>;
  wrappedExec: Promise<T | typeof ERROR>;
  resolve: ((v: T | typeof ERROR) => void) | undefined;
  reject: ((r?: any) => void) | undefined;
  noError?: boolean;

  constructor(exec: IExec<T>) {
    this.exec = exec;
    this.wrappedExec = new Promise((r, j) => {
      this.resolve = r;
      this.reject = j;
    });
  }

  run(): Promise<void> {
    return this.exec()
      .then((v) => {
        this.resolve!(v);
      })
      .catch((e) => {
        if (this.noError) {
          this.resolve!(ERROR);
        } else {
          this.reject!(e);
        }
      });
  }

  get(): Promise<T | typeof ERROR> {
    return this.wrappedExec;
  }

  cancel() {
    if (this.canceled) {
      return;
    }
    this.canceled = true;
    this.reject!(new Error("user canceled"));
  }
}

export type IOption = {
  limit?: number;
  noError?: boolean;
};

const DEFAULT_OPT = {
  limit: 5,
  noError: false,
};
export class ConcurrentRunner {
  tasks: Task[] = [];
  currentRunning = 0;
  opt: Required<IOption>;
  constructor(opt: IOption = {}) {
    this.opt = {
      ...DEFAULT_OPT,
      ...opt,
    };
  }

  push<V>(task: Task<V> | IExec, first = false): Task<V> {
    let t: Task | undefined;
    t =
      (task as any).run && typeof (task as any).run === "function"
        ? (task as Task)
        : new Task(task as IExec);
    if (t!.canceled) {
      return t!;
    }
    if (first) {
      this.tasks.unshift(t!);
    } else {
      this.tasks.push(t!);
    }
    this.checkRun();
    return t!;
  }

  addFirst<V>(task: Task<V> | IExec<V>): Task<V> {
    return this.push(task, true);
  }

  cancelAll() {
    this.tasks.forEach((t) => {
      t.canceled = true;
    });
    this.tasks = [];
  }

  private checkRun() {
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
