"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQRCode = void 0;
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
function getQRCode(msg, opts) {
    return new Promise((r) => {
        qrcode_terminal_1.default.generate(msg, opts, function (qrcode) {
            r(qrcode);
        });
    });
}
exports.getQRCode = getQRCode;
