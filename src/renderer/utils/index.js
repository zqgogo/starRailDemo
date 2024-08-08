const fs = require("fs");

function checkConfig(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

export function deepClone(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (obj instanceof Array) {
    return obj.reduce((arr, item, i) => {
      arr[i] = deepClone(item);
      return arr;
    }, []);
  }

  if (obj instanceof Object) {
    return Object.keys(obj).reduce((newObj, key) => {
      newObj[key] = deepClone(obj[key]);
      return newObj;
    }, {});
  }
}

export function setImgUrl(ImgUrl) {
  if (!!ImgUrl && checkConfig(ImgUrl)) {
    let type = ImgUrl.split(".")[1];
    let data = fs.readFileSync(ImgUrl);
    return `data:image/${type};base64,${new Buffer(data, "binary").toString(
      "base64"
    )}`;
  }
  return ImgUrl;
}
