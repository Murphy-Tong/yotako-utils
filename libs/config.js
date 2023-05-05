"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.printAll = exports.getCacheFoler = exports.init = exports.setItem = exports.getItem = void 0;
const node_persist_1 = __importDefault(require("node-persist"));
const path_1 = __importDefault(require("path"));
const DEFAULT_ROOT_FOLDER = path_1.default.relative(__dirname, "../../");
async function getItem(key) {
    return node_persist_1.default.getItem(key);
}
exports.getItem = getItem;
async function setItem(key, val) {
    return node_persist_1.default.setItem(key, val);
}
exports.setItem = setItem;
let CACHE_ROOT_DIR = "";
async function init(configName) {
    CACHE_ROOT_DIR = path_1.default.resolve(global.externalRootFolder || DEFAULT_ROOT_FOLDER, configName);
    await node_persist_1.default.init({
        dir: CACHE_ROOT_DIR,
    });
}
exports.init = init;
function getCacheFoler() {
    return CACHE_ROOT_DIR;
}
exports.getCacheFoler = getCacheFoler;
async function printAll() {
    const ds = await node_persist_1.default.data();
    ds.forEach((val) => {
        console.log(val.key, ":", val.value);
    });
}
exports.printAll = printAll;
