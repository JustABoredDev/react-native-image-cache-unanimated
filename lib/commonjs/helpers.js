"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isAndroid = isAndroid;
exports.isImageWithRequire = isImageWithRequire;
exports.isRemoteImage = isRemoteImage;
var _reactNative = require("react-native");
function isRemoteImage(url) {
  /* Check if the URL starts with 'http://' or 'https://' and not a number (using require method) */
  if (!url) {
    return false;
  }
  if (!isImageWithRequire(url) && (url.startsWith('http://') || url.startsWith('https://'))) {
    return true; // remote image
  }

  return false;
}
function isAndroid() {
  return _reactNative.Platform.OS === 'android';
}
function isImageWithRequire(url) {
  return typeof url === 'number';
}
//# sourceMappingURL=helpers.js.map