"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.spinnies = void 0;
const spinnies_1 = __importDefault(require("spinnies"));
exports.spinnies = new spinnies_1.default();
class Logger {
    tag;
    prefix;
    finished = false;
    constructor(tag, prefix, text) {
        this.tag = tag;
        this.prefix = prefix || "";
        if (!globalThis.silientLog) {
            exports.spinnies.add(tag, { text: this.modifyText(text), status: "spinning" });
        }
    }
    modifyText(text) {
        if (globalThis.silientLog) {
            return;
        }
        if (!this.prefix) {
            return text;
        }
        return `${this.prefix}: ${text}`;
    }
    success(text) {
        if (globalThis.silientLog) {
            return;
        }
        if (this.finished) {
            return;
        }
        this.finished = true;
        exports.spinnies.succeed(this.tag, { text: this.modifyText(text) });
    }
    fail(text) {
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
        exports.spinnies.fail(this.tag, { text: this.modifyText(text) });
    }
    update(text) {
        if (globalThis.silientLog) {
            return;
        }
        if (this.finished) {
            return;
        }
        exports.spinnies.update(this.tag, { text: this.modifyText(text) });
    }
}
exports.Logger = Logger;
