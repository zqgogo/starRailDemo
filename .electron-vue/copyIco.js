const fs = require("fs");
const fsextra = require("fs-extra");

let icoPath = "appIcon.png";
try {
  fs.accessSync(icoPath, fs.constants.F_OK);
  fsextra.copySync(icoPath, `build/win-unpacked/${icoPath}`);
} catch (error) {}
