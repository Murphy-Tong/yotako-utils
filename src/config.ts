import persist from "node-persist";
import path from "path";

declare global {
  var externalRootFolder: string;
}

const DEFAULT_ROOT_FOLDER = path.relative(__dirname, "../../");

export async function getItem(key: string) {
  return persist.getItem(key);
}

export async function setItem(key: string, val: any) {
  return persist.setItem(key, val);
}

let CACHE_ROOT_DIR = "";
export async function init(configName: string) {
  CACHE_ROOT_DIR = path.resolve(
    global.externalRootFolder || DEFAULT_ROOT_FOLDER,
    configName
  );

  await persist.init({
    dir: CACHE_ROOT_DIR,
  });
}

export function getCacheFoler() {
  return CACHE_ROOT_DIR;
}

export async function printAll() {
  const ds = await persist.data();
  ds.forEach((val) => {
    console.log(val.key, ":", val.value);
  });
}
