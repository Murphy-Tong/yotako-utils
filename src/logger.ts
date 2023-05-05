import Spinnies from "spinnies";

export const spinnies = new Spinnies();

declare global {
  var silientLog: boolean;
  var logErrorWhenSilient: boolean;
}

export class Logger {
  tag: string;
  prefix: string;
  finished = false;
  constructor(tag: string, prefix: string, text: string) {
    this.tag = tag;
    this.prefix = prefix || "";
    if (!globalThis.silientLog) {
      spinnies.add(tag, { text: this.modifyText(text), status: "spinning" });
    }
  }

  modifyText(text: string) {
    if (globalThis.silientLog) {
      return;
    }
    if (!this.prefix) {
      return text;
    }
    return `${this.prefix}: ${text}`;
  }

  success(text: string) {
    if (globalThis.silientLog) {
      return;
    }
    if (this.finished) {
      return;
    }
    this.finished = true;
    spinnies.succeed(this.tag, { text: this.modifyText(text) });
  }

  fail(text: string) {
    if (this.finished) {
      return;
    }
    if (globalThis.silientLog) {
      if (globalThis.logErrorWhenSilient) {
        console.error(text);
      }
      return;
    }
    this.finished = true;
    spinnies.fail(this.tag, { text: this.modifyText(text) });
  }

  update(text: string) {
    if (globalThis.silientLog) {
      return;
    }
    if (this.finished) {
      return;
    }
    spinnies.update(this.tag, { text: this.modifyText(text) });
  }
}
